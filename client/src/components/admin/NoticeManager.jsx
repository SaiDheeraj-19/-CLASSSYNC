import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { format } from 'date-fns';

const NoticeManager = () => {
    const [notices, setNotices] = useState([]);
    const [formData, setFormData] = useState({ title: '', content: '', type: 'notice' });

    const fetchNotices = async () => {
        try {
            const res = await api.get('/notices');
            setNotices(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Delete this notice?')) {
            try {
                await api.delete(`/notices/${id}`);
                setNotices(notices.filter(n => n._id !== id));
            } catch (err) {
                console.error(err);
                alert('Failed to delete');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/notices', formData);
            setFormData({ title: '', content: '', type: 'notice' });
            fetchNotices();
        } catch (err) {
            console.error(err);
            alert('Failed to post');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 sticky top-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white font-orbitron">
                        <FaPlus className="text-xs text-neon-yellow" /> Post Notice
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider">Type</label>
                            <select
                                className="w-full mt-1 bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="notice" className="bg-cyber-dark">Notice</option>
                                <option value="event" className="bg-cyber-dark">Event</option>
                            </select>
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
                            <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider">Content</label>
                            <textarea
                                className="w-full mt-1 bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors h-32 resize-none"
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                required
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider">Link (Optional)</label>
                            <input
                                type="text"
                                placeholder="http://example.com"
                                className="w-full mt-1 bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                value={formData.link || ''}
                                onChange={e => setFormData({ ...formData, link: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full bg-neon-green hover:bg-neon-green/80 text-black font-bold">Post</button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold mb-4 text-white font-orbitron">Current Notices</h2>
                {notices.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No notices posted yet.</p>
                )}
                {notices.map(notice => (
                    <div
                        key={notice._id}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 relative group"
                        style={{ borderLeftWidth: '4px', borderLeftColor: notice.type === 'event' ? '#9d00ff' : '#00d4ff' }}
                    >
                        <button onClick={() => handleDelete(notice._id)} className="absolute top-4 right-4 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            <FaTrash />
                        </button>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${notice.type === 'event' ? 'text-neon-purple' : 'text-neon-blue'}`}>
                                    {notice.type}
                                </span>
                                <h3 className="text-xl font-bold text-white mt-1">{notice.title}</h3>
                            </div>
                            <span className="text-gray-500 text-sm whitespace-nowrap ml-4">{format(new Date(notice.date), 'MMM d, yyyy')}</span>
                        </div>
                        <p className="text-gray-400 whitespace-pre-wrap">{notice.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NoticeManager;
