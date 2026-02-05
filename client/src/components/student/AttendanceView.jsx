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
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-orbitron">My Attendance</h2>

            {/* Overall Stats Card */}
            {attendance.length > 0 && (
                <div className="bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 backdrop-blur-xl border border-neon-purple/30 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider">Overall Attendance</p>
                            <p className={`text-4xl font-bold font-orbitron mt-2 ${overallPercentage >= 75 ? 'text-neon-green' : overallPercentage >= 65 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                {overallPercentage}%
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-400 text-sm">Classes Attended</p>
                            <p className="text-2xl font-bold text-white">{totalAttended} / {totalClasses}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Subject Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attendance.map((subject) => {
                    const isSafe = subject.status === 'Safe';
                    const percentage = subject.percentage || 0;

                    return (
                        <div
                            key={subject._id}
                            className={`relative bg-white/5 backdrop-blur-xl border overflow-hidden transition-all hover:scale-[1.02] ${isSafe
                                    ? 'border-neon-green/30 hover:border-neon-green/60 hover:shadow-[0_0_30px_rgba(0,255,150,0.2)]'
                                    : 'border-red-500/30 hover:border-red-500/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                                }`}
                        >
                            {/* Glow effect at top */}
                            <div className={`absolute top-0 left-0 right-0 h-1 ${isSafe ? 'bg-neon-green' : 'bg-red-500'}`}></div>

                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-xl font-bold text-white font-orbitron">{subject.subject}</h3>
                                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${isSafe
                                            ? 'bg-neon-green/20 text-neon-green border border-neon-green/50'
                                            : 'bg-red-500/20 text-red-400 border border-red-500/50'
                                        }`}>
                                        {subject.status}
                                    </span>
                                </div>

                                {/* Circular Progress */}
                                <div className="flex items-center justify-center mb-6">
                                    <div className="relative w-36 h-36">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                            {/* Background circle */}
                                            <circle
                                                cx="18"
                                                cy="18"
                                                r="15.5"
                                                fill="none"
                                                stroke="rgba(255,255,255,0.1)"
                                                strokeWidth="3"
                                            />
                                            {/* Progress circle */}
                                            <circle
                                                cx="18"
                                                cy="18"
                                                r="15.5"
                                                fill="none"
                                                stroke={isSafe ? '#00FF96' : '#EF4444'}
                                                strokeWidth="3"
                                                strokeDasharray={`${percentage} 100`}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000 ease-out"
                                                style={{
                                                    filter: isSafe ? 'drop-shadow(0 0 8px rgba(0,255,150,0.6))' : 'drop-shadow(0 0 8px rgba(239,68,68,0.6))'
                                                }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className={`text-3xl font-bold font-orbitron ${isSafe ? 'text-neon-green' : 'text-red-400'}`}>
                                                {percentage.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div className="flex justify-around text-center mb-4 py-3 bg-black/20 border-t border-b border-white/10">
                                    <div>
                                        <p className="text-2xl font-bold text-white">{subject.attendedClasses}</p>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Attended</p>
                                    </div>
                                    <div className="border-l border-white/10"></div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">{subject.totalClasses}</p>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Total</p>
                                    </div>
                                </div>

                                {/* Status Message */}
                                {!isSafe && (
                                    <div className="bg-red-500/10 border border-red-500/30 p-4">
                                        <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                                            <FaExclamationTriangle className="animate-pulse" />
                                            Danger Zone
                                        </div>
                                        <p className="text-red-300 text-sm">
                                            You need to attend <strong className="text-white">{subject.classesNeededToReach75}</strong> more consecutive classes to reach 75%.
                                        </p>
                                    </div>
                                )}

                                {isSafe && (
                                    <div className="bg-neon-green/10 border border-neon-green/30 p-4">
                                        <div className="flex items-center gap-2 text-neon-green font-bold mb-1">
                                            <FaCheckCircle />
                                            You are safe!
                                        </div>
                                        <p className="text-green-300 text-sm">Keep it up.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {attendance.length === 0 && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 text-center">
                    <FaChartPie className="text-5xl text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 font-rajdhani text-lg">No attendance records found yet.</p>
                </div>
            )}
        </div>
    );
};

export default AttendanceView;
