import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api';
import { FaUserGraduate, FaSortNumericDown, FaSearch, FaUserPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaUserShield, FaUserTimes } from 'react-icons/fa';

const ClassManager = () => {
    const [students, setStudents] = useState([]);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);

    // Form for adding new roll numbers
    const [showAddForm, setShowAddForm] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', rollNumber: '', password: 'student123' });
    const [addError, setAddError] = useState('');

    // Allowed List State
    const [activeTab, setActiveTab] = useState('all');
    const [allowedStudents, setAllowedStudents] = useState([]);
    const [bulkList, setBulkList] = useState('');

    const fetchAllowedStudents = async () => {
        try {
            const res = await api.get('/auth/allowed-students');
            setAllowedStudents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (activeTab === 'allowed') {
            fetchAllowedStudents();
        }
    }, [activeTab]);

    const handleBulkUpload = async () => {
        if (!bulkList.trim()) return;

        // Parse lines: RollNumber Name or RollNumber, Name
        const lines = bulkList.split('\n');
        const studentsToAdd = [];

        lines.forEach(line => {
            if (!line.trim()) return;
            // Simple split by comma or first space if no comma
            let rollNumber, name;

            if (line.includes(',')) {
                [rollNumber, name] = line.split(',').map(s => s.trim());
            } else {
                const parts = line.trim().split(/\s+/);
                rollNumber = parts[0];
                name = parts.slice(1).join(' ');
            }

            if (rollNumber && rollNumber.length > 5) {
                studentsToAdd.push({ rollNumber, name: name || 'Student' });
            }
        });

        if (studentsToAdd.length === 0) {
            alert('No valid student data found. Use format: "RollNumber Name" per line.');
            return;
        }

        try {
            const res = await api.post('/auth/allowed-students', { students: studentsToAdd });
            alert(`Upload Complete: Added ${res.data.results.added}, Skipped ${res.data.results.skipped}`);
            setBulkList('');
            fetchAllowedStudents();
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        }
    };

    const handleDeleteAllowed = async (id) => {
        try {
            await api.delete(`/auth/allowed-students/${id}`);
            fetchAllowedStudents();
        } catch {
            alert('Failed to remove');
        }
    };

    // Editing State
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', rollNumber: '' });

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

    // Filter and sort by roll number in ascending order
    const filteredStudents = useMemo(() => {
        let currentList = students;

        // Filter by tab type if needed
        if (activeTab === 'admins') {
            currentList = students.filter(s => s.role === 'admin');
        }

        const filtered = currentList.filter(s =>
            s.rollNumber?.toLowerCase().includes(filter.toLowerCase()) ||
            s.name?.toLowerCase().includes(filter.toLowerCase())
        );
        // Sort by roll number in ascending order with numeric comparison
        return filtered.sort((a, b) => {
            const rollA = a.rollNumber || '';
            const rollB = b.rollNumber || '';
            return rollA.localeCompare(rollB, undefined, { numeric: true });
        });
    }, [students, filter, activeTab]);

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

    const handlePromoteAdmin = async (id, name) => {
        if (!confirm(`Are you sure you want to promote "${name}" to Admin? This gives them full access to the system.`)) return;

        const secretKey = prompt("Enter Administration Master Key to confirm:");
        if (!secretKey) return;

        try {
            await api.put(`/auth/promote-admin/${id}`, { secretKey });
            fetchStudents();
            alert(`User "${name}" promoted to Admin successfully.`);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to promote user');
        }
    };

    const handleDemoteAdmin = async (id, name) => {
        if (!confirm(`Are you sure you want to demote "${name}" back to Student? They will lose all admin privileges.`)) return;

        const secretKey = prompt("Enter Administration Master Key to confirm:");
        if (!secretKey) return;

        try {
            await api.put(`/auth/demote-admin/${id}`, { secretKey });
            fetchStudents();
            alert(`User "${name}" demoted to Student successfully.`);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to demote user');
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

    const handleEditClick = (student) => {
        setEditingId(student._id);
        setEditForm({ name: student.name, rollNumber: student.rollNumber });
    };

    const handleSaveEdit = async (id) => {
        try {
            await api.put(`/auth/students/${id}`, editForm);
            setEditingId(null);
            fetchStudents();
            alert('Student updated successfully!');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update student');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({ name: '', rollNumber: '' });
    };

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-2">
                <button
                    className={`px-4 py-2 font-orbitron transition-colors ${activeTab === 'all' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('all')}
                >
                    Registered Students
                </button>
                <button
                    className={`px-4 py-2 font-orbitron transition-colors ${activeTab === 'admins' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('admins')}
                >
                    Administrators
                </button>
                <button
                    className={`px-4 py-2 font-orbitron transition-colors ${activeTab === 'allowed' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('allowed')}
                >
                    Registration Whitelist
                </button>
            </div>

            {activeTab === 'all' || activeTab === 'admins' ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <FaUserGraduate className="text-6xl text-white" />
                            </div>
                            <h3 className="text-gray-400 font-orbitron tracking-widest text-sm uppercase mb-2">
                                {activeTab === 'admins' ? 'Total Admins' : 'Total Class Strength'}
                            </h3>
                            <div className="text-4xl font-bold text-white font-rajdhani flex items-baseline gap-2">
                                {filteredStudents.length}
                                <span className="text-sm font-normal text-neon-green">Active {activeTab === 'admins' ? 'Admins' : 'Users'}</span>
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
                                {activeTab !== 'admins' && (
                                    <button
                                        onClick={handleDeleteAll}
                                        className="flex items-center gap-2 bg-red-500/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 transition-colors font-orbitron text-sm"
                                    >
                                        <FaTrash /> purge_all_data
                                    </button>
                                )}
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
                        <div className="p-4 border-b border-white/10 flex flex-col flex-md-row justify-between items-center gap-4">
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
                                        <th className="p-4 font-orbitron text-xs text-gray-400 uppercase tracking-wider border-b border-white/10 text-right">Actions</th>
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

                                                {/* Roll Number Column */}
                                                <td className="p-4 font-code text-neon-blue group-hover:text-neon-purple transition-colors">
                                                    {editingId === student._id ? (
                                                        <input
                                                            type="text"
                                                            value={editForm.rollNumber}
                                                            onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                                                            className="bg-black/50 text-white border border-neon-purple px-2 py-1 w-full"
                                                        />
                                                    ) : (
                                                        student.rollNumber
                                                    )}
                                                </td>

                                                {/* Name Column */}
                                                <td className="p-4 text-white font-rajdhani text-lg">
                                                    {editingId === student._id ? (
                                                        <input
                                                            type="text"
                                                            value={editForm.name}
                                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                            className="bg-black/50 text-white border border-neon-purple px-2 py-1 w-full"
                                                        />
                                                    ) : (
                                                        student.name
                                                    )}
                                                </td>

                                                {/* Status Column */}
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

                                                {/* Actions Column */}
                                                <td className="p-4 text-right">
                                                    {editingId === student._id ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleSaveEdit(student._id)} className="text-green-400 hover:text-green-300 transition-colors">
                                                                <FaCheck />
                                                            </button>
                                                            <button onClick={handleCancelEdit} className="text-red-400 hover:text-red-300 transition-colors">
                                                                <FaTimes />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {student.role !== 'admin' ? (
                                                                <button
                                                                    onClick={() => handlePromoteAdmin(student._id, student.name)}
                                                                    className="text-neon-purple hover:text-white transition-colors"
                                                                    title="Promote to Admin"
                                                                >
                                                                    <FaUserShield />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleDemoteAdmin(student._id, student.name)}
                                                                    className="text-orange-500 hover:text-white transition-colors"
                                                                    title="Demote to Student"
                                                                >
                                                                    <FaUserTimes />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleEditClick(student)}
                                                                className="text-neon-yellow hover:text-white transition-colors"
                                                                title="Edit"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteStudent(student._id, student.name)}
                                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    )}
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
                </>
            ) : (
                // ALLOWED LIST TAB
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full pb-4">
                    {/* Upload Section */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-orbitron">
                            <FaUserPlus className="text-neon-green" /> Bulk Information Upload
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Paste your class list here. Only students listed here will be allowed to register.
                            <br /><span className="text-neon-blue">Format: [Roll Number] [Name]</span> (one per line).
                        </p>
                        <textarea
                            className="bg-black/30 w-full flex-1 border border-white/20 p-4 text-white font-code text-sm focus:border-neon-green focus:outline-none resize-none mb-4 custom-scrollbar"
                            placeholder={"24ATA05001 John Doe\n24ATA05002 Jane Smith\n..."}
                            value={bulkList}
                            onChange={(e) => setBulkList(e.target.value)}
                        ></textarea>
                        <button
                            onClick={handleBulkUpload}
                            className="bg-neon-green text-black font-bold py-3 w-full hover:bg-neon-green/80 transition-colors"
                        >
                            Upload Approved List
                        </button>
                    </div>

                    {/* List View */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col">
                        <div className="p-4 border-b border-white/10">
                            <h3 className="text-lg font-bold text-white font-orbitron">Allowed Students ({allowedStudents.length})</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <ul className="divide-y divide-white/5">
                                {allowedStudents && allowedStudents.map(s => (
                                    <li key={s._id} className="p-4 flex justify-between items-center hover:bg-white/5">
                                        <div>
                                            <p className="font-code text-neon-blue">{s.rollNumber}</p>
                                            <p className="text-sm text-white">{s.name}</p>
                                        </div>
                                        <button onClick={() => handleDeleteAllowed(s._id)} className="text-red-500 hover:text-red-400">
                                            <FaTrash />
                                        </button>
                                    </li>
                                ))}
                                {allowedStudents.length === 0 && (
                                    <p className="p-8 text-center text-gray-500">No allowed students added yet.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassManager;
