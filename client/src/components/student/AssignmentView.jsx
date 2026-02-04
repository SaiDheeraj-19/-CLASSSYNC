import React, { useState, useEffect } from 'react';
import api from '../../api';
import { format, isPast, isToday } from 'date-fns';
import { FaBookOpen, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

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

    if (loading) return <div>Loading Assignments...</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Assignments</h2>
            <div className="space-y-4">
                {assignments.map((assignment) => {
                    const deadlineDate = new Date(assignment.deadline);
                    const overdue = isPast(deadlineDate) && !isToday(deadlineDate); // Simple check

                    return (
                        <div key={assignment._id} className="card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
                                        {assignment.subject}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-800">{assignment.title}</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{assignment.description}</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500">Deadline:</span>
                                    <span className={`font-medium ${overdue ? 'text-red-500' : 'text-gray-700'}`}>
                                        {format(deadlineDate, 'PPP p')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium ${overdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                    {overdue ? <><FaExclamationTriangle /> Overdue</> : <><FaCheckCircle /> Active</>}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {assignments.length === 0 && <p className="text-gray-500">No pending assignments.</p>}
            </div>
        </div>
    );
};

export default AssignmentView;
