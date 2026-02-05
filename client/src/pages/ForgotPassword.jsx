import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFingerprint, FaUser, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import api from '../api';

const ForgotPassword = () => {

    // Step management: 1 = Enter Roll Number, 2 = Verify Name, 3 = New Password, 4 = Success
    const [step, setStep] = useState(1);

    const [rollNumber, setRollNumber] = useState('');
    const [name, setName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [hint, setHint] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1: Check if user exists
    const handleCheckUser = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/check-user', { rollNumber });
            setHint(res.data.hint);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Roll number not found');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify name matches the roll number
    const handleVerifyName = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/verify-name', { rollNumber, name });
            // Name verified, proceed to password reset
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Name verification failed');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset password (name already verified)
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/forgot-password', {
                rollNumber,
                name,
                newPassword
            });
            setStep(4); // Success
        } catch (err) {
            setError(err.response?.data?.message || 'Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cyber-black relative overflow-hidden font-rajdhani">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-purple/10 rounded-full blur-[80px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8">
                {/* Header */}
                <div className="mb-10 text-center relative">
                    <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white tracking-tighter mb-2">
                        CLASS<span className="text-neon-yellow">SYNC</span>
                    </h1>
                    <p className="text-gray-400 font-rajdhani tracking-[0.2em] text-sm uppercase">Password Recovery</p>
                    <div className="w-16 h-1 bg-neon-blue mx-auto mt-4 shadow-[0_0_10px_rgba(0,200,255,0.8)]"></div>
                </div>

                {/* Success State */}
                {step === 4 ? (
                    <div className="card backdrop-blur-xl bg-cyber-gray/30 clip-path-slant border border-neon-green/30 shadow-2xl text-center">
                        <FaCheckCircle className="text-6xl text-neon-green mx-auto mb-4" />
                        <h2 className="text-2xl font-orbitron text-white mb-4">PASSWORD RESET</h2>
                        <p className="text-gray-400 mb-6">Your password has been successfully updated.</p>
                        <Link
                            to="/login"
                            className="btn-primary w-full inline-block text-center"
                        >
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    /* Main Card */
                    <div className="card backdrop-blur-xl bg-cyber-gray/30 clip-path-slant border border-white/5 shadow-2xl">
                        {/* Step Indicator */}
                        <div className="flex items-center justify-center gap-2 mb-6">
                            {[1, 2, 3].map((s) => (
                                <div
                                    key={s}
                                    className={`w-8 h-1 transition-colors ${s <= step ? 'bg-neon-blue' : 'bg-gray-700'
                                        }`}
                                ></div>
                            ))}
                        </div>

                        <h2 className="text-xl font-orbitron text-white mb-2 flex items-center gap-2">
                            <span className="text-neon-blue">0{step}</span> //
                            {step === 1 && 'IDENTIFY'}
                            {step === 2 && 'VERIFY'}
                            {step === 3 && 'RESET'}
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">
                            {step === 1 && 'Enter your Roll Number to begin'}
                            {step === 2 && hint}
                            {step === 3 && 'Create your new secure password'}
                        </p>

                        {error && (
                            <div className="bg-red-500/10 border-l-2 border-red-500 text-red-400 p-3 mb-6 text-sm font-code">
                                [ERROR]: {error}
                            </div>
                        )}

                        {/* Step 1: Roll Number */}
                        {step === 1 && (
                            <form onSubmit={handleCheckUser} className="space-y-6">
                                <div className="group">
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-orbitron">
                                        Roll Number
                                    </label>
                                    <div className="relative flex items-center">
                                        <FaFingerprint className="absolute left-0 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
                                        <input
                                            type="text"
                                            className="w-full bg-transparent border-b border-gray-700 text-white pl-8 py-2 focus:outline-none focus:border-neon-blue transition-colors font-rajdhani text-lg"
                                            placeholder="Enter Roll Number"
                                            value={rollNumber}
                                            onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`btn-primary w-full group relative overflow-hidden ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    <span className="relative z-10">{loading ? 'Searching...' : 'Continue'}</span>
                                </button>
                            </form>
                        )}

                        {/* Step 2: Enter Name for Verification */}
                        {step === 2 && (
                            <form onSubmit={handleVerifyName} className="space-y-6">
                                <div className="group">
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-orbitron">
                                        Your Full Name (as registered)
                                    </label>
                                    <div className="relative flex items-center">
                                        <FaUser className="absolute left-0 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
                                        <input
                                            type="text"
                                            className="w-full bg-transparent border-b border-gray-700 text-white pl-8 py-2 focus:outline-none focus:border-neon-blue transition-colors font-rajdhani text-lg"
                                            placeholder="Enter your full name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => { setStep(1); setError(''); }}
                                        className="border border-gray-600 text-gray-400 hover:text-white hover:border-white px-4 py-3 transition-colors"
                                    >
                                        <FaArrowLeft />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!name.trim() || loading}
                                        className={`btn-primary flex-1 ${(!name.trim() || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? 'Verifying...' : 'Verify & Continue'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Step 3: New Password */}
                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="group">
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-orbitron">
                                        New Password
                                    </label>
                                    <div className="relative flex items-center">
                                        <FaLock className="absolute left-0 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="w-full bg-transparent border-b border-gray-700 text-white pl-8 py-2 focus:outline-none focus:border-neon-blue transition-colors font-rajdhani text-lg"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            minLength={6}
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

                                <div className="group">
                                    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 font-orbitron">
                                        Confirm Password
                                    </label>
                                    <div className="relative flex items-center">
                                        <FaLock className="absolute left-0 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            className="w-full bg-transparent border-b border-gray-700 text-white pl-8 py-2 focus:outline-none focus:border-neon-blue transition-colors font-rajdhani text-lg"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-0 text-gray-500 hover:text-white transition-colors"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="border border-gray-600 text-gray-400 hover:text-white hover:border-white px-4 py-3 transition-colors"
                                    >
                                        <FaArrowLeft />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`btn-primary flex-1 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Back to Login Link */}
                        <div className="mt-8 text-center">
                            <Link
                                to="/login"
                                className="text-gray-500 hover:text-white transition-colors font-orbitron text-xs uppercase tracking-wider inline-flex items-center gap-2"
                            >
                                <FaArrowLeft className="text-[10px]" /> Back to Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
