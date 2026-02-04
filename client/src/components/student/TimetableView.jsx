import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { FaCalendarDay, FaClock, FaChalkboardTeacher, FaDoorOpen } from 'react-icons/fa';

const TimetableView = () => {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState('');

    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const fetchTimetable = useCallback(async () => {
        try {
            const res = await api.get('/timetable');
            setTimetable(res.data);

            // Set active day to today if available, otherwise first available day
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            if (res.data.find(t => t.day === today)) {
                setActiveDay(today);
            } else if (res.data.length > 0) {
                setActiveDay(res.data[0].day);
            }
        } catch {
            console.error("Error fetching timetable");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTimetable();
    }, [fetchTimetable]);

    const sortedTimetable = [...timetable].sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));
    const currentDaySchedule = sortedTimetable.find(t => t.day === activeDay);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400 animate-pulse">Loading Timetable...</div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-white font-orbitron flex items-center gap-2">
                <FaCalendarDay className="text-neon-blue" /> Class Timetable
            </h2>

            {/* Day Selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {sortedTimetable.length > 0 ? (
                    sortedTimetable.map((dayData) => (
                        <button
                            key={dayData.day}
                            onClick={() => setActiveDay(dayData.day)}
                            className={`px-6 py-2 whitespace-nowrap transition-all border ${activeDay === dayData.day
                                ? 'bg-neon-yellow text-black font-bold border-neon-yellow shadow-[0_0_10px_rgba(255,234,0,0.3)]'
                                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {dayData.day}
                        </button>
                    ))
                ) : (
                    daysOrder.map((day) => (
                        <button
                            key={day}
                            className="px-6 py-2 whitespace-nowrap bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed"
                            disabled
                        >
                            {day}
                        </button>
                    ))
                )}
            </div>

            {/* Schedule List */}
            <div className="space-y-4">
                {currentDaySchedule && currentDaySchedule.slots && currentDaySchedule.slots.length > 0 ? (
                    currentDaySchedule.slots.map((slot, index) => (
                        <div
                            key={index}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 flex items-center gap-6 group hover:border-neon-purple/50 transition-colors"
                        >
                            <div className="w-32 flex-shrink-0 text-center">
                                <p className="text-gray-500 text-xs uppercase tracking-wider flex items-center justify-center gap-1">
                                    <FaClock className="text-neon-blue" /> Time
                                </p>
                                <p className="text-xl font-bold text-white">{slot.time}</p>
                                {slot.endTime && <p className="text-xs text-gray-400 font-code">{slot.endTime}</p>}
                            </div>
                            <div className="h-10 w-px bg-white/20"></div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-neon-purple">{slot.subject}</h4>
                                <p className="text-gray-400 flex items-center gap-1">
                                    <FaChalkboardTeacher className="text-xs" /> {slot.teacher || 'Not assigned'}
                                </p>
                            </div>
                            <div className="hidden sm:block text-right">
                                <span className="bg-white/10 text-gray-300 px-3 py-1 text-sm font-medium flex items-center gap-1">
                                    <FaDoorOpen /> {slot.room || 'TBA'}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 bg-white/5 backdrop-blur-xl border border-white/10">
                        <FaCalendarDay className="text-4xl text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {sortedTimetable.length === 0
                                ? 'No timetable has been set up yet. Ask your admin to configure the timetable.'
                                : 'No classes scheduled for this day.'
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Today indicator */}
            {new Date().toLocaleDateString('en-US', { weekday: 'long' }) === activeDay && (
                <div className="mt-4 text-center">
                    <span className="inline-flex items-center gap-2 text-xs text-neon-green bg-neon-green/10 px-3 py-1 border border-neon-green/30">
                        <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                        Today's Schedule
                    </span>
                </div>
            )}
        </div>
    );
};

export default TimetableView;
