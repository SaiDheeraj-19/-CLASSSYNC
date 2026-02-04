import React, { useState, useEffect } from 'react';
import api from '../../api';
import { format } from 'date-fns';
import { FaBullhorn, FaCalendarAlt } from 'react-icons/fa';

const NoticeView = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

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
            <h2 className="text-3xl font-bold mb-6">Notices & Events</h2>
            <div className="grid gap-6">
                {notices.map((notice) => (
                    <div key={notice._id} className="card relative pl-6 border-l-4 border-l-primary hover:translate-x-1 transition-transform">
                        <div className="absolute top-6 left-0 -ml-4 w-8 h-8 rounded-full bg-white border-4 border-primary flex items-center justify-center">
                            {notice.type === 'event' ? <FaCalendarAlt className="text-xs text-primary" /> : <FaBullhorn className="text-xs text-primary" />}
                        </div>

                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${notice.type === 'event' ? 'text-purple-600' : 'text-blue-600'
                                    }`}>
                                    {notice.type}
                                </span>
                                <h3 className="text-xl font-bold text-gray-800 mt-1">{notice.title}</h3>
                            </div>
                            <span className="text-gray-400 text-sm">{format(new Date(notice.date), 'MMM d, yyyy')}</span>
                        </div>
                        <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                            {notice.content}
                        </p>
                    </div>
                ))}
                {notices.length === 0 && <p className="text-gray-500">No notices posted.</p>}
            </div>
        </div>
    );
};

export default NoticeView;
