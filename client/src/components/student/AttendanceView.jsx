import React, { useState, useEffect } from 'react';
import api from '../../api';

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

    if (loading) return <div className="text-center py-10">Loading Attendance...</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">My Attendance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attendance.map((subject) => (
                    <div key={subject._id} className="card relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-800">{subject.subject}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${subject.status === 'Safe' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {subject.status}
                            </span>
                        </div>

                        <div className="flex items-center justify-center mb-6">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#E5E7EB"
                                        strokeWidth="3"
                                    />
                                    <path
                                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke={subject.status === 'Safe' ? '#10B981' : '#EF4444'}
                                        strokeWidth="3"
                                        strokeDasharray={`${subject.percentage}, 100`}
                                        className="animate-fade-in"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-2xl font-bold text-gray-700">{subject.percentage}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between text-sm text-gray-600 mb-4">
                            <div className="text-center">
                                <p className="font-semibold">{subject.attendedClasses}</p>
                                <p>Attended</p>
                            </div>
                            <div className="text-center">
                                <p className="font-semibold">{subject.totalClasses}</p>
                                <p>Total</p>
                            </div>
                        </div>

                        {subject.status === 'Warning' && (
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                                <p className="text-red-700 text-sm font-medium">
                                    ⚠️ Danger Zone
                                </p>
                                <p className="text-red-600 text-xs mt-1">
                                    You need to attend <strong>{subject.classesNeededToReach75}</strong> more consecutive classes to reach 75%.
                                </p>
                            </div>
                        )}

                        {subject.status === 'Safe' && (
                            <div className="bg-green-50 p-3 rounded-lg border border-green-100 mt-2">
                                <p className="text-green-700 text-sm font-medium">
                                    ✅ You are safe!
                                </p>
                                <p className="text-green-600 text-xs mt-1">Keep it up.</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {attendance.length === 0 && (
                <div className="text-center text-gray-500 mt-10">No attendance records found.</div>
            )}
        </div>
    );
};

export default AttendanceView;
