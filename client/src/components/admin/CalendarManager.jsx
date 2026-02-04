import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { FaTrash, FaCalendarCheck, FaCalculator, FaSync } from 'react-icons/fa';
import { format, getDaysInMonth, getDay, startOfMonth, addDays, isSameMonth } from 'date-fns';

const CalendarManager = () => {
    const [holidays, setHolidays] = useState([]);
    const [stats, setStats] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formHoliday, setFormHoliday] = useState({ name: '', date: '', type: 'Holiday' });

    // Auto-calculation state
    const [selectedMonth, setSelectedMonth] = useState('');
    const [calculatedStats, setCalculatedStats] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [resHolidays, resStats, resTimetable] = await Promise.all([
                api.get('/calendar/holidays'),
                api.get('/calendar/stats'),
                api.get('/timetable')
            ]);
            setHolidays(resHolidays.data);
            setStats(resStats.data);
            setTimetable(resTimetable.data);
        } catch {
            console.error("Error fetching data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddHoliday = async (e) => {
        e.preventDefault();
        try {
            await api.post('/calendar/holidays', formHoliday);
            setFormHoliday({ name: '', date: '', type: 'Holiday' });
            fetchData();
        } catch {
            alert('Failed to add holiday');
        }
    };

    const handleDeleteHoliday = async (id) => {
        if (!confirm('Delete?')) return;
        try {
            await api.delete(`/calendar/holidays/${id}`);
            fetchData();
        } catch {
            alert('Failed');
        }
    };

    // Calculate working days and classes for a month
    const calculateMonthlyStats = (year, month) => {
        const daysInMonth = getDaysInMonth(new Date(year, month));
        const startDate = startOfMonth(new Date(year, month));

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        let workingDays = 0;
        let totalClasses = 0;

        // Get periods per day from timetable
        const periodsPerDay = {};
        timetable.forEach(t => {
            periodsPerDay[t.day] = t.slots ? t.slots.length : 0;
        });

        // Get holiday dates for this month
        const holidayDates = holidays
            .filter(h => {
                const hDate = new Date(h.date);
                return isSameMonth(hDate, new Date(year, month));
            })
            .map(h => new Date(h.date).getDate());

        for (let i = 0; i < daysInMonth; i++) {
            const currentDate = addDays(startDate, i);
            const dayOfWeek = getDay(currentDate);
            const dayName = dayNames[dayOfWeek];
            const dayOfMonth = currentDate.getDate();

            // Skip Sundays (you can modify this for your needs)
            if (dayOfWeek === 0) continue;

            // Skip holidays
            if (holidayDates.includes(dayOfMonth)) continue;

            // Count working day
            workingDays++;

            // Add classes based on timetable
            const classesOnDay = periodsPerDay[dayName] || 0;
            totalClasses += classesOnDay;
        }

        return {
            workingDays,
            totalClasses,
            holidaysInMonth: holidayDates.length
        };
    };

    const handleCalculate = () => {
        if (!selectedMonth) {
            alert('Please select a month');
            return;
        }

        const [year, month] = selectedMonth.split('-').map(Number);
        const stats = calculateMonthlyStats(year, month - 1); // month is 0-indexed
        setCalculatedStats({
            ...stats,
            monthLabel: format(new Date(year, month - 1), 'MMMM yyyy')
        });
    };

    const handleSaveCalculatedStats = async () => {
        if (!calculatedStats) return;

        try {
            await api.post('/calendar/stats', {
                month: calculatedStats.monthLabel,
                totalWorkingDays: calculatedStats.workingDays,
                totalClassesConducted: calculatedStats.totalClasses,
                notes: `Auto-calculated. Holidays: ${calculatedStats.holidaysInMonth}`
            });
            fetchData();
            setCalculatedStats(null);
            setSelectedMonth('');
            alert('Stats saved!');
        } catch {
            alert('Failed to save stats');
        }
    };

    const handleDeleteStat = async (id) => {
        if (!confirm('Delete?')) return;
        try {
            await api.delete(`/calendar/stats/${id}`);
            fetchData();
        } catch {
            alert('Failed');
        }
    };

    if (loading) return <div className="text-gray-400">Loading Calendar Data...</div>;

    return (
        <div className="space-y-8">
            {/* Auto-Calculate Section */}
            <div className="bg-white/5 backdrop-blur-xl border border-neon-blue/30 p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white font-orbitron">
                    <FaCalculator className="text-neon-blue" /> Auto-Calculate Monthly Stats
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                    Automatically calculates total working days and classes based on your timetable and registered holidays.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Select Month</label>
                        <input
                            type="month"
                            className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-blue transition-colors"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleCalculate}
                            className="w-full bg-neon-blue/20 border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black font-bold py-2 px-4 transition-colors flex items-center justify-center gap-2"
                        >
                            <FaSync /> Calculate
                        </button>
                    </div>
                    {calculatedStats && (
                        <div className="flex items-end">
                            <button
                                onClick={handleSaveCalculatedStats}
                                className="w-full bg-neon-green text-black font-bold py-2 px-4 hover:bg-neon-green/80 transition-colors"
                            >
                                Save to Stats
                            </button>
                        </div>
                    )}
                </div>

                {calculatedStats && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-black/30 border border-white/10 p-4 text-center">
                            <p className="text-3xl font-bold text-neon-green">{calculatedStats.workingDays}</p>
                            <p className="text-xs text-gray-400 uppercase">Working Days</p>
                        </div>
                        <div className="bg-black/30 border border-white/10 p-4 text-center">
                            <p className="text-3xl font-bold text-neon-blue">{calculatedStats.totalClasses}</p>
                            <p className="text-xs text-gray-400 uppercase">Total Classes</p>
                        </div>
                        <div className="bg-black/30 border border-white/10 p-4 text-center">
                            <p className="text-3xl font-bold text-neon-yellow">{calculatedStats.holidaysInMonth}</p>
                            <p className="text-xs text-gray-400 uppercase">Holidays</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Holidays Section */}
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white font-orbitron">
                        <FaCalendarCheck className="text-neon-yellow" /> Manage Holidays
                    </h3>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 mb-6">
                        <form onSubmit={handleAddHoliday} className="space-y-3">
                            <input
                                type="text"
                                className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                placeholder="Holiday Name (e.g. Christmas)"
                                value={formHoliday.name}
                                onChange={e => setFormHoliday({ ...formHoliday, name: e.target.value })}
                                required
                            />
                            <input
                                type="date"
                                className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                value={formHoliday.date}
                                onChange={e => setFormHoliday({ ...formHoliday, date: e.target.value })}
                                required
                            />
                            <select
                                className="w-full bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                value={formHoliday.type}
                                onChange={e => setFormHoliday({ ...formHoliday, type: e.target.value })}
                            >
                                <option value="Holiday" className="bg-cyber-dark">Holiday</option>
                                <option value="Event" className="bg-cyber-dark">Event</option>
                            </select>
                            <button className="btn-primary w-full text-sm">Add Holiday</button>
                        </form>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
                        <ul className="divide-y divide-white/10">
                            {holidays.map(h => (
                                <li key={h._id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                                    <div>
                                        <p className="font-semibold text-white">{h.name}</p>
                                        <p className="text-xs text-gray-400">{format(new Date(h.date), 'PPP')} • {h.type}</p>
                                    </div>
                                    <button onClick={() => handleDeleteHoliday(h._id)} className="text-red-400 hover:text-red-300 transition-colors">
                                        <FaTrash />
                                    </button>
                                </li>
                            ))}
                            {holidays.length === 0 && <p className="p-4 text-center text-gray-500">No holidays added.</p>}
                        </ul>
                    </div>
                </div>

                {/* Monthly Stats Section */}
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white font-orbitron">
                        Saved Monthly Stats
                    </h3>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                        <ul className="divide-y divide-white/10">
                            {stats.map(s => (
                                <li key={s._id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                                    <div>
                                        <p className="font-bold text-white">{s.month}</p>
                                        <p className="text-xs text-gray-400">
                                            Working Days: <strong className="text-neon-green">{s.totalWorkingDays}</strong> •
                                            Classes: <strong className="text-neon-blue">{s.totalClassesConducted}</strong>
                                        </p>
                                        {s.notes && <p className="text-xs text-gray-500 italic mt-1">{s.notes}</p>}
                                    </div>
                                    <button onClick={() => handleDeleteStat(s._id)} className="text-red-400 hover:text-red-300 transition-colors">
                                        <FaTrash />
                                    </button>
                                </li>
                            ))}
                            {stats.length === 0 && <p className="p-4 text-center text-gray-500">No stats saved yet. Use auto-calculate above!</p>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarManager;
