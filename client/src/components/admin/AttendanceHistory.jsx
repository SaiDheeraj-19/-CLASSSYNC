import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FaSearch, FaFilter, FaDownload, FaChartPie, FaTrash } from 'react-icons/fa';

const AttendanceHistory = () => {
    const [records, setRecords] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedSubject, setSelectedSubject] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [attRes, subRes] = await Promise.all([
                    api.get('/attendance/all'),
                    api.get('/subjects')
                ]);
                setRecords(attRes.data);
                setSubjects(subRes.data);

                // Default to first subject if available
                if (subRes.data.length > 0) {
                    setSelectedSubject(subRes.data[0].name);
                }
            } catch (err) {
                console.error("Error fetching history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredRecords = records.filter(record => {
        const matchSubject = selectedSubject ? record.subject === selectedSubject : true;
        const matchSearch = searchQuery
            ? (record.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.student?.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()))
            : true;
        return matchSubject && matchSearch;
    });

    // Sort by roll number in ascending order with numeric comparison
    filteredRecords.sort((a, b) => {
        const rollA = a.student?.rollNumber || '';
        const rollB = b.student?.rollNumber || '';
        return rollA.localeCompare(rollB, undefined, { numeric: true });
    });

    const getPercentage = (attended, total) => {
        if (!total || total === 0) return 0;
        return Math.round((attended / total) * 100);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) {
            try {
                await api.delete(`/attendance/${id}`);
                setRecords(records.filter(record => record._id !== id));
            } catch (err) {
                console.error("Error deleting record", err);
                alert("Failed to delete record");
            }
        }
    };

    const handleDeleteAll = async () => {
        const confirmMsg = selectedSubject
            ? `Are you sure you want to delete ALL attendance records for "${selectedSubject}"? This will reset attendance for all students in this subject.`
            : 'Are you sure you want to delete ALL attendance records for ALL subjects? This action CANNOT be undone!';

        if (window.confirm(confirmMsg)) {
            // Double confirmation for safety
            if (window.confirm('⚠️ FINAL WARNING: This will permanently delete attendance data. Type "DELETE" to confirm.')) {
                try {
                    // Delete filtered records (by subject if selected)
                    const idsToDelete = filteredRecords.map(r => r._id);
                    await Promise.all(idsToDelete.map(id => api.delete(`/attendance/${id}`)));

                    // Update state
                    setRecords(records.filter(r => !idsToDelete.includes(r._id)));
                    alert(`Successfully deleted ${idsToDelete.length} attendance record(s).`);
                } catch (err) {
                    console.error("Error deleting records", err);
                    alert("Failed to delete some records. Please try again.");
                }
            }
        }
    };

    const getStatusColor = (percentage) => {
        if (percentage >= 75) return 'text-neon-green';
        if (percentage >= 65) return 'text-yellow-400';
        return 'text-red-500';
    };

    return (
        <div className="h-full flex flex-col gap-6 p-4 md:p-0">
            {/* Header / Filters */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white font-orbitron flex items-center gap-2">
                            <FaChartPie className="text-neon-purple" /> Attendance History
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">View cumulative attendance records by subject.</p>
                    </div>
                    {/* Delete All Button */}
                    {filteredRecords.length > 0 && (
                        <button
                            onClick={handleDeleteAll}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold"
                        >
                            <FaTrash /> Delete All {selectedSubject ? `(${selectedSubject})` : ''}
                        </button>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Select Subject</label>
                        <div className="relative">
                            <FaFilter className="absolute left-3 top-3 text-gray-500" />
                            <select
                                className="w-full bg-black/30 border border-white/20 text-white pl-10 pr-4 py-2 focus:outline-none focus:border-neon-purple transition-colors appearance-none"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                            >
                                <option value="" className="bg-cyber-dark">All Subjects</option>
                                {subjects.map(sub => (
                                    <option key={sub._id} value={sub.name} className="bg-cyber-dark">{sub.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Search Student</label>
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-3 text-gray-500" />
                            <input
                                type="text"
                                className="w-full bg-black/30 border border-white/20 text-white pl-10 pr-4 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                placeholder="Search Name or Roll No..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-black/20 sticky top-0 backdrop-blur-md z-10">
                            <tr>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10">Student</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10">Subject</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10 text-center">Total Classes</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10 text-center">Attended</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10 text-center">Percentage</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10 text-right">Last Updated</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-500 animate-pulse">Loading Records...</td></tr>
                            ) : filteredRecords.length > 0 ? (
                                filteredRecords.map(record => {
                                    const percentage = getPercentage(record.attendedClasses, record.totalClasses);
                                    const lastUpdated = new Date(record.updatedAt).toLocaleDateString();
                                    return (
                                        <tr key={record._id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-white">{record.student?.name || 'Unknown'}</div>
                                                <div className="text-xs text-neon-blue font-code">{record.student?.rollNumber || 'N/A'}</div>
                                            </td>
                                            <td className="p-4 text-gray-300 font-code">{record.subject}</td>
                                            <td className="p-4 text-center text-white">{record.totalClasses}</td>
                                            <td className="p-4 text-center text-white">{record.attendedClasses}</td>
                                            <td className={`p-4 text-center font-bold text-lg ${getStatusColor(percentage)}`}>
                                                {percentage}%
                                            </td>
                                            <td className="p-4 text-right text-gray-500 text-sm font-code">
                                                {lastUpdated}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => handleDelete(record._id)}
                                                    className="text-red-500 hover:text-red-400 transition-colors p-2 rounded hover:bg-red-500/10"
                                                    title="Delete Record"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">
                                        No metrics found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Stats */}
                <div className="p-4 border-t border-white/10 bg-black/20 text-xs text-gray-500 flex justify-between">
                    <span>Showing {filteredRecords.length} records</span>
                    <span>ClassSync Attendance Analytics</span>
                </div>
            </div>
        </div>
    );
};

export default AttendanceHistory;
