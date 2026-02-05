import React, { useState, useEffect } from 'react';
import api from '../../api';
import { format, isPast, isToday } from 'date-fns';
import { FaBookOpen, FaExclamationTriangle, FaCheckCircle, FaClock, FaCalendarAlt } from 'react-icons/fa';

const AssignmentView = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await api.get('/assignments');
                setAssignments(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-neon-purple text-xl font-orbitron">Loading Assignments...</div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-orbitron">Assignments</h2>

            {assignments.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 text-center">
                    <FaBookOpen className="text-4xl text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 font-rajdhani">No pending assignments. Enjoy your free time!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {assignments.map((assignment) => {
                        const deadlineDate = new Date(assignment.deadline);
                        const overdue = isPast(deadlineDate) && !isToday(deadlineDate);
                        const dueToday = isToday(deadlineDate);

                        return (
                            <div
                                key={assignment._id}
                                className={`bg-white/5 backdrop-blur-xl border p-6 transition-all hover:scale-[1.01] hover:shadow-lg ${overdue
                                        ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                        : dueToday
                                            ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                                            : 'border-neon-green/30 shadow-[0_0_15px_rgba(0,255,150,0.1)]'
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-1">
                                        {/* Subject Tag & Title */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="bg-neon-purple/20 text-neon-purple px-3 py-1 text-xs font-bold uppercase tracking-wider border border-neon-purple/30">
                                                {assignment.subject}
                                            </span>
                                            <h3 className="text-xl font-bold text-white font-orbitron">{assignment.title}</h3>
                                        </div>

                                        {/* Description */}
                                        <p className="text-gray-300 text-sm mb-4 font-rajdhani leading-relaxed">
                                            {assignment.description}
                                        </p>

                                        {/* Deadline */}
                                        <div className="flex items-center gap-3">
                                            <FaCalendarAlt className={overdue ? 'text-red-400' : dueToday ? 'text-yellow-400' : 'text-neon-blue'} />
                                            <span className="text-gray-400 text-sm">Deadline:</span>
                                            <span className={`font-bold text-sm ${overdue ? 'text-red-400' : dueToday ? 'text-yellow-400' : 'text-white'
                                                }`}>
                                                {format(deadlineDate, 'PPP p')}
                                            </span>
                                            {dueToday && <span className="text-yellow-400 text-xs animate-pulse">• Due Today!</span>}
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className={`px-5 py-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${overdue
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                                            : 'bg-neon-green/20 text-neon-green border border-neon-green/50'
                                        }`}>
                                        {overdue ? (
                                            <>
                                                <FaExclamationTriangle className="animate-pulse" />
                                                Overdue
                                            </>
                                        ) : (
                                            <>
                                                <FaCheckCircle />
                                                Active
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AssignmentView;
