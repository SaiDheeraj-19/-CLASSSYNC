import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FaCheckCircle, FaExclamationTriangle, FaChartPie, FaHistory, FaCalendarAlt, FaClock, FaList, FaChevronLeft, FaChevronRight, FaThList } from 'react-icons/fa';

const AttendanceView = () => {
    const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'history'
    const [attendance, setAttendance] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter state for history
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSubject, setSelectedSubject] = useState(null);

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
                    {viewMode === 'overview' && <FaChartPie className="text-neon-purple" />}
                    {viewMode === 'subjects' && <FaThList className="text-neon-green" />}
                    {viewMode === 'history' && <FaHistory className="text-neon-blue" />}

                    {viewMode === 'overview' && 'Attendance Dashboard'}
                    {viewMode === 'subjects' && 'Subject Breakdown'}
                    {viewMode === 'history' && 'Detailed History'}
                </h2>

                <div className="flex bg-black/40 p-1 border border-white/10 rounded-lg overflow-x-auto">
                    <button
                        onClick={() => { setViewMode('overview'); setSelectedSubject(null); }}
                        className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-md transition-all whitespace-nowrap ${viewMode === 'overview'
                            ? 'bg-neon-purple text-white shadow-lg'
                            : 'text-gray-400 hover:text-white'}`}
                    >
                        <FaChartPie /> Overview
                    </button>
                    <button
                        onClick={() => { setViewMode('subjects'); setSelectedSubject(null); }}
                        className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-md transition-all whitespace-nowrap ${viewMode === 'subjects'
                            ? 'bg-neon-green text-black shadow-lg'
                            : 'text-gray-400 hover:text-white'}`}
                    >
                        <FaThList /> Subject Details
                    </button>
                    <button
                        onClick={() => { setViewMode('history'); setSelectedSubject(null); }}
                        className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-md transition-all whitespace-nowrap ${viewMode === 'history'
                            ? 'bg-neon-blue text-black shadow-lg'
                            : 'text-gray-400 hover:text-white'}`}
                    >
                        <FaList /> Log History
                    </button>
                </div>
            </div>

            {viewMode === 'overview' && (
                /* OVERVIEW SECTION */
                <section className="animate-fade-in">
                    {attendance.length > 0 ? (
                        <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-8 md:p-12 overflow-hidden shadow-2xl group">
                            {/* HUD Decorative Background */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-purple to-transparent opacity-50"></div>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50"></div>
                            <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-white/10 rounded-tl-3xl pointer-events-none"></div>
                            <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-white/10 rounded-br-3xl pointer-events-none"></div>

                            {/* Scanning Line Effect */}
                            <div className="absolute inset-0 bg-scan-lines opacity-10 pointer-events-none"></div>

                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                {/* Left: HUD Circular Chart */}
                                <div className="relative flex justify-center items-center">
                                    <div className="relative w-64 h-64">
                                        {/* Outer Rotating Ring */}
                                        <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full animate-spin-slow"></div>

                                        {/* Inner Static Ring */}
                                        <div className="absolute inset-4 border border-white/5 rounded-full"></div>

                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            {/* Track */}
                                            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />

                                            {/* Progress */}
                                            <circle
                                                cx="50" cy="50" r="40"
                                                fill="none"
                                                stroke={overallPercentage >= 75 ? '#39ff14' : '#ef4444'}
                                                strokeWidth="6"
                                                strokeDasharray="251.2"
                                                strokeDashoffset={251.2 - (251.2 * overallPercentage) / 100}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000 ease-out"
                                                style={{ filter: `drop-shadow(0 0 8px ${overallPercentage >= 75 ? '#39ff14' : '#ef4444'})` }}
                                            />
                                        </svg>

                                        {/* Central Data */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                            <div className="text-gray-500 font-code text-[10px] uppercase tracking-widest mb-1">Overall</div>
                                            <div className="text-6xl font-bold font-orbitron text-white tracking-tighter flex items-start">
                                                {overallPercentage}<span className="text-2xl mt-1 text-gray-500">%</span>
                                            </div>
                                            <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mt-2 border ${overallPercentage >= 75 ? 'text-neon-green border-neon-green/30 bg-neon-green/10' : 'text-red-500 border-red-500/30 bg-red-500/10'}`}>
                                                {overallPercentage >= 75 ? 'Safe Zone' : 'Critical'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Data Modules */}
                                <div className="space-y-6">
                                    {/* Module 1: Attendance Stats */}
                                    <div className="bg-white/5 border-l-2 border-neon-purple p-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 text-[10px] font-bold text-gray-600 p-2 font-code">DATA_MOD_01</div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-bold">Classes Attended</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl font-bold text-white font-orbitron">{totalAttended}</span>
                                                    <span className="text-gray-500 font-bold">/ {totalClasses}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-neon-purple mb-1 font-bold">MISSED</div>
                                                <div className="text-2xl font-bold text-white font-orbitron">{totalClasses - totalAttended}</div>
                                            </div>
                                        </div>
                                        {/* Mini bar */}
                                        <div className="w-full h-1 bg-gray-800 mt-4 rounded-full overflow-hidden">
                                            <div className="h-full bg-neon-purple" style={{ width: `${(totalAttended / Math.max(totalClasses, 1)) * 100}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Module 2: Status Check */}
                                    <div className={`bg-white/5 border-l-2 ${overallPercentage >= 75 ? 'border-neon-green' : 'border-red-500'} p-6 relative overflow-hidden`}>
                                        <div className="absolute top-0 right-0 text-[10px] font-bold text-gray-600 p-2 font-code">SYS_STATUS</div>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-none border ${overallPercentage >= 75 ? 'border-neon-green/30 text-neon-green bg-neon-green/10' : 'border-red-500/30 text-red-500 bg-red-500/10'}`}>
                                                {overallPercentage >= 75 ? <FaCheckCircle className="text-2xl" /> : <FaExclamationTriangle className="text-2xl animate-pulse" />}
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1 font-bold">Current Standing</p>
                                                <h4 className={`text-xl font-bold font-orbitron ${overallPercentage >= 75 ? 'text-white' : 'text-red-400'}`}>
                                                    {overallPercentage >= 75 ? 'Academic Safe Zone' : 'Attendance Warning'}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1 font-code">
                                                    {overallPercentage >= 75 ? 'Keep up the momentum to maintain eligibility.' : 'Immediate action required to avoid detainment.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 text-center rounded-xl mb-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-scan-lines opacity-10"></div>
                            <FaChartPie className="text-5xl text-gray-500 mx-auto mb-4 relative z-10" />
                            <p className="text-gray-400 font-rajdhani text-lg relative z-10">No system data available. Waiting for attendance records...</p>
                        </div>
                    )}
                </section>
            )}

            {viewMode === 'subjects' && (
                /* SUBJECT CARDS GRID & DETAIL VIEW */
                <div className="animate-fade-in">
                    {!selectedSubject ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {attendance.map((subject) => {
                                const isSafe = subject.status === 'Safe';
                                const percentage = subject.percentage || 0;

                                return (
                                    <div
                                        key={subject._id}
                                        onClick={() => setSelectedSubject(subject)}
                                        className={`
                                            group bg-white/5 border border-white/10 rounded-xl p-5
                                            hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer
                                            flex flex-col gap-4 relative overflow-hidden
                                        `}
                                    >
                                        {/* Simple Status Accent Line at Bottom */}
                                        <div className={`absolute bottom-0 left-0 h-1 w-full ${isSafe ? 'bg-neon-green' : 'bg-red-500'} opacity-50 group-hover:opacity-100 transition-opacity`}></div>

                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-neon-purple transition-colors">
                                                    {subject.subject}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`w-2 h-2 rounded-full ${isSafe ? 'bg-neon-green' : 'bg-red-500'}`}></span>
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        {isSafe ? 'On Track' : 'Low Attendance'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={`text-2xl font-bold font-orbitron ${isSafe ? 'text-white' : 'text-red-400'}`}>
                                                    {Math.round(percentage)}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Simple Standard Progress Bar */}
                                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${isSafe ? 'bg-neon-green' : 'bg-red-500'}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <span>
                                                <strong className="text-white">{subject.attendedClasses}</strong> / {subject.totalClasses} Classes
                                            </span>
                                            {!isSafe && (
                                                <span className="text-red-400 font-bold">
                                                    +{subject.classesNeededToReach75} to safe
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {attendance.length === 0 && (
                                <div className="col-span-full text-center text-gray-500 py-10">
                                    No subjects to display.
                                </div>
                            )}
                        </div>
                    ) : (
                        /* DETAILED SUBJECT VIEW */
                        <div className="animate-slide-in">
                            <button
                                onClick={() => setSelectedSubject(null)}
                                className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold"
                            >
                                <FaChevronLeft /> Back to Subjects
                            </button>

                            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white font-orbitron mb-2">{selectedSubject.subject}</h2>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 text-xs font-bold uppercase rounded border ${selectedSubject.status === 'Safe' ? 'bg-neon-green/10 text-neon-green border-neon-green/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                                                {selectedSubject.status === 'Safe' ? 'Safe Zone' : 'Danger Zone'}
                                            </span>
                                            <span className="text-gray-400 text-sm font-code">
                                                Total Classes: <span className="text-white">{selectedSubject.totalClasses}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-5xl font-bold font-orbitron text-white mb-1">
                                            {Math.round(selectedSubject.percentage || 0)}%
                                        </div>
                                        <p className="text-gray-500 text-xs uppercase tracking-widest">Attendance Score</p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white font-orbitron mb-4 flex items-center gap-2">
                                <FaHistory className="text-neon-blue" /> Class History
                            </h3>

                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                                <div className="divide-y divide-white/5">
                                    {history.filter(h => h.subject === selectedSubject.subject).length > 0 ? (
                                        history
                                            .filter(h => h.subject === selectedSubject.subject)
                                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                                            .map((session, idx) => (
                                                <div key={idx} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-black/40 p-3 rounded text-center min-w-[60px] border border-white/10">
                                                            <div className="text-xs text-gray-500 uppercase">{new Date(session.date).toLocaleString('default', { month: 'short' })}</div>
                                                            <div className="text-lg font-bold text-white font-orbitron">{new Date(session.date).getDate()}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-bold">{new Date(session.date).toLocaleDateString('en-US', { weekday: 'long' })}</div>
                                                            <div className="text-xs text-neon-blue font-code flex items-center gap-1">
                                                                <FaClock /> {session.timeSlot || 'N/A'}
                                                            </div>
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
                                            ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500">
                                            No history records found for this subject.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'history' && (
                /* HISTORY LIST SECTION */
                <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
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
                                                {groupedHistory[dateKey]
                                                    .sort((a, b) => {
                                                        const parseTime = (t) => {
                                                            if (!t) return 0;
                                                            const match = t.match(/(\d+):(\d+)\s?(AM|PM)/i);
                                                            if (!match) return 0;
                                                            let [_, h, m, p] = match;
                                                            h = parseInt(h);
                                                            if (p.toUpperCase() === 'PM' && h !== 12) h += 12;
                                                            if (p.toUpperCase() === 'AM' && h === 12) h = 0;
                                                            return h * 60 + parseInt(m);
                                                        };
                                                        return parseTime(a.timeSlot) - parseTime(b.timeSlot);
                                                    })
                                                    .map((session, idx) => (
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
