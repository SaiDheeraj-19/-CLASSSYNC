import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaClipboardList, FaBell, FaSignOutAlt, FaChartPie, FaBook, FaBars, FaTimes, FaUserCog } from 'react-icons/fa';

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
                            <p className="text-xs text-neon-yellow/80 uppercase tracking-widest">{user?.rollNumber || 'STUDENT'}</p>
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
        </div>
    );
};

export default StudentDashboard;
