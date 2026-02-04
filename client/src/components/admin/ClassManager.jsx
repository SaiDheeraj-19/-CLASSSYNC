import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FaUserGraduate, FaSortNumericDown, FaSearch, FaUserPlus, FaTrash } from 'react-icons/fa';

const ClassManager = () => {
    const [students, setStudents] = useState([]);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);

    // Form for adding new roll numbers
    const [showAddForm, setShowAddForm] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', rollNumber: '', password: 'student123' });
    const [addError, setAddError] = useState('');

    const fetchStudents = async () => {
        try {
            const res = await api.get('/auth/all-users');
            setStudents(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching users", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const filteredStudents = students.filter(s =>
        s.rollNumber?.toLowerCase().includes(filter.toLowerCase()) ||
        s.name?.toLowerCase().includes(filter.toLowerCase())
    );

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setAddError('');

        try {
            await api.post('/auth/register', {
                name: newStudent.name,
                rollNumber: newStudent.rollNumber,
                password: newStudent.password,
                role: 'student'
            });
            setNewStudent({ name: '', rollNumber: '', password: 'student123' });
            setShowAddForm(false);
            fetchStudents(); // Refresh list
            alert('Student added successfully!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to add student';
            setAddError(msg);
        }
    };

    const handleDeleteStudent = async (id, name) => {
        if (!confirm(`Delete student "${name}"? This action cannot be undone.`)) return;
        try {
            await api.delete(`/auth/students/${id}`);
            fetchStudents();
        } catch (err) {
            console.error(err);
            alert('Failed to delete student');
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('WARNING: Are you sure you want to delete ALL students? This cannot be undone.')) return;

        // Double confirmation for safety
        const verification = prompt("Type 'CONFIRM' to proceed with deletion:");
        if (verification !== 'CONFIRM') return;

        try {
            await api.delete('/auth/students');
            fetchStudents();
            alert('All student data successfully purged.');
        } catch (err) {
            console.error(err);
            alert('Failed to purge data.');
        }
    };

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <FaUserGraduate className="text-6xl text-white" />
                    </div>
                    <h3 className="text-gray-400 font-orbitron tracking-widest text-sm uppercase mb-2">Total Class Strength</h3>
                    <div className="text-4xl font-bold text-white font-rajdhani flex items-baseline gap-2">
                        {students.length}
                        <span className="text-sm font-normal text-neon-green">Active Students</span>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 bg-neon-green w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 relative overflow-hidden group col-span-2">
                    <h3 className="text-gray-400 font-orbitron tracking-widest text-sm uppercase mb-2">Quick Actions</h3>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="flex items-center gap-2 bg-neon-purple/20 border border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white px-4 py-2 transition-colors font-orbitron text-sm"
                        >
                            <FaUserPlus /> {showAddForm ? 'Cancel' : 'Add New Roll Number'}
                        </button>
                        <button
                            onClick={handleDeleteAll}
                            className="flex items-center gap-2 bg-red-500/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 transition-colors font-orbitron text-sm"
                        >
                            <FaTrash /> purge_all_data
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Student Form */}
            {showAddForm && (
                <div className="bg-white/5 backdrop-blur-xl border border-neon-purple/30 p-6">
                    <h3 className="text-lg font-orbitron text-white mb-4 flex items-center gap-2">
                        <FaUserPlus className="text-neon-purple" /> Add New Student
                    </h3>
                    {addError && (
                        <div className="bg-red-500/10 border-l-2 border-red-500 text-red-400 p-3 mb-4 text-sm">
                            [ERROR]: {addError}
                        </div>
                    )}
                    <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Roll Number</label>
                            <input
                                type="text"
                                className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                placeholder="e.g. 24ATA05001"
                                value={newStudent.rollNumber}
                                onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Student Name</label>
                            <input
                                type="text"
                                className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                placeholder="Full Name"
                                value={newStudent.name}
                                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Default Password</label>
                            <input
                                type="text"
                                className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                placeholder="student123"
                                value={newStudent.password}
                                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full bg-neon-green text-black font-bold py-2 px-4 hover:bg-neon-green/80 transition-colors">
                                Add Student
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Section */}
            <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col relative overflow-hidden">
                <div className="p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-orbitron text-white flex items-center gap-2">
                        <FaSortNumericDown className="text-neon-purple" />
                        Class Roll List
                    </h2>

                    <div className="relative w-full md:w-64">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            className="w-full bg-black/20 border border-white/10 py-2 pl-10 pr-4 text-white focus:border-neon-purple focus:outline-none transition-colors font-rajdhani"
                            placeholder="Search Roll No. or Name..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-black/20 sticky top-0 backdrop-blur-md z-10">
                            <tr>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10">#</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10">Roll Number</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10">Student Name</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10">Status</th>
                                <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500 animate-pulse">
                                        Loading Data...
                                    </td>
                                </tr>
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
                                    <tr key={student._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-code text-gray-500">{index + 1}</td>
                                        <td className="p-4 font-code text-neon-blue group-hover:text-neon-purple transition-colors">{student.rollNumber}</td>
                                        <td className="p-4 text-white font-rajdhani text-lg">{student.name}</td>
                                        <td className="p-4">
                                            {student.role === 'admin' ? (
                                                <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
                                                    ADMIN
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                                    STUDENT
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDeleteStudent(student._id, student.name)}
                                                className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No students found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClassManager;
