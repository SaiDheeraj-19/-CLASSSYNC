import React, { useState, useEffect } from 'react';
import { FaPoll, FaCheckCircle, FaChartBar } from 'react-icons/fa';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const PollView = () => {
    const { user } = useAuth();
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(null); // Poll ID being voted on

    useEffect(() => {
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        try {
            const res = await api.get('/polls');
            // Filter to show only active polls or polls the user has already voted in?
            // User request: "only see the poll". Let's show active polls primarily.
            // But usually seeing past polls is nice too. I'll show all for now.
            setPolls(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch polls', err);
            setLoading(false);
        }
    };

    const handleVote = async (pollId, optionIndex) => {
        setVoting(pollId);
        try {
            await api.post(`/polls/${pollId}/vote`, { optionIndex });
            fetchPolls(); // Refresh to see new stats
        } catch (err) {
            console.error('Failed to submit vote', err);
            alert(err.response?.data?.msg || 'Failed to vote');
        } finally {
            setVoting(null);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 h-full">
            <div className="relative w-16 h-16 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin mb-4"></div>
            <p className="text-neon-blue font-orbitron tracking-widest animate-pulse">LOADING POLLS...</p>
        </div>
    );

    const activePolls = polls.filter(p => p.active);
    const closedPolls = polls.filter(p => !p.active);

    return (
        <div className="animate-fade-in max-w-4xl mx-auto space-y-8 font-rajdhani text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white font-orbitron flex items-center gap-3">
                        <FaPoll className="text-neon-purple" /> Student Voice
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Participate in campus decisions</p>
                </div>
            </div>

            <div className="space-y-6">
                {activePolls.length === 0 && (
                    <div className="text-center py-10 bg-black/40 border border-white/10 rounded-xl">
                        <FaChartBar className="text-4xl mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400">No active polls at the moment.</p>
                    </div>
                )}

                {activePolls.map(poll => {
                    const hasVoted = poll.votedBy.includes(user?._id || user?.id);
                    const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);

                    return (
                        <div key={poll._id} className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden relative shadow-lg">
                            <div className="h-1 w-full bg-gradient-to-r from-neon-purple to-neon-blue"></div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-6 font-orbitron">{poll.question}</h3>

                                <div className="space-y-4">
                                    {poll.options.map((option, idx) => {
                                        const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);

                                        if (hasVoted) {
                                            // Results View
                                            return (
                                                <div key={idx} className="relative">
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span className="font-bold text-gray-300">{option.text}</span>
                                                        <span className="text-neon-cyan font-code">{percentage}%</span>
                                                    </div>
                                                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-1000 ease-out"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            // Voting View
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => !voting && handleVote(poll._id, idx)}
                                                    disabled={voting === poll._id}
                                                    className="w-full text-left p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-neon-blue/10 hover:border-neon-blue transition-all group relative overflow-hidden"
                                                >
                                                    <div className="flex items-center justify-between relative z-10">
                                                        <span className="font-bold tracking-wide group-hover:text-neon-blue transition-colors">
                                                            {option.text}
                                                        </span>
                                                        <div className="w-5 h-5 rounded-full border-2 border-gray-500 group-hover:border-neon-blue group-hover:bg-neon-blue/20 transition-all"></div>
                                                    </div>
                                                </button>
                                            );
                                        }
                                    })}
                                </div>

                                {hasVoted && (
                                    <div className="mt-6 flex items-center gap-2 text-neon-green text-sm font-bold bg-neon-green/10 p-3 rounded border border-neon-green/20">
                                        <FaCheckCircle /> Vote Submitted
                                        <span className="ml-auto text-gray-400 font-normal font-code text-xs">Total Votes: {totalVotes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {closedPolls.length > 0 && (
                <div className="pt-8 border-t border-white/10">
                    <h3 className="text-gray-500 font-orbitron uppercase tracking-widest text-sm mb-6">Past Polls</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {closedPolls.map(poll => {
                            const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
                            return (
                                <div key={poll._id} className="bg-black/40 border border-white/5 rounded-lg p-4 opacity-70 hover:opacity-100 transition-opacity">
                                    <h4 className="font-bold text-gray-300 mb-2">{poll.question}</h4>
                                    <div className="text-xs text-gray-500 font-code">
                                        Ended on {new Date(poll.createdAt).toLocaleDateString()} • {totalVotes} Votes
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PollView;
