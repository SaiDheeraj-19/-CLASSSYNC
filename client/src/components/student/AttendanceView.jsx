import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FaCheckCircle, FaExclamationTriangle, FaChartPie, FaCalendarAlt, FaClock, FaHistory } from 'react-icons/fa';

const AttendanceView = () => {
    const [attendance, setAttendance] = useState([]);
    const [missedSessions, setMissedSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const [attRes, sessRes] = await Promise.all([
                    api.get('/attendance'),
                    api.get('/attendance/my-sessions')
                ]);
                setAttendance(attRes.data);
                setMissedSessions(sessRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-neon-purple text-xl font-orbitron">Loading Attendance...</div>
        </div>
    );

    // Calculate overall stats
    const totalAttended = attendance.reduce((acc, s) => acc + s.attendedClasses, 0);
    const totalClasses = attendance.reduce((acc, s) => acc + s.totalClasses, 0);
    const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

    return (
        <div className="space-y-10 animate-fade-in max-w-7xl mx-auto">

            {/* SECTION 1: OVERALL ATTENDANCE */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white font-orbitron border-l-4 border-neon-purple pl-4 flex items-center gap-3">
                        <FaChartPie /> Overall Performance
                    </h2>
                </div>

                {attendance.length > 0 ? (
                    <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/10 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="flex flex-col md:flex-row items-center justify-around gap-8 relative z-10">
                            {/* Circular Chart */}
                            <div className="relative w-56 h-56 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-gray-800"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <path
                                        className={`${overallPercentage >= 75 ? 'text-neon-green' : overallPercentage >= 65 ? 'text-yellow-400' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                        strokeDasharray={`${overallPercentage}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        style={{ filter: `drop-shadow(0 0 10px ${overallPercentage >= 75 ? 'rgba(0,255,150,0.5)' : 'rgba(239,68,68,0.5)'})` }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-gray-400 text-xs uppercase tracking-widest mb-1">Total</span>
                                    <span className={`text-6xl font-bold font-orbitron ${overallPercentage >= 75 ? 'text-neon-green' : overallPercentage >= 65 ? 'text-yellow-400' : 'text-red-500'}`}>
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
                                    <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Academic Standing</p>
                                    <p className={`text-2xl font-bold ${overallPercentage >= 75 ? 'text-neon-green' : 'text-red-400'} flex items-center gap-2 justify-center md:justify-start`}>
                                        {overallPercentage >= 75 ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                        {overallPercentage >= 75 ? 'Good Standing' : 'Risk Warning'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 text-center rounded-xl">
                        <FaChartPie className="text-5xl text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 font-rajdhani text-lg">No attendance records found yet.</p>
                    </div>
                )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* SECTION 2: PER SUBJECT ATTENDANCE */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-white font-orbitron border-l-4 border-neon-blue pl-4 flex items-center gap-3">
                        <FaCheckCircle /> Subject-wise Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {attendance.map((subject) => {
                            const isSafe = subject.status === 'Safe';
                            const percentage = subject.percentage || 0;

                            return (
                                <div
                                    key={subject._id}
                                    className={`relative bg-black/40 backdrop-blur-md rounded-xl overflow-hidden shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl group border ${isSafe
                                        ? 'border-neon-green/20 hover:border-neon-green/50'
                                        : 'border-red-500/20 hover:border-red-500/50'
                                        }`}
                                >
                                    <div className={`h-1 w-full ${isSafe ? 'bg-neon-green' : 'bg-red-500'}`}></div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-sm font-bold text-white font-orbitron">{subject.subject}</h3>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${isSafe ? 'text-neon-green' : 'text-red-500'}`}>
                                                {subject.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="text-2xl font-bold font-orbitron text-white">{Math.round(percentage)}%</span>
                                            <div className="text-xs text-gray-500 uppercase tracking-widest">{subject.attendedClasses} / {subject.totalClasses}</div>
                                        </div>
                                        <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden mb-4">
                                            <div
                                                className={`h-full ${isSafe ? 'bg-neon-green' : 'bg-red-500'}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
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
                </div>

                {/* SECTION 3: RECENT ABSENCES */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white font-orbitron border-l-4 border-red-500 pl-4 flex items-center gap-3">
                        <FaHistory /> Recent Absences
                    </h2>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                        {missedSessions.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {missedSessions.map(session => (
                                    <div key={session._id} className="p-4 hover:bg-white/5 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-white font-bold group-hover:text-neon-purple transition-colors">{session.subject}</h4>
                                            <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 uppercase font-bold">Absent</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <FaCalendarAlt className="text-neon-purple" />
                                                {new Date(session.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' }).replace(/\//g, '-')}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FaClock className="text-neon-blue" />
                                                {session.timeSlot || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center">
                                <FaCheckCircle className="text-neon-green text-3xl mx-auto mb-3" />
                                <p className="text-gray-400 text-sm italic">Great job! You haven't missed any classes recently.</p>
                            </div>
                        )}
                        <div className="p-3 bg-black/40 text-[10px] text-gray-600 text-center uppercase tracking-widest font-bold">
                            Showing Last 20 Absences
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceView;
