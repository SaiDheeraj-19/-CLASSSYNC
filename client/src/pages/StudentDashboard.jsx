import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaClipboardList, FaBell, FaSignOutAlt, FaChartPie, FaBook, FaBars, FaTimes, FaLink, FaExternalLinkAlt, FaUserCog, FaBullhorn } from 'react-icons/fa';
import api from '../api';

// Components
import AttendanceView from '../components/student/AttendanceView';
import AssignmentView from '../components/student/AssignmentView';
import TimetableView from '../components/student/TimetableView';
import NoticeView from '../components/student/NoticeView';
import ResourceView from '../components/student/ResourceView';
import ProfileManager from '../components/shared/ProfileManager';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    // Notice Popup State
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [latestNotice, setLatestNotice] = useState(null);

    useEffect(() => {
        const checkLatestNotices = async () => {
            try {
                const res = await api.get('/notices');
                const notices = res.data;
                if (notices.length > 0) {
                    // Sort by date desc (assuming API returns them, but just in case)
                    const sorted = notices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    const latest = sorted[0];

                    // Check if posted within last 24 hours
                    const now = new Date();
                    const postedTime = new Date(latest.createdAt);
                    const diffTime = Math.abs(now - postedTime);
                    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

                    if (diffHours <= 24) {
                        setLatestNotice(latest);
                        // Small delay to appear after load
                        setTimeout(() => setShowNoticeModal(true), 1000);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch notices for popup", err);
            }
        };

        checkLatestNotices();
    }, []);

    const handleLogout = async () => {
        setLogoutLoading(true);
        // Simulate a small delay for the cyberpunk vibe
        await new Promise(resolve => setTimeout(resolve, 800));
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Attendance', path: '/student', icon: <FaChartPie /> },
        { label: 'Assignments', path: '/student/assignments', icon: <FaClipboardList /> },
        { label: 'Timetable', path: '/student/timetable', icon: <FaCalendarAlt /> },
        { label: 'Study Materials', path: '/student/resources', icon: <FaBook /> },
        { label: 'Notices', path: '/student/notices', icon: <FaBell /> },
        { label: 'My Profile', path: '/student/profile', icon: <FaUserCog /> },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const renderContent = () => {
        // Simple routing based on path to render component directly
        const path = location.pathname;
        if (path.endsWith('/assignments')) return <AssignmentView />;
        if (path.endsWith('/timetable')) return <TimetableView />;
        if (path.endsWith('/resources')) return <ResourceView />;
        if (path.endsWith('/notices')) return <NoticeView />;
        if (path.endsWith('/profile')) return <ProfileManager />;
        return <AttendanceView />;
    };

    return (
        <div className="flex h-screen bg-cyber-black overflow-hidden relative font-rajdhani text-white">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-yellow/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-cyber-dark/90 backdrop-blur-md border-b border-white/10 z-50 p-4 flex justify-between items-center">
                <h1 className="text-xl font-orbitron font-bold tracking-wider text-white">
                    CLASS<span className="text-neon-yellow">SYNC</span>
                </h1>
                <button onClick={toggleSidebar} className="text-neon-yellow text-xl">
                    {isSidebarOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-40 w-72 bg-cyber-dark/80 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 transform 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-8 border-b border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-neon-purple/5 group-hover:bg-neon-purple/10 transition-colors"></div>
                    <h1 className="text-2xl font-orbitron font-bold text-white tracking-widest relative z-10">
                        CLASS<span className="text-neon-yellow">SYNC</span>
                    </h1>
                    <div className="mt-4 flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-none bg-neon-yellow flex items-center justify-center text-black font-bold font-orbitron clip-path-slant">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <p className="font-bold text-white tracking-wide">{user?.name}</p>
                            <p className="text-xs text-neon-yellow/80 uppercase tracking-widest">
                                {user?.rollNumber || 'STUDENT'}
                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="text-neon-purple ml-2 font-bold hover:underline cursor-pointer">
                                        [ADMIN MODE]
                                    </Link>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        // Check active state more robustly
                        const isActive = location.pathname === item.path || (item.path === '/student' && location.pathname === '/student/');
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                                    flex items-center gap-4 px-6 py-4 rounded-none transition-all duration-300 relative overflow-hidden group
                                    ${isActive ? 'text-black font-bold' : 'text-gray-400 hover:text-white'}
                                `}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-neon-yellow clip-path-slant z-0"></div>
                                )}
                                {!isActive && (
                                    <div className="absolute left-0 top-0 h-full w-1 bg-neon-purple scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                                )}

                                <span className="relative z-10 text-xl">{item.icon}</span>
                                <span className="relative z-10 tracking-widest font-orbitron text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 font-orbitron text-sm tracking-widest uppercase hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] ${logoutLoading ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        <FaSignOutAlt /> {logoutLoading ? 'Terminating...' : 'Terminate'}
                    </button>
                    <div className="text-center mt-4 text-[10px] text-gray-600 font-code uppercase">
                        V 2.0.4 // SECURE
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex flex-col relative z-10 pt-16 md:pt-0">
                {/* Top Bar (Desktop) */}
                <div className="hidden md:flex justify-between items-center p-6 border-b border-white/5 bg-cyber-black/50 backdrop-blur-sm">
                    <h2 className="text-xl text-white font-orbitron tracking-widest uppercase">
                        <span className="text-neon-blue mr-2">//</span>
                        {navItems.find(i => i.path === location.pathname || (i.path === '/student' && location.pathname === '/student/'))?.label || 'Dashboard'}
                    </h2>
                    <div className="flex items-center gap-4 text-xs font-code text-neon-blue/80">
                        <span>SYS_TIME: {new Date().toLocaleTimeString()}</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    {renderContent()}
                </div>
            </div>

            {/* NOTICE POPUP MODAL */}
            {showNoticeModal && latestNotice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="relative bg-cyber-dark border-2 border-neon-purple p-8 max-w-lg w-full shadow-[0_0_30px_rgba(157,0,255,0.3)] animate-slide-up">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowNoticeModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <FaTimes size={20} />
                        </button>

                        <div className="flex flex-col items-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-neon-purple/10 flex items-center justify-center mb-4 border border-neon-purple/30">
                                <FaBullhorn className="text-3xl text-neon-purple animate-pulse" />
                            </div>
                            <span className="text-xs font-bold text-neon-blue tracking-[0.2em] mb-1">NEW ANNOUNCEMENT</span>
                            <h2 className="text-2xl font-bold text-white font-orbitron text-center uppercase">{latestNotice.title}</h2>
                        </div>

                        <div className="bg-black/20 p-4 border border-white/5 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {latestNotice.content}
                            </p>
                        </div>

                        {latestNotice.link && (
                            <a
                                href={latestNotice.link.startsWith('http') ? latestNotice.link : `https://${latestNotice.link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 bg-neon-purple text-white font-bold py-3 hover:bg-neon-purple/80 transition-all font-orbitron tracking-wider"
                            >
                                <FaExternalLinkAlt /> Open Link
                            </a>
                        )}

                        <button
                            onClick={() => setShowNoticeModal(false)}
                            className="w-full mt-3 flex items-center justify-center gap-2 bg-transparent border border-gray-600 text-gray-400 font-bold py-2 hover:border-white hover:text-white transition-all font-orbitron tracking-wider text-sm"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
