import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaFingerprint, FaShieldAlt } from 'react-icons/fa';

const Login = () => {
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login({ rollNumber }, password);
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/student');
            }
        } catch (err) {
            setError('Invalid Roll Number or Password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cyber-black relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-yellow/10 rounded-full blur-[80px]"></div>
                <div className="absolute top-0 left-10 w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
                <div className="absolute top-0 right-10 w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8">
                {/* Header */}
                <div className="mb-10 text-center relative">
                    <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white tracking-tighter mb-2">
                        CLASS<span className="text-neon-yellow">SYNC</span>
                    </h1>
                    <p className="text-neon-purple font-rajdhani tracking-[0.2em] text-sm uppercase">Secure Access Portal_v2.0</p>
                    <div className="w-16 h-1 bg-neon-yellow mx-auto mt-4 shadow-[0_0_10px_rgba(204,255,0,0.8)]"></div>
                </div>

                {/* Login Card */}
                <div className="card backdrop-blur-xl bg-cyber-gray/30 clip-path-slant border border-white/5 shadow-2xl">
                    <div className="absolute top-0 right-0 p-2 opacity-50">
                        <FaShieldAlt className="text-neon-yellow text-xl" />
                    </div>

                    <h2 className="text-2xl font-orbitron text-white mb-6 flex items-center gap-2">
                        <span className="text-neon-yellow">01</span> // AUTH_ENTRY
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 border-l-2 border-red-500 text-red-400 p-3 mb-6 text-sm font-code">
                            [ERROR]: {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group">
                            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-orbitron">Identification Code</label>
                            <div className="relative flex items-center">
                                <FaFingerprint className="absolute left-0 text-gray-500 group-focus-within:text-neon-yellow transition-colors" />
                                <input
                                    type="text"
                                    className="w-full bg-transparent border-b border-gray-700 text-white pl-8 py-2 focus:outline-none focus:border-neon-yellow transition-colors font-rajdhani text-lg"
                                    placeholder="Enter Roll No."
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
                                    className="w-full bg-transparent border-b border-gray-700 text-white pl-0 py-2 focus:outline-none focus:border-neon-yellow transition-colors font-rajdhani text-lg"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn-primary w-full mt-4 group relative overflow-hidden ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <span className="relative z-10">{loading ? 'Processing...' : 'Initialize Session'}</span>
                            {!loading && <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">New User?</p>
                        <Link to="/register" className="text-neon-purple hover:text-white transition-colors font-orbitron text-sm uppercase tracking-wider mt-2 inline-block border-b border-transparent hover:border-white">
                            // Create Identity
                        </Link>
                    </div>
                </div>

                {/* Footer Decor */}
                <div className="mt-8 flex justify-between text-[10px] text-gray-600 font-code uppercase tracking-widest">
                    <span>Sys.Status: Online</span>
                    <span>Encrypted: AES-256</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
