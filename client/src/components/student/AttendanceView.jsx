import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FaCheckCircle, FaExclamationTriangle, FaChartPie, FaHistory, FaCalendarAlt, FaClock, FaList, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const AttendanceView = () => {
    const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'history'
    const [attendance, setAttendance] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter state for history
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const [attRes, histRes] = await Promise.all([
                    api.get('/attendance'),
                    api.get('/attendance/history')
                ]);
                setAttendance(attRes.data);
                setHistory(histRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    // Calculate details for Overview
    const totalAttended = attendance.reduce((acc, s) => acc + s.attendedClasses, 0);
    const totalClasses = attendance.reduce((acc, s) => acc + s.totalClasses, 0);
    const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

    // Filter history for selected month
    const getMonthHistory = () => {
        const month = selectedDate.getMonth();
        const year = selectedDate.getFullYear();
        return history.filter(item => {
            const date = new Date(item.date);
            return date.getMonth() === month && date.getFullYear() === year;
        });
    };

    const nextMonth = () => {
        const next = new Date(selectedDate);
        next.setMonth(next.getMonth() + 1);
        if (next <= new Date()) setSelectedDate(next); // Prevent future months
    };

    const prevMonth = () => {
        const prev = new Date(selectedDate);
        prev.setMonth(prev.getMonth() - 1);
        setSelectedDate(prev);
    };

    const monthHistory = getMonthHistory();
    // Group by Date for display
    const groupedHistory = monthHistory.reduce((acc, item) => {
        const dateKey = new Date(item.date).toLocaleDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
    }, {});

    // Sort dates descending
    const sortedDates = Object.keys(groupedHistory).sort((a, b) => new Date(b) - new Date(a));

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-neon-purple text-xl font-orbitron">Loading Attendance...</div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            {/* Header / Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white font-orbitron flex items-center gap-2">
                    {viewMode === 'overview' ? <FaChartPie className="text-neon-purple" /> : <FaHistory className="text-neon-blue" />}
                    {viewMode === 'overview' ? 'Attendance Dashboard' : 'Detailed History'}
                </h2>

                <div className="flex bg-black/40 p-1 border border-white/10 rounded-lg">
                    <button
                        onClick={() => setViewMode('overview')}
                        className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-md transition-all ${viewMode === 'overview'
                            ? 'bg-neon-purple text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'}`}
                    >
                        <FaChartPie /> Overview
                    </button>
                    <button
                        onClick={() => setViewMode('history')}
                        className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-md transition-all ${viewMode === 'history'
                            ? 'bg-neon-blue text-black shadow-lg'
                            : 'text-gray-400 hover:text-white'}`}
                    >
                        <FaList /> Log History
                    </button>
                </div>
            </div>

            {viewMode === 'overview' ? (
                <>
                    {/* OVERVIEW SECTION */}
                    <section>
                        {attendance.length > 0 ? (
                            <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden mb-8">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/10 rounded-full blur-[80px] pointer-events-none"></div>

                                <div className="flex flex-col md:flex-row items-center justify-around gap-8 relative z-10">
                                    {/* Circular Chart */}
                                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                            <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                                            <path
                                                className={`${overallPercentage >= 75 ? 'text-neon-green' : overallPercentage >= 65 ? 'text-yellow-400' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                                strokeDasharray={`${overallPercentage}, 100`}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                                style={{ filter: `drop-shadow(0 0 10px ${overallPercentage >= 75 ? 'rgba(0,255,150,0.5)' : 'rgba(239,68,68,0.5)'})` }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-gray-400 text-xs uppercase tracking-widest mb-1">Total</span>
                                            <span className={`text-5xl sm:text-6xl font-bold font-orbitron ${overallPercentage >= 75 ? 'text-neon-green' : overallPercentage >= 65 ? 'text-yellow-400' : 'text-red-500'}`}>
                                                {overallPercentage}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats Text */}
                                    <div className="text-center md:text-left space-y-4">
                                        <div>
                                            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Classes Attended</p>
                                            <p className="text-4xl font-bold text-white font-orbitron">{totalAttended} <span className="text-2xl text-gray-500">/ {totalClasses}</span></p>
                                        </div>
                                        <div className="h-px bg-white/10 w-full"></div>
                                        <div>
                                            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Status</p>
                                            <p className={`text-xl font-bold ${overallPercentage >= 75 ? 'text-neon-green' : 'text-red-400'} flex items-center gap-2 justify-center md:justify-start`}>
                                                {overallPercentage >= 75 ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                                {overallPercentage >= 75 ? 'Good Standing' : 'Risk Warning'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 text-center rounded-xl mb-8">
                                <FaChartPie className="text-5xl text-gray-500 mx-auto mb-4" />
                                <p className="text-gray-400 font-rajdhani text-lg">No attendance records found yet.</p>
                            </div>
                        )}
                    </section>

                    {/* Subject Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {attendance.map((subject) => {
                            const isSafe = subject.status === 'Safe';
                            const percentage = subject.percentage || 0;

                            return (
                                <div key={subject._id} className={`relative bg-black/40 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border ${isSafe ? 'border-neon-green/20' : 'border-red-500/20'}`}>
                                    <div className={`h-1 w-full ${isSafe ? 'bg-neon-green' : 'bg-red-500'}`}></div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-sm font-bold text-white font-orbitron">{subject.subject}</h3>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${isSafe ? 'text-neon-green' : 'text-red-500'}`}>{subject.status}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="text-2xl font-bold font-orbitron text-white">{Math.round(percentage)}%</span>
                                            <div className="text-xs text-gray-500 uppercase tracking-widest">{subject.attendedClasses} / {subject.totalClasses}</div>
                                        </div>
                                        <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden mb-4">
                                            <div className={`h-full ${isSafe ? 'bg-neon-green' : 'bg-red-500'}`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                        {!isSafe && (
                                            <div className="text-[10px] text-red-400 bg-red-400/5 p-2 border border-red-400/10 italic">
                                                * Need {subject.classesNeededToReach75} more classes for 75%
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                /* HISTORY LIST SECTION */
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Calendar Filter Sidebar */}
                    <div className="lg:w-1/3 space-y-4">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                            <h3 className="text-white font-orbitron font-bold mb-4 flex items-center gap-2">
                                <FaCalendarAlt className="text-neon-blue" /> Monthly Filter
                            </h3>

                            <div className="flex items-center justify-between bg-black/30 p-2 rounded mb-6 border border-white/10">
                                <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-white transition-colors"><FaChevronLeft /></button>
                                <span className="text-white font-bold text-lg font-rajdhani">
                                    {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </span>
                                <button
                                    onClick={nextMonth}
                                    className={`p-2 transition-colors ${selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear() ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
                                    disabled={selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear()}
                                >
                                    <FaChevronRight />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-black/20 p-4 rounded border border-white/5">
                                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Classes</p>
                                    <p className="text-2xl font-bold text-white">{monthHistory.length}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-500/10 p-4 rounded border border-green-500/20">
                                        <p className="text-green-400 text-xs uppercase tracking-wider mb-1">Present</p>
                                        <p className="text-2xl font-bold text-green-400">
                                            {monthHistory.filter(h => h.status === 'Present').length}
                                        </p>
                                    </div>
                                    <div className="bg-red-500/10 p-4 rounded border border-red-500/20">
                                        <p className="text-red-400 text-xs uppercase tracking-wider mb-1">Absent</p>
                                        <p className="text-2xl font-bold text-red-400">
                                            {monthHistory.filter(h => h.status === 'Absent').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Log */}
                    <div className="lg:w-2/3">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden min-h-[500px]">
                            {sortedDates.length > 0 ? (
                                <div className="divide-y divide-white/5">
                                    {sortedDates.map(dateKey => (
                                        <div key={dateKey} className="p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-neon-purple/20 text-neon-purple p-2 rounded">
                                                    <FaCalendarAlt />
                                                </div>
                                                <h4 className="text-white font-bold font-rajdhani text-lg">
                                                    {new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                </h4>
                                            </div>

                                            <div className="space-y-3 pl-4 border-l-2 border-white/10 ml-3">
                                                {groupedHistory[dateKey].map((session, idx) => (
                                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-black/40 p-3 rounded hover:bg-white/5 transition-colors gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-white">{session.subject}</span>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <FaClock className="text-neon-blue" /> {session.timeSlot}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className={`inline-flex items-center px-3 py-1 text-xs font-bold uppercase rounded-full ${session.status === 'Present'
                                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                                }`}>
                                                                {session.status === 'Present' ? <FaCheckCircle className="mr-2" /> : <FaExclamationTriangle className="mr-2" />}
                                                                {session.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                                    <FaCalendarAlt className="text-5xl mb-4 opacity-20" />
                                    <p className="text-lg">No records found for this month.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceView;
