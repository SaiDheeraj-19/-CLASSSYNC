import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FaBook, FaDownload, FaSearch } from 'react-icons/fa';

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
        <div className="p-4 md:p-6 pb-20 md:pb-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Study Materials</h2>
                <div className="relative mt-4">
                    <input
                        className="input-field pl-10"
                        placeholder="Search by subject or title..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(r => (
                    <div key={r._id} className="card hover:-translate-y-1 transition-transform">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded uppercase tracking-wider">
                                {r.subject}
                            </span>
                            <span className="text-xs text-gray-400">
                                {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-2">{r.title}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{r.description || 'No description provided.'}</p>

                        <a
                            href={r.link}
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full text-center py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors flex justify-center items-center gap-2 font-medium"
                        >
                            <FaDownload /> Download
                        </a>
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
