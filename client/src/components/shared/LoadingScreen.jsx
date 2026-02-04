import React from 'react';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 bg-cyber-black flex items-center justify-center z-[9999]">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-neon-blue/10 rounded-full blur-[100px] animate-pulse"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Logo */}
                <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-white tracking-widest mb-8">
                    CLASS<span className="text-neon-purple">SYNC</span>
                </h1>

                {/* Animated Loading Bar */}
                <div className="w-64 h-1 bg-white/10 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-purple animate-loading-bar"></div>
                </div>

                {/* Loading Text */}
                <div className="mt-6 flex items-center gap-2 text-gray-400 font-code text-sm">
                    <span className="animate-pulse">INITIALIZING SYSTEM</span>
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                </div>

                {/* Glitch Effect Lines */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute w-full h-[1px] bg-neon-purple/30 top-1/4 animate-scan-line"></div>
                    <div className="absolute w-full h-[1px] bg-neon-blue/20 top-1/2 animate-scan-line" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute w-full h-[1px] bg-neon-purple/20 top-3/4 animate-scan-line" style={{ animationDelay: '1s' }}></div>
                </div>
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-neon-purple/50"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-neon-purple/50"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-neon-purple/50"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-neon-purple/50"></div>

            {/* Version */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 font-code">
                SYSTEM V2.0.4 // LOADING
            </div>
        </div>
    );
};

export default LoadingScreen;
