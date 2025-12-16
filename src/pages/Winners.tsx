import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Briefcase, User, Award, Download, Sparkles, Ticket, Trash2, X } from 'lucide-react';
import { ContestData, DrawResult } from '../types';

export function Winners() {
  const [contestants, setContestants] = useState<ContestData | null>(null);
  const [drawResults, setDrawResults] = useState<DrawResult[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/contest-data.json');
      const data: ContestData = await response.json();
      setContestants(data);

      const storedResults = localStorage.getItem('wheels_draw_results');
      if (storedResults) {
        setDrawResults(JSON.parse(storedResults));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const completedWinners = drawResults.filter(d => d.status === 'completed');

  const winners = completedWinners.map(draw => {
    const contestant = contestants?.contestants.find(c => c.id === draw.winner_id);
    return {
      ...draw,
      name: draw.winner_name || '',
      department: contestant?.department || '',
      supervisor: contestant?.supervisor || '',
    };
  });

  const exportWinners = () => {
    const dataStr = JSON.stringify(winners, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `winners_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const deleteWinner = (drawId: string) => {
    const updatedResults = drawResults.filter(d => d.id !== drawId);
    localStorage.setItem('wheels_draw_results', JSON.stringify(updatedResults));
    setDrawResults(updatedResults);
    setDeleteConfirmId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Winners History</h2>
            <p className="text-gray-400">View all lucky draw winners</p>
          </div>
          {winners.length > 0 && (
            <motion.button
              onClick={exportWinners}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
            >
              <Download className="w-5 h-5" />
              Export Data
            </motion.button>
          )}
        </div>

        {winners.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {winners.map((winner, index) => (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-6 py-4 border-b border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{winner.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {winner.drawn_at ? new Date(winner.drawn_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }) : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/30">
                          <Award className="w-3 h-3" />
                          Winner #{index + 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
                      <p className="text-gray-400 text-xs mb-1">Prize Won</p>
                      <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        {winner.prize}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-400 text-xs mb-0.5">Department</p>
                          <p className="text-white text-sm">{winner.department}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-gray-400 text-xs mb-0.5">Supervisor</p>
                          <p className="text-white text-sm">{winner.supervisor}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <Ticket className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-gray-400 text-xs mb-0.5">Winning Ticket</p>
                          <p className="text-cyan-400 text-sm font-semibold">#{winner.winning_ticket}</p>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      onClick={() => setDeleteConfirmId(winner.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Winner
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-gray-600/10 blur-xl"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl p-16 text-center">
              <Trophy className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">No Winners Yet</h3>
              <p className="text-gray-400 mb-6">
                Start the draw to select your first lucky winner
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg text-gray-500 text-sm">
                <Sparkles className="w-4 h-4" />
                Head to the Draw Arena to begin
              </div>
            </div>
          </motion.div>
        )}

        {winners.length > 0 && winners.length < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: winners.length * 0.1 + 0.2, duration: 0.5 }}
            className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl"
          >
            <p className="text-cyan-400 text-sm text-center">
              <Trophy className="w-4 h-4 inline mr-2" />
              {3 - winners.length} {3 - winners.length === 1 ? 'prize' : 'prizes'} remaining to be awarded
            </p>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this winner? This will make them eligible for future draws again.
              </p>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setDeleteConfirmId(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => deleteWinner(deleteConfirmId)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
