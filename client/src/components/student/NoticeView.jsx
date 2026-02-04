import React, { useState, useEffect } from 'react';
import api from '../../api';
import { format } from 'date-fns';
import { FaBullhorn, FaCalendarAlt, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';

const NoticeView = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotice, setSelectedNotice] = useState(null);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const res = await api.get('/notices');
                setNotices(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, []);

    if (loading) return <div>Loading Notices...</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-white font-orbitron">Notices & Events</h2>
            <div className="grid gap-6">
                {notices.map((notice) => (
                    <div
                        key={notice._id}
                        onClick={() => setSelectedNotice(notice)}
                        className="card relative pl-6 border-l-4 border-l-primary hover:translate-x-1 transition-transform cursor-pointer group bg-white/5 backdrop-blur-sm p-4"
                    >
                        <div className="absolute top-6 left-0 -ml-4 w-8 h-8 rounded-full bg-cyber-black border-4 border-primary flex items-center justify-center z-10">
                            {notice.type === 'event' ? <FaCalendarAlt className="text-xs text-primary" /> : <FaBullhorn className="text-xs text-primary" />}
                        </div>

                        <div className="flex justify-between items-start mb-2 ml-4">
                            <div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${notice.type === 'event' ? 'text-neon-purple' : 'text-neon-blue'
                                    }`}>
                                    {notice.type}
                                </span>
                                <h3 className="text-xl font-bold text-white mt-1 group-hover:text-neon-yellow transition-colors">{notice.title}</h3>
                            </div>
                            <span className="text-gray-400 text-sm font-code">{format(new Date(notice.date), 'MMM d, yyyy')}</span>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed ml-4 line-clamp-3">
                            {notice.content}
                        </p>
                    </div>
                ))}
                {notices.length === 0 && <p className="text-gray-500">No notices posted.</p>}
            </div>

            {/* Modal */}
            {selectedNotice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedNotice(null)}
                    ></div>
                    <div className="relative bg-cyber-dark border border-white/20 p-8 max-w-2xl w-full shadow-2xl rounded-sm">
                        <button
                            onClick={() => setSelectedNotice(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <FaTimes size={24} />
                        </button>

                        <div className="mb-6">
                            <span className={`inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider border mb-2 ${selectedNotice.type === 'event'
                                ? 'text-neon-purple border-neon-purple/50 bg-neon-purple/10'
                                : 'text-neon-blue border-neon-blue/50 bg-neon-blue/10'
                                }`}>
                                {selectedNotice.type}
                            </span>
                            <h2 className="text-3xl font-bold text-white font-orbitron">{selectedNotice.title}</h2>
                            <p className="text-gray-400 text-sm mt-1 font-code">{format(new Date(selectedNotice.date), 'MMMM d, yyyy')}</p>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-lg">
                                {selectedNotice.content}
                            </p>
                        </div>

                        {selectedNotice.link && (
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <a
                                    href={selectedNotice.link.startsWith('http') ? selectedNotice.link : `https://${selectedNotice.link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-neon-blue text-black font-bold px-6 py-3 hover:bg-neon-blue/80 transition-colors"
                                >
                                    <FaExternalLinkAlt /> Open Link / Register
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticeView;
