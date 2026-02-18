import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaChartBar, FaCheckCircle, FaTimesCircle, FaPoll, FaUsers } from 'react-icons/fa';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const PollManager = () => {
    const { user } = useAuth();
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });
    const [expandedPolls, setExpandedPolls] = useState({});

    const fetchPolls = async () => {
        try {
            const res = await api.get('/polls');
            setPolls(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch polls', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolls();
    }, []);

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        try {
            const options = newPoll.options.filter(opt => opt.trim() !== '');
            if (options.length < 2) return alert('At least 2 options required');

            const res = await api.post('/polls', { ...newPoll, options });

            // Immediate UI Update (Optimistic/Local)
            const createdPoll = {
                ...res.data,
                createdBy: { name: user?.name || 'Admin' }, // Manually populate for display
                options: res.data.options || options.map(opt => ({ text: opt, votes: 0, votedBy: [] }))
            };

            setPolls(prev => [createdPoll, ...prev]);

            setNewPoll({ question: '', options: ['', ''] });
            setShowForm(false);
        } catch (err) {
            console.error('Failed to create poll', err);
        }
    };

    const handleDeletePoll = async (id) => {
        if (!window.confirm('Are you sure you want to delete this poll?')) return;
        try {
            await api.delete(`/polls/${id}`);
            fetchPolls();
        } catch (err) {
            console.error('Failed to delete poll', err);
        }
    };

    const handleToggleActive = async (id) => {
        try {
            await api.put(`/polls/${id}/toggle`);
            fetchPolls();
        } catch (err) {
            console.error('Failed to toggle poll status', err);
        }
    };

    const addOption = () => {
        setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
    };

    const updateOption = (index, value) => {
        const newOptions = [...newPoll.options];
        newOptions[index] = value;
        setNewPoll({ ...newPoll, options: newOptions });
    };

    const removeOption = (index) => {
        const newOptions = newPoll.options.filter((_, i) => i !== index);
        setNewPoll({ ...newPoll, options: newOptions });
    };

    const toggleVoters = (pollId) => {
        setExpandedPolls(prev => ({
            ...prev,
            [pollId]: !prev[pollId]
        }));
    };

    if (loading) return <div className="text-white text-center mt-20">Loading Polls...</div>;

    return (
        <div className="animate-fade-in max-w-5xl mx-auto p-6 font-rajdhani text-white">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-3xl font-bold font-orbitron flex items-center gap-3">
                        <FaPoll className="text-neon-purple" /> Poll Management
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Create and manage student polls</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-neon-purple text-white px-4 py-2 hover:bg-neon-purple/80 transition-all font-bold font-orbitron text-sm uppercase clip-path-slant"
                >
                    <FaPlus /> {showForm ? 'Cancel' : 'New Poll'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl mb-8 animate-slide-up">
                    <h3 className="text-xl font-bold mb-4 font-orbitron text-neon-blue">Create New Poll</h3>
                    <form onSubmit={handleCreatePoll} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1 uppercase tracking-wider">Question</label>
                            <input
                                type="text"
                                className="w-full bg-black/30 border border-white/20 text-white px-4 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                value={newPoll.question}
                                onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                                placeholder="Enter poll question..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-1 uppercase tracking-wider">Options</label>
                            {newPoll.options.map((opt, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        className="flex-1 bg-black/30 border border-white/20 text-white px-4 py-2 focus:outline-none focus:border-neon-blue transition-colors"
                                        value={opt}
                                        onChange={(e) => updateOption(index, e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                        required={index < 2}
                                    />
                                    {newPoll.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="px-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-500/30"
                                        >
                                            <FaTimesCircle />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addOption}
                                className="text-xs text-neon-blue hover:text-white transition-colors mt-1 font-bold uppercase tracking-wider"
                            >
                                + Add Another Option
                            </button>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                className="bg-neon-green text-black px-6 py-2 font-bold font-orbitron tracking-wider hover:bg-neon-green/80 transition-colors clip-path-slant"
                            >
                                Publish Poll
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {polls.map((poll) => (
                    <div key={poll._id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden relative group hover:border-neon-purple/50 transition-colors">
                        <div className={`absolute top-0 left-0 w-1 h-full ${poll.active ? 'bg-neon-green' : 'bg-red-500'}`}></div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col gap-2">
                                    <span className={`text-[10px] w-fit font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${poll.active
                                        ? 'bg-neon-green/10 text-neon-green border-neon-green/30'
                                        : 'bg-red-500/10 text-red-500 border-red-500/30'
                                        }`}>
                                        {poll.active ? 'Active' : 'Closed'}
                                    </span>
                                    <span className="text-[10px] w-fit font-bold px-2 py-0.5 rounded border border-neon-blue/30 bg-neon-blue/10 text-neon-blue uppercase tracking-widest">
                                        Posted by {poll.createdBy?.name || 'Admin'}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            // Enhanced CSV with voter names
                                            let csvContent = "data:text/csv;charset=utf-8,Option,Votes,Voters\n";
                                            poll.options.forEach(opt => {
                                                const voterNames = opt.votedBy ? opt.votedBy.map(v => `${v.name} (${v.rollNumber})`).join('; ') : '';
                                                csvContent += `"${opt.text}",${opt.votes},"${voterNames}"\n`;
                                            });

                                            const encodedUri = encodeURI(csvContent);
                                            const link = document.createElement("a");
                                            link.setAttribute("href", encodedUri);
                                            link.setAttribute("download", `poll_results_${poll._id}.csv`);
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                        className="text-gray-400 hover:text-neon-cyan transition-colors"
                                        title="Download Detailed Results"
                                    >
                                        <FaChartBar />
                                    </button>
                                    <button
                                        onClick={() => toggleVoters(poll._id)}
                                        className={`flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded border transition-all ${expandedPolls[poll._id]
                                            ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/50'
                                            : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                                            }`}
                                        title="View Voter Details"
                                    >
                                        <FaUsers /> Voters
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(poll._id)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                        title={poll.active ? 'Close Poll' : 'Reopen Poll'}
                                    >
                                        {poll.active ? <FaTimesCircle /> : <FaCheckCircle />}
                                    </button>
                                    <button
                                        onClick={() => handleDeletePoll(poll._id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        title="Delete Poll"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-4 font-orbitron">{poll.question}</h3>

                            <div className="space-y-3">
                                {poll.options.map((opt, idx) => {
                                    const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
                                    const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);

                                    return (
                                        <div key={idx} className="relative">
                                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                <span>{opt.text}</span>
                                                <span className="text-neon-yellow font-bold">{opt.votes} votes ({percentage}%)</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-neon-purple to-neon-blue"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>

                                            {/* Voter Names List */}
                                            {expandedPolls[poll._id] && (
                                                <div className="pl-2 border-l-2 border-white/10 mb-3 animate-fade-in mt-2">
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Voters:</p>
                                                    {opt.votedBy && opt.votedBy.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {opt.votedBy.map((voter, vIdx) => (
                                                                <span key={vIdx} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-300 border border-white/10">
                                                                    {voter.name || 'Unknown'} ({voter.rollNumber || 'N/A'})
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-[10px] text-gray-600 italic">
                                                            {opt.votes > 0 ? 'Votes recorded before tracking was enabled.' : 'No votes yet for this option.'}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-500 flex items-center justify-between">
                                <span>Total Votes: {poll.options.reduce((acc, curr) => acc + curr.votes, 0)}</span>
                                <span className="font-code">{new Date(poll.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {polls.length === 0 && !loading && (
                <div className="text-center py-20 text-gray-500">
                    <FaChartBar className="text-4xl mx-auto mb-4 opacity-20" />
                    <p>No polls created yet. Start by creating a new one.</p>
                </div>
            )}
        </div>
    );
};

export default PollManager;
