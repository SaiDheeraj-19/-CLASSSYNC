import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FaCheckCircle, FaExclamationTriangle, FaChartPie } from 'react-icons/fa';

const AttendanceView = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await api.get('/attendance');
                setAttendance(res.data);
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
                <h2 className="text-2xl font-bold text-white font-orbitron mb-6 border-l-4 border-neon-purple pl-4 flex items-center gap-3">
                    <FaChartPie /> Overall Performance
                </h2>

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

            {/* SECTION 2: PER SUBJECT ATTENDANCE */}
            {attendance.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white font-orbitron border-l-4 border-neon-blue pl-4 flex items-center gap-3">
                            <FaCheckCircle /> Subject-wise Details
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                    {/* Top Status Bar */}
                                    <div className={`h-1.5 w-full ${isSafe ? 'bg-neon-green' : 'bg-red-500'}`}></div>

                                    <div className="p-6">
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <h3 className="text-lg font-bold text-white font-orbitron leading-tight">{subject.subject}</h3>
                                            <span className={`flex-shrink-0 px-2 py-1 text-[10px] font-bold uppercase rounded tracking-wider ${isSafe
                                                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                                                    : 'bg-red-500/10 text-red-500 border border-red-500/30'
                                                }`}>
                                                {subject.status}
                                            </span>
                                        </div>

                                        <div className="flex items-end justify-between mb-6">
                                            <div>
                                                <span className={`text-4xl font-bold font-orbitron ${isSafe ? 'text-white' : 'text-red-400'}`}>
                                                    {percentage.toFixed(0)}
                                                    <span className="text-lg text-gray-500">%</span>
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 uppercase">Attended</div>
                                                <div className="text-white font-bold text-lg">
                                                    {subject.attendedClasses} <span className="text-gray-600">/ {subject.totalClasses}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${isSafe ? 'bg-neon-green' : 'bg-red-500'}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>

                                        {/* Actionable Insight */}
                                        <div className={`p-3 rounded-lg text-xs border ${isSafe
                                                ? 'bg-neon-green/5 border-neon-green/10 text-neon-green'
                                                : 'bg-red-500/5 border-red-500/10 text-red-400'
                                            }`}>
                                            {!isSafe ? (
                                                <div className="flex items-start gap-2">
                                                    <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                                                    <span>
                                                        Risk! Attend <strong className="text-white underline">{subject.classesNeededToReach75}</strong> more classes to reach 75%.
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <FaCheckCircle className="flex-shrink-0" />
                                                    <span>You are in safe zone. Keep it up!</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
};

export default AttendanceView;
