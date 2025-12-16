import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, AlertCircle, RefreshCw, Play, Timer } from 'lucide-react';
import { Contestant, ContestData, DrawResult, Winner } from '../types';
import { loadContestData, executeLocalDraw, getLocalDrawResults, saveDrawResults, getAvailableTickets } from '../services/drawEngine';

const COUNTDOWN_DURATION_SECONDS = 60;

export function DrawArena() {
  const [contestData, setContestData] = useState<ContestData | null>(null);
  const [drawResults, setDrawResults] = useState<DrawResult[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');
  const [selectedDrawNumber, setSelectedDrawNumber] = useState<number | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);
  const [traversingName, setTraversingName] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const traverseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const vehicleImages: Record<string, string> = {
    'Pulsar NS 125': '/images/pulsar-ns-125.jpg',
    'TVS Jupiter': '/images/tvs-jupiter.jpg',
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (traverseIntervalRef.current) clearInterval(traverseIntervalRef.current);
    };
  }, []);

  const loadData = async () => {
    try {
      const data = await loadContestData();
      setContestData(data);

      const results = getLocalDrawResults();
      setDrawResults(results);

      const completedWinners: Winner[] = results
        .filter(draw => draw.status === 'completed' && draw.winner_id)
        .map(draw => ({
          id: draw.winner_id!,
          name: draw.winner_name || '',
          department: data.contestants.find(c => c.id === draw.winner_id)?.department || '',
          supervisor: data.contestants.find(c => c.id === draw.winner_id)?.supervisor || '',
          prize: draw.prize,
          winningTicket: draw.winning_ticket || '',
          wonAt: draw.drawn_at || '',
        }));

      setWinners(completedWinners);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }
  };

  const completedDraws = drawResults.filter(d => d.status === 'completed').length;

  const handleDrawClick = (drawNumber: number) => {
    const drawResult = drawResults.find(d => d.draw_number === drawNumber);
    if (drawResult && drawResult.status === 'completed') {
      return;
    }
    setSelectedDrawNumber(drawNumber);
  };

  const handleDraw = async () => {
    if (!contestData || selectedDrawNumber === null || isDrawing) return;

    const drawResult = drawResults.find(d => d.draw_number === selectedDrawNumber);
    if (drawResult && drawResult.status === 'completed') {
      return;
    }

    setIsDrawing(true);
    setShowResult(false);
    setSelectedWinner(null);
    setError('');
    setShowConfetti(false);
    setCountdownSeconds(COUNTDOWN_DURATION_SECONDS);

    const availableTickets = getAvailableTickets(contestData.contestants, drawResults);
    const eligibleContestants = contestData.contestants.filter(c =>
      c.tickets.some(t => availableTickets.includes(t))
    );

    if (eligibleContestants.length === 0) {
      setError('No eligible contestants available');
      setIsDrawing(false);
      return;
    }

    let currentIndex = 0;
    traverseIntervalRef.current = setInterval(() => {
      setTraversingName(eligibleContestants[currentIndex % eligibleContestants.length].name);
      currentIndex++;
    }, 100);

    countdownIntervalRef.current = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          if (traverseIntervalRef.current) clearInterval(traverseIntervalRef.current);
          finalizeDraw();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finalizeDraw = async () => {
    if (!contestData || selectedDrawNumber === null) return;

    try {
      const { ticketNumber, contestant } = executeLocalDraw(
        selectedDrawNumber,
        contestData.contestants,
        drawResults
      );

      const drawDef = contestData.draws.find(d => d.drawNumber === selectedDrawNumber);
      const newWinner: Winner = {
        id: contestant.id,
        name: contestant.name,
        department: contestant.department,
        supervisor: contestant.supervisor,
        prize: drawDef?.prize || '',
        winningTicket: ticketNumber,
        wonAt: new Date().toISOString(),
      };

      const newDrawResult: DrawResult = {
        id: `draw-${selectedDrawNumber}`,
        draw_number: selectedDrawNumber,
        prize: drawDef?.prize || '',
        winning_ticket: ticketNumber,
        winner_id: contestant.id,
        winner_name: contestant.name,
        status: 'completed',
        drawn_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const updatedResults = drawResults.map(r =>
        r.draw_number === selectedDrawNumber ? newDrawResult : r
      );

      if (!drawResults.find(r => r.draw_number === selectedDrawNumber)) {
        updatedResults.push(newDrawResult);
      }

      saveDrawResults(updatedResults);
      setDrawResults(updatedResults);

      setWinners([...winners, newWinner]);
      setSelectedWinner(newWinner);
      setTraversingName(contestant.name);
      setShowConfetti(true);

      setTimeout(() => {
        setIsDrawing(false);
        setShowResult(true);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Draw failed');
      setIsDrawing(false);
    }
  };

  const resetDraw = () => {
    setShowResult(false);
    setSelectedWinner(null);
    setSelectedDrawNumber(null);
    setShowConfetti(false);
    setCountdownSeconds(0);
    setTraversingName('');
  };

  if (!contestData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      </div>
    );
  }

  const allDraws = contestData.draws.map(draw => {
    const result = drawResults.find(r => r.draw_number === draw.drawNumber);
    return {
      ...draw,
      status: result?.status || 'pending',
      winning_ticket: result?.winning_ticket || null,
      winner_name: result?.winner_name || null,
    };
  });

  const selectedDraw = selectedDrawNumber ? allDraws.find(d => d.drawNumber === selectedDrawNumber) : null;
  const canStartDraw = selectedDrawNumber !== null && !isDrawing && selectedDraw?.status !== 'completed';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showConfetti && <Confetti />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Draw Arena</h2>
        <p className="text-gray-400 mb-8">Select a draw to start, 2 Pulsar NS 125s, 1 TVS Jupiter</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {allDraws.map(draw => (
            <motion.div
              key={draw.drawNumber}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={draw.status !== 'completed' ? { scale: 1.02 } : {}}
              onClick={() => handleDrawClick(draw.drawNumber)}
              className={`relative cursor-pointer ${
                draw.status === 'completed' ? 'opacity-75 cursor-default' : ''
              } ${
                selectedDrawNumber === draw.drawNumber && draw.status !== 'completed'
                  ? 'ring-2 ring-cyan-500'
                  : ''
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl"></div>
              <div className="relative bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">Draw {draw.drawNumber}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    draw.status === 'completed'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : selectedDrawNumber === draw.drawNumber
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {draw.status === 'completed' ? 'Completed' : selectedDrawNumber === draw.drawNumber ? 'Selected' : 'Pending'}
                  </span>
                </div>

                <img
                  src={vehicleImages[draw.prize]}
                  alt={draw.prize}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23374151"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-size="16"%3E' + encodeURIComponent(draw.prize) + '%3C/text%3E%3C/svg%3E';
                  }}
                />

                <div className="p-3 bg-gray-800/50 rounded-lg mb-3">
                  <p className="text-gray-400 text-xs mb-1">Prize</p>
                  <p className="text-cyan-400 font-bold">{draw.prize}</p>
                </div>

                {draw.status === 'completed' && draw.winning_ticket ? (
                  <>
                    <div className="p-3 bg-gray-800/50 rounded-lg mb-3">
                      <p className="text-gray-400 text-xs mb-1">Winning Ticket</p>
                      <p className="text-white font-bold">#{draw.winning_ticket}</p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Winner</p>
                      <p className="text-blue-400 font-bold">{draw.winner_name}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                    <Play className="w-4 h-4 text-cyan-400 mr-2" />
                    <p className="text-cyan-400 text-sm font-medium">Click to select</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-xl p-8 rounded-3xl border border-gray-700/50 shadow-2xl">
              <div className="flex items-center justify-center mb-8">
                <motion.div
                  animate={
                    isDrawing
                      ? {
                          rotate: [0, 360],
                          scale: [1, 1.1, 1],
                        }
                      : {}
                  }
                  transition={
                    isDrawing
                      ? {
                          rotate: { duration: 0.5, repeat: Infinity, ease: 'linear' },
                          scale: { duration: 0.5, repeat: Infinity },
                        }
                      : {}
                  }
                  className="relative"
                >
                  <div className="w-64 h-64 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/50">
                    <div className="w-56 h-56 rounded-full bg-gray-900 flex items-center justify-center border-4 border-cyan-400/30">
                      {isDrawing ? (
                        <div className="text-center px-4">
                          <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                          <motion.p
                            key={traversingName}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-white font-bold text-lg truncate"
                          >
                            {traversingName}
                          </motion.p>
                        </div>
                      ) : (
                        <Trophy className="w-20 h-20 text-cyan-400" />
                      )}
                    </div>
                  </div>
                  {isDrawing && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400"
                    ></motion.div>
                  )}
                </motion.div>
              </div>

              {isDrawing && countdownSeconds > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-3 mb-6 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/30"
                >
                  <Timer className="w-6 h-6 text-cyan-400" />
                  <span className="text-4xl font-bold text-cyan-400">{countdownSeconds}s</span>
                </motion.div>
              )}

              <div className="text-center mb-6">
                {selectedDrawNumber ? (
                  <>
                    <p className="text-gray-400 text-sm mb-2">Draw {selectedDrawNumber}</p>
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                      {selectedDraw?.prize}
                    </h3>
                  </>
                ) : (
                  <p className="text-gray-400">Select a draw above to start</p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {selectedDrawNumber && selectedDraw?.status === 'completed' && (
                <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-xl mb-4">
                  <Trophy className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-green-400 text-sm">This draw has already been completed!</p>
                </div>
              )}

              {!selectedDrawNumber && !error && (
                <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-4">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <p className="text-yellow-400 text-sm">Please select a draw from above</p>
                </div>
              )}

              <motion.button
                onClick={handleDraw}
                disabled={!canStartDraw}
                whileHover={canStartDraw ? { scale: 1.02 } : {}}
                whileTap={canStartDraw ? { scale: 0.98 } : {}}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  canStartDraw
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isDrawing ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Drawing...
                  </span>
                ) : (
                  'Start Draw'
                )}
              </motion.button>

              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <p className="text-gray-400 text-xs mb-1">Total Tickets</p>
                  <p className="text-white font-bold text-lg">
                    {contestData.contestants.reduce((sum, c) => sum + c.tickets.length, 0)}
                  </p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <p className="text-gray-400 text-xs mb-1">Draws Done</p>
                  <p className="text-cyan-400 font-bold text-lg">{completedDraws}/3</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <p className="text-gray-400 text-xs mb-1">Remaining</p>
                  <p className="text-blue-400 font-bold text-lg">{3 - completedDraws}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-xl p-8 rounded-3xl border border-gray-700/50 shadow-2xl h-full">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-400" />
                Winner Announcement
              </h3>

              <AnimatePresence mode="wait">
                {showResult && selectedWinner ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/50"
                    >
                      <Trophy className="w-16 h-16 text-white" />
                    </motion.div>

                    <motion.h4
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-3xl font-bold text-white mb-2"
                    >
                      Congratulations!
                    </motion.h4>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mb-6"
                    >
                      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                        {selectedWinner.name}
                      </p>
                      <p className="text-gray-400 text-sm mb-1">{selectedWinner.department} - {selectedWinner.supervisor}</p>
                      <p className="text-gray-400 text-sm">Ticket #{selectedWinner.winningTicket}</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 }}
                      className="p-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-500/30 mb-6"
                    >
                      <p className="text-gray-400 text-sm mb-1">Prize Won</p>
                      <p className="text-2xl font-bold text-cyan-400">{selectedWinner.prize}</p>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      onClick={resetDraw}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
                    >
                      Continue
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center py-12"
                  >
                    <Sparkles className="w-16 h-16 text-gray-600 mb-4" />
                    <p className="text-gray-500 text-lg">
                      {isDrawing ? 'Selecting a winner...' : selectedDrawNumber ? 'Click "Start Draw" to begin' : 'Select a draw above'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Confetti() {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: ['#06b6d4', '#3b82f6', '#eab308', '#f97316', '#10b981'][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ y: -20, x: `${piece.left}vw`, opacity: 1, rotate: 0 }}
          animate={{
            y: '100vh',
            rotate: 360 * 3,
            opacity: 0,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: piece.color,
            borderRadius: '2px',
          }}
        />
      ))}
    </div>
  );
}
