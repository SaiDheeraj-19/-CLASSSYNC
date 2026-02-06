import React, { useState, useEffect } from 'react';
import api from '../../api';
import { format } from 'date-fns';
import { FaTrash, FaPlus } from 'react-icons/fa';

const AssignmentManager = () => {
    const [assignments, setAssignments] = useState([]);
    const [formData, setFormData] = useState({ title: '', description: '', subject: '', deadline: '' });
    const [loading, setLoading] = useState(true);

    const fetchAssignments = async () => {
        try {
            const res = await api.get('/assignments');
            setAssignments(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await api.delete(`/assignments/${id}`);
                setAssignments(assignments.filter(a => a._id !== id));
            } catch (err) {
                console.error(err);
                alert('Failed to delete');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/assignments', formData);
            setFormData({ title: '', description: '', subject: '', deadline: '' });
            fetchAssignments();
        } catch (err) {
            console.error(err);
            alert('Failed to add assignment');
        }
    };

    if (loading) return <div className="text-gray-400">Loading...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 sticky top-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white font-orbitron">
                        <FaPlus className="text-xs text-neon-green" /> Post Assignment
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider">Subject</label>
                            <input
                                type="text"
                                className="w-full mt-1 bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider">Title</label>
                            <input
                                type="text"
                                className="w-full mt-1 bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider">Description</label>
                            <textarea
                                className="w-full mt-1 bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors h-24 resize-none"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider">Deadline</label>
                            <input
                                type="date"
                                className="w-full mt-1 bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                value={formData.deadline}
                                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full">Post Assignment</button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold mb-4 text-white font-orbitron">Posted Assignments</h2>
                {assignments.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No assignments posted yet.</p>
                )}
                {assignments.map(assignment => (
                    <div key={assignment._id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 relative group">
                        <button onClick={() => handleDelete(assignment._id)} className="absolute top-4 right-4 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            <FaTrash />
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-neon-purple/20 text-neon-purple px-2 py-0.5 text-xs font-bold uppercase border border-neon-purple/30">{assignment.subject}</span>
                            <span className="text-sm text-gray-400">{format(new Date(assignment.deadline), 'PPP')}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">{assignment.title}</h3>
                        <p className="text-gray-400 mt-1">{assignment.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssignmentManager;
