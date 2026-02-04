import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaKey, FaIdCard } from 'react-icons/fa';

const AdminRegister = () => {
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        role: 'admin',
        rollNumber: '', // Still might be needed or can be "ADMIN001"
        secretKey: '' // Local validation for now
    });
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simple client-side secret check. In production, this should be server-side.
        // Assuming "cyberadmin2024" as the secret for minimal friction implementation as requested.
        if (formData.secretKey !== 'cyberadmin2024') {
            setError('Invalid Administrator Entry Code');
            setLoading(false);
            return;
        }

        try {
            // Using a prefix for admin roll numbers if not provided, or just let them enter it.
            // Repurposing rollNumber field for Admin ID
            await register(formData.name, null, formData.password, formData.role, formData.rollNumber, formData.secretKey);
            navigate('/admin'); // Redirect directly to admin or login
        } catch (err) {
            console.error('Registration Error:', err);
            const msg = err.response?.data?.message || err.message || 'Registration failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cyber-black relative overflow-hidden font-rajdhani">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-purple/10 rounded-full blur-[80px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg p-6">
                {/* Header */}
                <div className="mb-8 text-center relative">
                    <h1 className="text-4xl font-orbitron font-bold text-white tracking-widest mb-1">
                        ADMIN<span className="text-red-500">ACCESS</span>
                    </h1>
                    <p className="text-gray-400 font-code tracking-[0.3em] text-xs uppercase">Restricted Protocol //</p>
                </div>

                {/* Form Card */}
                <div className="card backdrop-blur-xl bg-cyber-gray/30 clip-path-slant border border-red-500/20 shadow-2xl">
                    <div className="absolute top-0 left-0 p-3 opacity-50">
                        <FaIdCard className="text-red-500 text-xl" />
                    </div>

                    <h2 className="text-xl font-orbitron text-white mb-6 flex items-center justify-end gap-2">
                        // ROOT_CREATION <span className="text-red-500">00</span>
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 border-l-2 border-red-500 text-red-400 p-3 mb-6 text-sm font-code">
                            [ERROR]: {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5">
                            {/* Full Name */}
                            <div className="group">
                                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-orbitron">Officer Name</label>
                                <div className="relative flex items-center">
                                    <FaUser className="absolute left-0 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                                    <input type="text" name="name" className="w-full bg-transparent border-b border-gray-700 text-white pl-8 py-2 focus:outline-none focus:border-red-500 transition-colors font-rajdhani text-lg" onChange={handleChange} required />
                                </div>
                            </div>

                            {/* Admin ID / Roll No */}
                            <div className="group">
                                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-orbitron">Admin ID</label>
                                <div className="relative flex items-center">
                                    <FaIdCard className="absolute left-0 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                                    <input type="text" name="rollNumber" className="w-full bg-transparent border-b border-gray-700 text-white pl-8 py-2 focus:outline-none focus:border-red-500 transition-colors font-rajdhani text-lg" onChange={handleChange} required placeholder="ADM-001" />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="group">
                                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-orbitron">Passcode</label>
                                <div className="relative flex items-center">
                                    <FaLock className="absolute left-0 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="w-full bg-transparent border-b border-gray-700 text-white pl-8 py-2 focus:outline-none focus:border-red-500 transition-colors font-rajdhani text-lg"
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-0 text-gray-500 hover:text-white transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Secret Key */}
                            <div className="group">
                                <label className="block text-xs text-red-500/80 uppercase tracking-wider mb-2 font-orbitron border-b border-red-500/10 pb-1">Master Key</label>
                                <div className="relative flex items-center">
                                    <FaKey className="absolute left-0 text-red-500 group-focus-within:text-red-400 transition-colors" />
                                    <input
                                        type="password"
                                        name="secretKey"
                                        className="w-full bg-transparent border-b border-red-900/50 text-white pl-8 py-2 focus:outline-none focus:border-red-500 transition-colors font-rajdhani text-lg tracking-widest"
                                        onChange={handleChange}
                                        required
                                        placeholder="ENTER KEY"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn-secondary w-full mt-6 group relative overflow-hidden bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500 hover:text-white ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <span className="relative z-10">{loading ? 'Authorizing...' : 'Authorize Access'}</span>
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link to="/login" className="text-gray-500 hover:text-white transition-colors font-orbitron text-xs uppercase tracking-wider mt-2 inline-block hover:underline">
                            Return to Standard Portal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRegister;
