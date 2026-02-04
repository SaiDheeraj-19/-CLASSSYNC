import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FaUser, FaSave, FaLock, FaIdCard, FaCheck, FaShieldAlt } from 'react-icons/fa';

const ProfileManager = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        department: user?.department || 'CSE',
        semester: user?.semester || 1
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Admin Secret State
    const [newSecret, setNewSecret] = useState('');
    const [secretMessage, setSecretMessage] = useState('');

    const [saving, setSaving] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            await api.put('/auth/profile', formData);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordMessage('Password must be at least 6 characters');
            return;
        }

        setSavingPassword(true);
        setPasswordMessage('');

        try {
            await api.put('/auth/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordMessage('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordMessage(err.response?.data?.message || 'Failed to change password');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleUpdateSecret = async (e) => {
        e.preventDefault();
        setSecretMessage('');
        try {
            await api.put('/auth/update-secret', { newSecret });
            setSecretMessage('success: Master Key updated successfully!');
            setNewSecret('');
        } catch (err) {
            setSecretMessage(err.response?.data?.message || 'Failed to update Master Key');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/10 rounded-full blur-[50px]"></div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 bg-neon-purple flex items-center justify-center text-3xl font-bold text-white font-orbitron">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white font-orbitron">{user?.name}</h2>
                        <p className="text-gray-400 flex items-center gap-2">
                            <FaIdCard className="text-neon-blue" /> {user?.rollNumber}
                        </p>
                        <span className={`inline-block mt-2 px-3 py-1 text-xs uppercase tracking-wider font-bold ${user?.role === 'admin'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/30'
                            }`}>
                            {user?.role}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Info */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <h3 className="text-lg font-orbitron text-white mb-6 flex items-center gap-2">
                        <FaUser className="text-neon-purple" /> Profile Information
                    </h3>

                    {message && (
                        <div className={`p-3 mb-4 text-sm ${message.includes('success')
                            ? 'bg-green-500/10 border-l-2 border-green-500 text-green-400'
                            : 'bg-red-500/10 border-l-2 border-red-500 text-red-400'
                            }`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                            <input
                                type="text"
                                className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Roll Number</label>
                            <input
                                type="text"
                                className="w-full bg-black/30 border border-white/20 text-gray-500 px-3 py-2 cursor-not-allowed"
                                value={user?.rollNumber || ''}
                                disabled
                            />
                            <p className="text-xs text-gray-500 mt-1">Roll number cannot be changed</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Department</label>
                                <select
                                    className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                >
                                    <option value="CSE" className="bg-cyber-dark">CSE</option>
                                    <option value="ECE" className="bg-cyber-dark">ECE</option>
                                    <option value="EEE" className="bg-cyber-dark">EEE</option>
                                    <option value="MECH" className="bg-cyber-dark">MECH</option>
                                    <option value="CIVIL" className="bg-cyber-dark">CIVIL</option>
                                    <option value="IT" className="bg-cyber-dark">IT</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Semester</label>
                                <select
                                    className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                        <option key={s} value={s} className="bg-cyber-dark">Semester {s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 bg-neon-purple text-white py-2 px-4 hover:bg-neon-purple/80 transition-colors font-bold"
                        >
                            <FaSave /> {saving ? 'Saving...' : 'Update Profile'}
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <h3 className="text-lg font-orbitron text-white mb-6 flex items-center gap-2">
                        <FaLock className="text-neon-yellow" /> Change Password
                    </h3>

                    {passwordMessage && (
                        <div className={`p-3 mb-4 text-sm ${passwordMessage.includes('success')
                            ? 'bg-green-500/10 border-l-2 border-green-500 text-green-400'
                            : 'bg-red-500/10 border-l-2 border-red-500 text-red-400'
                            }`}>
                            {passwordMessage}
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Current Password</label>
                            <input
                                type="password"
                                className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-yellow transition-colors"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">New Password</label>
                            <input
                                type="password"
                                className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-yellow transition-colors"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-yellow transition-colors"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={savingPassword}
                            className="w-full flex items-center justify-center gap-2 bg-neon-yellow text-black py-2 px-4 hover:bg-neon-yellow/80 transition-colors font-bold"
                        >
                            <FaCheck /> {savingPassword ? 'Updating...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Admin Master Key Update Section */}
            {user?.role === 'admin' && (
                <div className="bg-white/5 backdrop-blur-xl border border-red-500/20 p-6 max-w-2xl mx-auto">
                    <h3 className="text-lg font-orbitron text-red-400 mb-6 flex items-center gap-2">
                        <FaShieldAlt className="text-red-500" /> Admin Master Key Settings
                    </h3>

                    {secretMessage && (
                        <div className={`p-3 mb-4 text-sm ${secretMessage.includes('success')
                            ? 'bg-green-500/10 border-l-2 border-green-500 text-green-400'
                            : 'bg-red-500/10 border-l-2 border-red-500 text-red-400'
                            }`}>
                            {secretMessage}
                        </div>
                    )}

                    <form onSubmit={handleUpdateSecret} className="space-y-4">
                        <div>
                            <label className="block text-xs text-red-400 uppercase tracking-wider mb-1">New Master Key</label>
                            <input
                                type="password"
                                className="w-full bg-black/30 border border-red-500/30 text-white px-3 py-2 focus:outline-none focus:border-red-500 transition-colors"
                                value={newSecret}
                                onChange={(e) => setNewSecret(e.target.value)}
                                placeholder="Enter new secret key"
                                required
                                minLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-red-600/20 border border-red-500 text-red-400 py-2 px-4 hover:bg-red-600 hover:text-white transition-colors font-bold"
                        >
                            <FaLock /> Update Master Key
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ProfileManager;
