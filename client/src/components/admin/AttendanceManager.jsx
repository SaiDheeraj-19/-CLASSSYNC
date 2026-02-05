import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api';
import { FaCheck, FaTimes, FaCheckDouble, FaTimesCircle, FaSave, FaCalendarDay, FaDownload, FaSortAmountUp, FaSortAmountDown } from 'react-icons/fa';

// Helper to get current date in IST (Chennai time) as YYYY-MM-DD
const getISTDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

const AttendanceManager = () => {
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(getISTDate());

    // Attendance state: { studentId: true/false (present/absent) }
    const [attendanceMarks, setAttendanceMarks] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Config Mode for subjects
    const [isConfigMode, setIsConfigMode] = useState(false);
    const [newSubject, setNewSubject] = useState('');

    // Sort order state: 'asc' or 'desc'
    const [sortOrder, setSortOrder] = useState('asc');

    const fetchInitialData = useCallback(async () => {
        try {
            const [studentsRes, subjectsRes, timetableRes] = await Promise.all([
                api.get('/auth/all-users'),
                api.get('/subjects'),
                api.get('/timetable')
            ]);
            setStudents(studentsRes.data);
            setSubjects(subjectsRes.data);
            setTimetable(timetableRes.data);

            // Initialize all students as present by default
            const initialMarks = {};
            studentsRes.data.forEach(s => {
                initialMarks[s._id] = true; // true = present
            });
            setAttendanceMarks(initialMarks);
        } catch {
            console.error("Error fetching data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleAddSubject = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/subjects', { name: newSubject });
            setSubjects([...subjects, res.data]);
            setNewSubject('');
        } catch {
            alert('Failed to add subject');
        }
    };

    const handleDeleteSubject = async (id) => {
        if (!confirm('Delete this subject?')) return;
        try {
            await api.delete(`/subjects/${id}`);
            setSubjects(subjects.filter(s => s._id !== id));
        } catch {
            alert('Failed');
        }
    };

    // Toggle individual student attendance
    const toggleAttendance = (studentId) => {
        setAttendanceMarks(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    // Select all as present
    const markAllPresent = () => {
        const marks = {};
        students.forEach(s => { marks[s._id] = true; });
        setAttendanceMarks(marks);
    };

    // Mark all as absent
    const markAllAbsent = () => {
        const marks = {};
        students.forEach(s => { marks[s._id] = false; });
        setAttendanceMarks(marks);
    };

    // Save attendance for selected subject
    const saveAttendance = async () => {
        if (!selectedSubject) {
            alert('Please select a subject first!');
            return;
        }

        setSaving(true);
        try {
            const updates = students.map(student => ({
                studentId: student._id,
                subject: selectedSubject,
                isPresent: !!attendanceMarks[student._id]
            }));

            await api.post('/attendance/bulk', { updates });

            alert(`Attendance saved successfully for ${selectedSubject}!`);
        } catch (err) {
            console.error(err);
            alert('Error saving attendance');
        } finally {
            setSaving(false);
        }
    };

    // Get today's classes from timetable (using IST timezone)
    const getTodaysClasses = () => {
        // Get today's day name in IST timezone (Chennai time)
        const todayName = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', weekday: 'long' });
        const todaySchedule = timetable.find(t => t.day === todayName);
        return todaySchedule ? todaySchedule.slots : [];
    };

    const downloadAbsentees = () => {
        const absentees = students.filter(s => !attendanceMarks[s._id]);
        if (absentees.length === 0) {
            alert('No students marked as absent!');
            return;
        }

        // Sort absentees by roll number in ascending order
        const sortedAbsentees = [...absentees].sort((a, b) => {
            const rollA = a.rollNumber || '';
            const rollB = b.rollNumber || '';
            return rollA.localeCompare(rollB, undefined, { numeric: true });
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + "Roll Number,Name,Date\n"
            + sortedAbsentees.map(s => `${s.rollNumber},"${s.name}",${attendanceDate}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `absentees_${attendanceDate}.csv`);
        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link);
    };

    const todaysClasses = getTodaysClasses();
    const presentCount = Object.values(attendanceMarks).filter(v => v).length;
    const absentCount = students.length - presentCount;

    // Sorted students list based on roll number
    const sortedStudents = useMemo(() => {
        return [...students].sort((a, b) => {
            const rollA = a.rollNumber || '';
            const rollB = b.rollNumber || '';
            if (sortOrder === 'asc') {
                return rollA.localeCompare(rollB, undefined, { numeric: true });
            } else {
                return rollB.localeCompare(rollA, undefined, { numeric: true });
            }
        });
    }, [students, sortOrder]);

    if (loading) {
        return <div className="text-gray-400 animate-pulse">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Total Students</p>
                    <p className="text-3xl font-bold text-white">{students.length}</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 p-4">
                    <p className="text-green-400 text-xs uppercase tracking-wider">Present</p>
                    <p className="text-3xl font-bold text-green-400">{presentCount}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 p-4">
                    <p className="text-red-400 text-xs uppercase tracking-wider">Absent</p>
                    <p className="text-3xl font-bold text-red-400">{absentCount}</p>
                </div>
                <div className="bg-neon-purple/10 border border-neon-purple/30 p-4">
                    <p className="text-neon-purple text-xs uppercase tracking-wider">Today's Classes</p>
                    <p className="text-xl font-bold text-white">
                        {todaysClasses.length > 0
                            ? [...new Set(todaysClasses.map(c => c.subject.split('-')[0].trim()))].join(', ')
                            : 'None'}
                    </p>
                </div>
            </div>

            {/* Controls Row */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 items-center">
                    <div>
                        <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Subject</label>
                        <select
                            className="bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors min-w-[200px]"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            <option value="" className="bg-cyber-dark">Select Subject</option>
                            {/* Show all subjects from database */}
                            {subjects.map(s => (
                                <option key={s._id} value={s.name} className="bg-cyber-dark">{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Date</label>
                        <input
                            type="date"
                            className="bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={markAllPresent}
                        className="flex items-center gap-2 bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500 hover:text-white px-4 py-2 transition-colors"
                    >
                        <FaCheckDouble /> Select All Present
                    </button>
                    <button
                        onClick={markAllAbsent}
                        className="flex items-center gap-2 bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 transition-colors"
                    >
                        <FaTimesCircle /> Mark All Absent
                    </button>
                    <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black px-4 py-2 transition-colors"
                        title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                    >
                        {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                        {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </button>
                    <button
                        onClick={() => setIsConfigMode(!isConfigMode)}
                        className="text-xs text-neon-purple hover:text-white transition-colors px-4 py-2 border border-neon-purple/50"
                    >
                        {isConfigMode ? 'Back to Attendance' : 'Manage Subjects'}
                    </button>
                    <button
                        onClick={downloadAbsentees}
                        className="flex items-center gap-2 bg-neon-blue/20 border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black px-4 py-2 transition-colors"
                        title="Download Absentee List"
                    >
                        <FaDownload /> Absentees
                    </button>
                </div>
            </div>

            {isConfigMode ? (
                // Subject Configuration
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <h4 className="font-bold mb-4 text-white font-orbitron">Subject Configuration</h4>
                    <form onSubmit={handleAddSubject} className="flex gap-2 mb-4">
                        <input
                            className="flex-1 bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                            placeholder="New Subject Name"
                            value={newSubject}
                            onChange={e => setNewSubject(e.target.value)}
                        />
                        <button className="btn-primary py-2 px-4">Add Subject</button>
                    </form>
                    <ul className="space-y-2">
                        {subjects.map(sub => (
                            <li key={sub._id} className="flex justify-between items-center bg-white/5 p-3 border border-white/10">
                                <span className="text-white">{sub.name}</span>
                                <button onClick={() => handleDeleteSubject(sub._id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                // Attendance Marking Table
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-black/20 sticky top-0">
                            <tr>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10">#</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10">Roll Number</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10">Student Name</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10 text-center">Status</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10 text-center">Toggle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedStudents.length > 0 ? sortedStudents.map((student, index) => (
                                <tr
                                    key={student._id}
                                    className={`hover:bg-white/5 transition-colors ${attendanceMarks[student._id] ? '' : 'bg-red-500/10'}`}
                                >
                                    <td className="p-4 font-code text-gray-500">{index + 1}</td>
                                    <td className="p-4 font-code text-neon-blue">{student.rollNumber}</td>
                                    <td className="p-4 text-white font-rajdhani text-lg">
                                        {student.name}
                                        {student.role === 'admin' && (
                                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded">
                                                ADMIN
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        {attendanceMarks[student._id] ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                                <FaCheck /> PRESENT
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                                <FaTimes /> ABSENT
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => toggleAttendance(student._id)}
                                            className={`px-4 py-2 transition-colors ${attendanceMarks[student._id]
                                                ? 'bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white'
                                                : 'bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500 hover:text-white'
                                                }`}
                                        >
                                            {attendanceMarks[student._id] ? 'Mark Absent' : 'Mark Present'}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No students registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Save Button - Fixed at bottom with high visibility */}
            {!isConfigMode && students.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-cyber-black/95 backdrop-blur-md border-t border-neon-green/30 p-4 shadow-[0_-10px_40px_rgba(0,255,150,0.2)]">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="text-white flex items-center gap-3">
                            <span className="text-gray-400">Subject:</span>
                            <span className="text-neon-green font-bold">{selectedSubject || 'Not Selected'}</span>
                            <span className="text-gray-500">|</span>
                            <span className="text-gray-400">Students:</span>
                            <span className="text-white font-bold">{students.length}</span>
                        </div>
                        <button
                            onClick={saveAttendance}
                            disabled={saving || !selectedSubject}
                            className={`flex items-center gap-3 px-10 py-4 font-bold text-xl uppercase tracking-wider transition-all ${selectedSubject
                                ? 'bg-neon-green text-black hover:bg-white hover:scale-105 shadow-[0_0_30px_rgba(0,255,150,0.5)] animate-pulse'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <FaSave className="text-2xl" /> {saving ? 'Saving...' : 'SAVE ATTENDANCE'}
                        </button>
                    </div>
                </div>
            )}

            {/* Spacer for fixed bottom bar */}
            {!isConfigMode && students.length > 0 && (
                <div className="h-24"></div>
            )}
        </div>
    );
};

export default AttendanceManager;
