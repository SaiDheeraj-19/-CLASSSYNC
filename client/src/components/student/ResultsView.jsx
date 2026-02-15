import React, { useState, useEffect } from 'react';
import { FaTrophy, FaChartLine, FaExternalLinkAlt, FaDownload, FaSearch } from 'react-icons/fa';

const ResultsView = () => {
    const [connectionStatus, setConnectionStatus] = useState('initiating'); // initiating, connecting, connected
    const externalUrl = "http://digitalcampus.msmfclasses.com:99";

    useEffect(() => {
        // Simulate a connection sequence for the "Cyberpunk" feel
        const timer1 = setTimeout(() => setConnectionStatus('connecting'), 800);
        const timer2 = setTimeout(() => setConnectionStatus('connected'), 2000);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4 mb-4 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white font-orbitron flex items-center gap-3">
                        <FaTrophy className="text-neon-yellow" /> Live Results Portal
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Secure Gateway to University Database
                    </p>
                </div>
            </div>

            {/* Main Terminal Area */}
            <div className="flex-1 relative bg-black/80 rounded-xl overflow-hidden border-2 border-neon-blue/30 shadow-[0_0_30px_rgba(0,243,255,0.15)] flex flex-col items-center justify-center p-8 text-center group">

                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(to right, #00f3ff 1px, transparent 1px), linear-gradient(to bottom, #00f3ff 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}></div>

                {/* Status: Initiating */}
                {connectionStatus === 'initiating' && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto"></div>
                        <p className="text-white font-code tracking-widest text-lg">INITIALIZING PROTOCOL...</p>
                    </div>
                )}

                {/* Status: Connecting */}
                {connectionStatus === 'connecting' && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin mx-auto"></div>
                        <p className="text-neon-blue font-code tracking-widest text-lg animate-pulse">ESTABLISHING HANDSHAKE...</p>
                        <p className="text-xs text-gray-500 font-code">Target: {externalUrl}</p>
                    </div>
                )}

                {/* Status: Connected */}
                {connectionStatus === 'connected' && (
                    <div className="space-y-8 animate-scale-in max-w-lg w-full relative z-10">
                        <div className="w-24 h-24 bg-neon-green/10 rounded-full flex items-center justify-center mx-auto border border-neon-green/50 shadow-[0_0_20px_rgba(0,255,150,0.3)]">
                            <FaChartLine className="text-4xl text-neon-green" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold text-white font-orbitron">ACCESS GRANTED</h3>
                            <p className="text-gray-400">
                                The external results database is live and ready. <br />
                                Due to security protocols, the portal must be accessed in a dedicated window.
                            </p>
                        </div>

                        <a
                            href={externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full"
                        >
                            <button className="w-full bg-neon-blue hover:bg-neon-blue/80 text-black font-bold py-4 px-8 rounded-none transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] font-orbitron tracking-widest text-xl flex items-center justify-center gap-3 clip-path-slant">
                                <FaExternalLinkAlt /> LAUNCH PORTAL
                            </button>
                        </a>

                        <div className="text-xs text-gray-500 font-code pt-4 border-t border-white/10">
                            Connection ID: 0X9A2-SECURE-LINK
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-gray-500">
                <FaChartLine className="text-neon-blue" />
                <span>
                    Official University Results Server
                </span>
            </div>
        </div>
    );
};

export default ResultsView;
