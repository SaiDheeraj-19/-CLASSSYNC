import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FaBook, FaDownload, FaSearch, FaEye } from 'react-icons/fa';

const ResourceView = () => {
    const [resources, setResources] = useState([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const res = await api.get('/resources');
                setResources(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchResources();
    }, []);

    const filteredResources = resources.filter(r =>
        r.subject.toLowerCase().includes(filter.toLowerCase()) ||
        r.title.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 pb-20 md:pb-6 font-rajdhani">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-white font-orbitron mb-6 text-neon-blue">// Study Materials</h2>
                <div className="relative mt-4">
                    <input
                        className="w-full bg-black/30 border border-white/20 text-white px-4 py-3 pl-10 focus:outline-none focus:border-neon-blue transition-colors rounded-none"
                        placeholder="Search by subject or title..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-3.5 text-gray-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(r => (
                    <div key={r._id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:-translate-y-1 transition-transform group relative overflow-hidden">
                        {/* Decorative Line */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-neon-blue scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>

                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold bg-neon-blue/20 text-neon-blue px-2 py-1 rounded uppercase tracking-wider border border-neon-blue/30">
                                {r.subject}
                            </span>
                            <span className="text-xs text-gray-500 font-code">
                                {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h3 className="font-bold text-xl text-white mb-2 font-orbitron tracking-wide">{r.title}</h3>
                        <p className="text-sm text-gray-400 mb-6 line-clamp-2">{r.description || 'No description provided.'}</p>

                        <div className="flex gap-3 mt-auto">
                            <a
                                href={r.link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 text-center py-2 border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black transition-all duration-300 flex justify-center items-center gap-2 font-bold uppercase text-sm tracking-wider"
                            >
                                <FaEye /> View
                            </a>
                            <a
                                href={r.link}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 text-center py-2 bg-white/5 border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300 flex justify-center items-center gap-2 font-bold uppercase text-sm tracking-wider"
                            >
                                <FaDownload /> Download
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {filteredResources.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <FaBook className="mx-auto text-4xl mb-4 opacity-50" />
                    <p>No study materials found.</p>
                </div>
            )}
        </div>
    );
};

export default ResourceView;
