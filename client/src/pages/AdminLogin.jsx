import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';

const AdminLogin = () => {
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, logout } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Login returns the user object from our existing context
            const user = await login({ rollNumber }, password);

            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                // If a student tries to log in here, we deny them
                logout(); // Clear the session
                setError('Access Denied: Insufficient Privileges. Students must use the Standard Portal.');
            }
        } catch {
            setError('Invalid Admin ID or Password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cyber-black relative overflow-hidden font-rajdhani">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-purple/10 rounded-full blur-[80px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8">
                {/* Header */}
                <div className="mb-10 text-center relative">
                    <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white tracking-tighter mb-2">
                        CLASS<span className="text-red-500">SYNC</span>
                    </h1>
                    <p className="text-red-400 font-rajdhani tracking-[0.2em] text-sm uppercase">Command Console // Admin Only</p>
                    <div className="w-16 h-1 bg-red-500 mx-auto mt-4 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                </div>

                {/* Login Card */}
                <div className="card backdrop-blur-xl bg-cyber-gray/30 clip-path-slant border border-red-500/20 shadow-2xl">
                    <div className="absolute top-0 right-0 p-2 opacity-50">
                        <FaShieldAlt className="text-red-500 text-xl" />
                    </div>

                    <h2 className="text-2xl font-orbitron text-white mb-6 flex items-center gap-2">
                        <span className="text-red-500">ROOT</span> // ACCESS
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 border-l-2 border-red-500 text-red-400 p-3 mb-6 text-sm font-code">
                            [ERROR]: {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group">
                            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-orbitron">Admin ID</label>
                            <div className="relative flex items-center">
                                <FaShieldAlt className="absolute left-0 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                                <input
                                    type="text"
                                    className="w-full bg-transparent border-b border-gray-700 text-white pl-8 py-2 focus:outline-none focus:border-red-500 transition-colors font-rajdhani text-lg"
                                    placeholder="Enter Admin ID"
                                    value={rollNumber}
                                    onChange={(e) => setRollNumber(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-orbitron">Passcode</label>
                            <div className="relative flex items-center">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-transparent border-b border-gray-700 text-white pl-0 py-2 focus:outline-none focus:border-red-500 transition-colors font-rajdhani text-lg"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
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

                        <button type="submit" className="btn-primary w-full mt-4 group relative overflow-hidden bg-red-600 border-none hover:bg-red-700 text-white">
                            <span className="relative z-10">Authenticate</span>
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                        </button>
                    </form>

                    <div className="mt-8 text-center flex flex-col gap-2">
                        <Link to="/admin/register" className="text-red-400 hover:text-white transition-colors font-orbitron text-sm uppercase tracking-wider inline-block">
                            // Register New Officer
                        </Link>
                        <Link to="/login" className="text-gray-500 hover:text-white transition-colors font-orbitron text-[10px] uppercase tracking-wider inline-block">
                            Switch to Student Portal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
