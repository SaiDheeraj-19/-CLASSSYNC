import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaFingerprint, FaIdCard, FaEnvelope } from 'react-icons/fa';

import SEO from '../components/shared/SEO';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        rollNumber: ''
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
        try {
            await register(formData.name, formData.email, formData.password, formData.role, formData.rollNumber);
            navigate('/login');
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
            <SEO
                title="Register - ClassSync"
                description="Create a new ClassSync account for students or administrators."
            />
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[100px]"></div>
                <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-neon-blue/10 rounded-full blur-[80px]"></div>
                <div className="absolute top-0 right-20 w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg p-6">
                {/* Header */}
                <div className="mb-8 text-center relative">
                    <h1 className="text-4xl font-orbitron font-bold text-white tracking-widest mb-1">
                        INIT<span className="text-neon-purple">IALIZE</span>
                    </h1>
                    <p className="text-neon-yellow font-code tracking-[0.3em] text-xs uppercase">Create New Identity //</p>
                </div>

                {/* Form Card */}
                <div className="card backdrop-blur-xl bg-cyber-gray/30 clip-path-slant border border-white/5 shadow-2xl">
                    <div className="absolute top-0 left-0 p-3 opacity-50">
                        <FaIdCard className="text-neon-purple text-xl" />
                    </div>

                    <h2 className="text-xl font-orbitron text-white mb-6 flex items-center justify-end gap-2">
                        // REGISTRATION_PROTOCOL <span className="text-neon-purple">02</span>
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
                                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-orbitron">Full Name</label>
                                <div className="relative flex items-center">
                                    <FaUser className="absolute left-0 text-gray-500 group-focus-within:text-neon-purple transition-colors" />
                                    <input type="text" name="name" className="w-full bg-transparent border-b border-gray-700 text-white pl-8 py-2 focus:outline-none focus:border-neon-purple transition-colors font-rajdhani text-lg" onChange={handleChange} required placeholder="Ex. John Doe" />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="group">
                                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-orbitron">Email Address</label>
                                <div className="relative flex items-center">
                                    <FaEnvelope className="absolute left-0 text-gray-500 group-focus-within:text-neon-purple transition-colors" />
                                    <input type="email" name="email" className="w-full bg-transparent border-b border-gray-700 text-white pl-8 py-2 focus:outline-none focus:border-neon-purple transition-colors font-rajdhani text-lg" onChange={handleChange} required placeholder="student@example.com" />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="group">
                                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-orbitron">Passcode</label>
                                <div className="relative flex items-center">
                                    <FaLock className="absolute left-0 text-gray-500 group-focus-within:text-neon-purple transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="w-full bg-transparent border-b border-gray-700 text-white pl-8 py-2 focus:outline-none focus:border-neon-purple transition-colors font-rajdhani text-lg"
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

                            {/* Roll No */}
                            <div className="group">
                                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-orbitron">Identification Code (Roll No)</label>
                                <div className="relative flex items-center">
                                    <FaFingerprint className="absolute left-0 text-gray-500 group-focus-within:text-neon-purple transition-colors" />
                                    <input
                                        type="text"
                                        name="rollNumber"
                                        value={formData.rollNumber}
                                        className="w-full bg-transparent border-b border-gray-700 text-white pl-8 py-2 focus:outline-none focus:border-neon-purple transition-colors font-rajdhani text-lg uppercase"
                                        placeholder="e.g. 24ATA05001"
                                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn-secondary w-full mt-6 group relative overflow-hidden bg-neon-purple/10 border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <span className="relative z-10">{loading ? 'Processing Registration...' : 'Confirm Registration'}</span>
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">Already identified?</p>
                        <Link to="/login" className="text-neon-yellow hover:text-white transition-colors font-orbitron text-sm uppercase tracking-wider mt-2 inline-block border-b border-transparent hover:border-white">
                            // Access Portal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
