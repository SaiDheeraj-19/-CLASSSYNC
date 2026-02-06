import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
    const [text, setText] = useState('INITIALIZING');
    const [progress, setProgress] = useState(0);
    const [longLoadMessage, setLongLoadMessage] = useState('');

    // Random tech text effect
    useEffect(() => {
        const fullText = "INITIALIZING SYSTEM...";
        let iteration = 0;

        const interval = setInterval(() => {
            setText(() => fullText.split("").map((letter, index) => {
                if (index < iteration) {
                    return fullText[index];
                }
                return String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }).join(""));

            if (iteration >= fullText.length) {
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);

        return () => clearInterval(interval);
    }, []);

    // Progress bar simulation with stall logic
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(old => {
                // If it's already 100, keep it there
                if (old >= 100) return 100;

                // Fast progress up to 70%
                if (old < 70) {
                    return old + Math.random() * 10;
                }

                // Slower progress 70-90%
                if (old < 90) {
                    return old + Math.random() * 2;
                }

                // Crawl from 90-99% (waiting for real load usually)
                if (old < 99) {
                    return old + 0.1;
                }

                return old;
            });
        }, 100);

        // Timers for long loading messages
        const timer1 = setTimeout(() => {
            setLongLoadMessage('ESTABLISHING SECURE CONNECTION...');
        }, 3000); // 3s

        const timer2 = setTimeout(() => {
            setLongLoadMessage('WAKING UP SERVER INSTANCE (COLD START)...');
        }, 8000); // 8s

        const timer3 = setTimeout(() => {
            setLongLoadMessage('STILL CONNECTING... PLEASE WAIT...');
        }, 15000); // 15s

        return () => {
            clearInterval(interval);
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-cyber-black flex flex-col items-center justify-center z-[9999] overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"></div>

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-purple/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-blue/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 text-center">
                {/* Glitch Logo */}
                <div className="relative mb-8">
                    <h1 className="text-6xl md:text-8xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tighter relative z-10">
                        CLASS<span className="text-neon-yellow">SYNC</span>
                    </h1>
                    <h1 className="text-6xl md:text-8xl font-orbitron font-black text-neon-blue absolute top-0 left-0 -translate-x-[2px] opacity-50 animate-pulse z-0 mix-blend-screen">
                        CLASS<span className="text-neon-yellow">SYNC</span>
                    </h1>
                    <h1 className="text-6xl md:text-8xl font-orbitron font-black text-neon-purple absolute top-0 left-0 translate-x-[2px] opacity-50 animate-pulse z-0 mix-blend-screen" style={{ animationDelay: '0.1s' }}>
                        CLASS<span className="text-neon-yellow">SYNC</span>
                    </h1>
                </div>

                {/* Cyber Loader */}
                <div className="w-80 md:w-96 h-2 bg-gray-800 relative overflow-hidden clip-path-slant mx-auto mb-4">
                    <motion.div
                        className="h-full bg-neon-yellow shadow-[0_0_15px_rgba(204,255,0,0.8)]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear", duration: 0.1 }} // Smooth out the jumps
                    />
                </div>

                {/* Tech Info */}
                <div className="flex flex-col items-center gap-1 w-80 md:w-96 mx-auto">
                    <div className="flex justify-between w-full text-xs font-code text-neon-blue/80 uppercase tracking-widest">
                        <span>{text}</span>
                        <span>{Math.floor(progress)}%</span>
                    </div>

                    {longLoadMessage && (
                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={longLoadMessage}
                            className="text-[10px] text-neon-pink mt-2 font-orbitron tracking-widest animate-pulse"
                        >
                            {longLoadMessage}
                        </motion.p>
                    )}
                </div>
            </div>

            {/* Matrix-like decorative text */}
            <div className="absolute bottom-10 left-10 text-[10px] text-gray-600 font-code flex flex-col gap-1 opacity-50">
                <span>:: MEMORY_ALLOC: 0x452F22 ::</span>
                <span>:: SECURE_CONN: <span className="text-neon-green">ESTABLISHED</span> ::</span>
                <span>:: RENDER_ENGINE: <span className="text-neon-pink">VITE_TURBO</span> ::</span>
            </div>

            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-purple to-transparent opacity-50"></div>
            <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-yellow to-transparent opacity-50"></div>
        </div>
    );
};

export default LoadingScreen;
