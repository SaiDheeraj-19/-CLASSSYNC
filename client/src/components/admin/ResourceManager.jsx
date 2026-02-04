import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FaUpload, FaTrash, FaLink } from 'react-icons/fa';

const ResourceManager = () => {
    const [resources, setResources] = useState([]);
    const [subjects, setSubjects] = useState([]); // To populate subject dropdown
    const [formData, setFormData] = useState({ title: '', subject: '', description: '', link: '' });

    const fetchData = async () => {
        try {
            const [resRes, resSub] = await Promise.all([
                api.get('/resources'),
                api.get('/subjects')
            ]);
            setResources(resRes.data);
            setSubjects(resSub.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/resources', formData);
            setFormData({ title: '', subject: '', description: '', link: '' });
            fetchData();
            alert('Note added successfully');
        } catch (err) {
            alert('Failed to add note');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this note?')) return;
        try {
            await api.delete(`/resources/${id}`);
            setResources(resources.filter(r => r._id !== id));
        } catch (err) {
            alert('Failed');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white font-orbitron">
                        <FaUpload className="text-neon-green" /> Upload Note
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <select
                            className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            required
                        >
                            <option value="" className="bg-cyber-dark">Select Subject</option>
                            {subjects.map(s => <option key={s._id} value={s.name} className="bg-cyber-dark">{s.name}</option>)}
                        </select>
                        <input
                            type="text"
                            className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                            placeholder="Title (e.g. Unit 1 Notes)"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        <textarea
                            className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                            placeholder="Description (optional)"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                        <input
                            type="url"
                            className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                            placeholder="Link to File (Google Drive / DropBox)"
                            value={formData.link}
                            onChange={e => setFormData({ ...formData, link: e.target.value })}
                            required
                        />
                        <button className="btn-primary w-full">Add Note</button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-black/20 font-bold text-white font-orbitron">Uploaded Notes</div>
                    <ul className="divide-y divide-white/10">
                        {resources.map(r => (
                            <li key={r._id} className="p-4 hover:bg-white/5 flex justify-between items-start transition-colors">
                                <div>
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                        {r.title}
                                        <span className="text-xs bg-neon-purple/20 text-neon-purple px-2 py-0.5 border border-neon-purple/30">{r.subject}</span>
                                    </h4>
                                    <p className="text-sm text-gray-400 mt-1">{r.description}</p>
                                    <a
                                        href={r.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-neon-blue text-sm flex items-center gap-1 mt-2 hover:text-white transition-colors"
                                    >
                                        <FaLink /> View / Download
                                    </a>
                                </div>
                                <button onClick={() => handleDelete(r._id)} className="text-red-400 hover:text-red-300 transition-colors">
                                    <FaTrash />
                                </button>
                            </li>
                        ))}
                        {resources.length === 0 && <p className="p-8 text-center text-gray-500">No notes uploaded yet.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ResourceManager;
