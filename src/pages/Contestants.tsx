import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserCheck, Ticket } from 'lucide-react';
import { Contestant, ContestData, DrawResult } from '../types';

export function Contestants() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [drawResults, setDrawResults] = useState<DrawResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContestData();
  }, []);

  const loadContestData = async () => {
    try {
      const response = await fetch('/contest-data.json');
      const data: ContestData = await response.json();
      setContestants(data.contestants);

      const storedResults = localStorage.getItem('wheels_draw_results');
      if (storedResults) {
        setDrawResults(JSON.parse(storedResults));
      }
    } catch (error) {
      console.error('Failed to load contest data:', error);
    }
  };

  const filteredContestants = contestants.filter((contestant) =>
    contestant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contestant.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contestant.supervisor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isWinner = (id: number) => drawResults.some((d) => d.status === 'completed' && d.winner_id === id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Contestants</h2>
            <p className="text-gray-400">All participants in the lucky draw</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-cyan-400">{contestants.length}</p>
            <p className="text-gray-400 text-sm">Total Contestants</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, department, or supervisor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-xl"></div>
          <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
            {filteredContestants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50 border-b border-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Supervisor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Total Tickets
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {filteredContestants.map((contestant, index) => (
                      <motion.tr
                        key={contestant.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {contestant.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-white font-medium">{contestant.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {contestant.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {contestant.supervisor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-cyan-400" />
                            <span className="text-cyan-400 font-semibold">{contestant.tickets.length}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isWinner(contestant.id) ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
                              <UserCheck className="w-3 h-3" />
                              Winner
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 bg-gray-700/50 text-gray-400 text-xs font-medium rounded-full">
                              Active
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No contestants found</p>
                <p className="text-gray-600 text-sm">
                  {searchQuery ? 'Try a different search term' : 'No contestants available'}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
