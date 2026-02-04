import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaUserShield, FaClipboardList, FaCalendarAlt, FaBell, FaSignOutAlt, FaUsers, FaBook, FaBars, FaTimes, FaSortNumericDown, FaUserCog, FaChartPie, FaExchangeAlt } from 'react-icons/fa';

import AttendanceManager from '../components/admin/AttendanceManager';
import AssignmentManager from '../components/admin/AssignmentManager';
import TimetableManager from '../components/admin/TimetableManager';
import NoticeManager from '../components/admin/NoticeManager';
import CalendarManager from '../components/admin/CalendarManager';
import ResourceManager from '../components/admin/ResourceManager';
import ClassManager from '../components/admin/ClassManager';
import ProfileManager from '../components/shared/ProfileManager';

// Student view components for admin's personal data
import AttendanceView from '../components/student/AttendanceView';
import AssignmentView from '../components/student/AssignmentView';
import TimetableView from '../components/student/TimetableView';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const navItems = [
        { label: 'Manage Attendance', path: '/admin', icon: <FaUsers /> },
        { label: 'Class Strength', path: '/admin/class', icon: <FaSortNumericDown /> },
        { label: 'Manage Assignments', path: '/admin/assignments', icon: <FaClipboardList /> },
        { label: 'Manage Timetable', path: '/admin/timetable', icon: <FaCalendarAlt /> },
        { label: 'Calendar & Stats', path: '/admin/calendar', icon: <FaCalendarAlt /> },
        { label: 'Manage Notes', path: '/admin/resources', icon: <FaBook /> },
        { label: 'Manage Notices', path: '/admin/notices', icon: <FaBell /> },
        // Divider
        { label: 'divider', path: '', icon: null },
        // Student view for Admin/CR
        { label: 'My Attendance', path: '/admin/my-attendance', icon: <FaChartPie /> },
        { label: 'My Assignments', path: '/admin/my-assignments', icon: <FaClipboardList /> },
        { label: 'View Timetable', path: '/admin/view-timetable', icon: <FaCalendarAlt /> },
        { label: 'My Profile', path: '/admin/profile', icon: <FaUserCog /> },
    ];

    const renderContent = () => {
        const path = location.pathname;
        if (path === '/admin/class') return <ClassManager />;
        if (path === '/admin/assignments') return <AssignmentManager />;
        if (path === '/admin/timetable') return <TimetableManager />;
        if (path === '/admin/calendar') return <CalendarManager />;
        if (path === '/admin/resources') return <ResourceManager />;
        if (path === '/admin/notices') return <NoticeManager />;
        if (path === '/admin/profile') return <ProfileManager />;
        // Student views for admin
        if (path === '/admin/my-attendance') return <AttendanceView />;
        if (path === '/admin/my-assignments') return <AssignmentView />;
        if (path === '/admin/view-timetable') return <TimetableView />;
        return <AttendanceManager />;
    };

    return (
        <div className="flex h-screen bg-cyber-black overflow-hidden relative font-rajdhani text-white">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-cyber-dark/90 backdrop-blur-md border-b border-white/10 z-50 p-4 flex justify-between items-center">
                <h1 className="text-xl font-orbitron font-bold tracking-wider text-white">
                    CLASS<span className="text-neon-purple">SYNC</span>
                </h1>
                <button onClick={toggleSidebar} className="text-neon-purple text-xl">
                    {isSidebarOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-40 w-72 bg-cyber-dark/80 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 transform 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-8 border-b border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-neon-blue/5 group-hover:bg-neon-blue/10 transition-colors"></div>
                    <h1 className="text-2xl font-orbitron font-bold text-white tracking-widest relative z-10">
                        CLASS<span className="text-neon-purple">SYNC</span>
                    </h1>
                    <div className="mt-4 flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-none bg-neon-purple flex items-center justify-center text-white font-bold font-orbitron clip-path-slant">
                            <FaUserShield />
                        </div>
                        <div>
                            <p className="font-bold text-white tracking-wide">{user?.name}</p>
                            <p className="text-xs text-neon-purple/80 uppercase tracking-widest">ADMINISTRATOR</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item, index) => {
                        // Handle divider
                        if (item.label === 'divider') {
                            return (
                                <div key={`divider-${index}`} className="my-4 border-t border-white/10 pt-4">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest px-6 mb-2">My Student View</p>
                                </div>
                            );
                        }

                        const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/');
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                                    flex items-center gap-4 px-6 py-4 rounded-none transition-all duration-300 relative overflow-hidden group
                                    ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}
                                `}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-neon-purple clip-path-slant z-0 opacity-80"></div>
                                )}
                                {!isActive && (
                                    <div className="absolute left-0 top-0 h-full w-1 bg-neon-blue scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
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
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 font-orbitron text-sm tracking-widest uppercase hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                    >
                        <FaSignOutAlt /> Terminate Session
                    </button>
                    <div className="text-center mt-4 text-[10px] text-gray-600 font-code uppercase">
                        SYSTEM_ADMIN // V 2.0.4
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex flex-col relative z-10 pt-16 md:pt-0">
                {/* Top Bar (Desktop) */}
                <div className="hidden md:flex justify-between items-center p-6 border-b border-white/5 bg-cyber-black/50 backdrop-blur-sm">
                    <h2 className="text-xl text-white font-orbitron tracking-widest uppercase">
                        <span className="text-neon-purple mr-2">//</span>
                        {navItems.find(i => i.path === location.pathname || (i.path === '/admin' && location.pathname === '/admin/'))?.label || 'Command Center'}
                    </h2>
                    <div className="flex items-center gap-4 text-xs font-code text-neon-purple/80">
                        <span>SYS_TIME: {new Date().toLocaleTimeString()}</span>
                        <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse shadow-[0_0_5px_#9d00ff]"></div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="text-white h-full">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
