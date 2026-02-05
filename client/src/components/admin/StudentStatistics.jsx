import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api';
import { FaDownload, FaChartLine, FaSearch } from 'react-icons/fa';

const StudentStatistics = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, attendanceRes] = await Promise.all([
                    api.get('/auth/all-users'),
                    api.get('/attendance/all')
                ]);

                const students = usersRes.data.filter(u => u.role === 'student');
                const allAttendance = attendanceRes.data;

                // Process data
                const processedStats = students.map(student => {
                    // Get all attendance records for this student
                    const studentRecords = allAttendance.filter(r => r.student && (r.student._id === student._id || r.student === student._id));

                    let totalClasses = 0;
                    let attendedClasses = 0;

                    studentRecords.forEach(record => {
                        totalClasses += record.totalClasses || 0;
                        attendedClasses += record.attendedClasses || 0;
                    });

                    const percentage = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(2) : 0;

                    return {
                        id: student._id,
                        name: student.name,
                        rollNumber: student.rollNumber,
                        totalClasses,
                        attendedClasses,
                        percentage: parseFloat(percentage)
                    };
                });

                setStats(processedStats);
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter and sort by roll number in ascending order
    const filteredStats = useMemo(() => {
        const filtered = stats.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
        );
        // Sort by roll number in ascending order with numeric comparison
        return filtered.sort((a, b) => {
            const rollA = a.rollNumber || '';
            const rollB = b.rollNumber || '';
            return rollA.localeCompare(rollB, undefined, { numeric: true });
        });
    }, [stats, searchQuery]);

    const getStatusColor = (pct) => {
        if (pct >= 75) return 'text-neon-green';
        if (pct >= 65) return 'text-yellow-400';
        return 'text-red-500';
    };

    const handleDownload = () => {
        if (filteredStats.length === 0) {
            alert("No data to download");
            return;
        }

        const headers = ['Roll Number', 'Name', 'Total Classes', 'Attended', 'Percentage'];
        const rows = filteredStats.map(s => [
            s.rollNumber,
            `"${s.name}"`,
            s.totalClasses,
            s.attendedClasses,
            `${s.percentage}%`
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_attendance_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white font-orbitron flex items-center gap-2">
                            <FaChartLine className="text-neon-green" /> Student Attendance Analytics
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Overall performance report across all subjects.</p>
                    </div>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 bg-neon-green/20 border border-neon-green text-neon-green hover:bg-neon-green hover:text-black px-4 py-2 transition-colors font-bold text-sm"
                    >
                        <FaDownload /> Download Report
                    </button>
                </div>

                <div className="mt-6">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-500" />
                        <input
                            type="text"
                            className="w-full bg-black/30 border border-white/20 text-white pl-10 pr-4 py-2 focus:outline-none focus:border-neon-green transition-colors"
                            placeholder="Search by Name or Roll Number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-black/20 sticky top-0 backdrop-blur-md z-10">
                            <tr>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10">Roll Number</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10">Name</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10 text-center">Total Classes</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10 text-center">Attended</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10 text-center">Percentage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500 animate-pulse">Loading Analytics...</td></tr>
                            ) : filteredStats.length > 0 ? (
                                filteredStats.map(student => (
                                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-code text-neon-blue">{student.rollNumber}</td>
                                        <td className="p-4 text-white font-bold">{student.name}</td>
                                        <td className="p-4 text-center text-white">{student.totalClasses}</td>
                                        <td className="p-4 text-center text-white">{student.attendedClasses}</td>
                                        <td className={`p-4 text-center font-bold text-lg ${getStatusColor(student.percentage)}`}>
                                            {student.percentage}%
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No students found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-white/10 bg-black/20 text-xs text-gray-500 flex justify-between">
                    <span>Showing {filteredStats.length} students</span>
                    <span>Aggregated Data</span>
                </div>
            </div>
        </div>
    );
};

export default StudentStatistics;
