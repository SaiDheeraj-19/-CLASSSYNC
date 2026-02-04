import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FaTrash, FaPlus, FaSave, FaDownload } from 'react-icons/fa';

const TimetableManager = () => {
    const [timetable, setTimetable] = useState([]);
    const [activeDay, setActiveDay] = useState('Monday');
    const [slots, setSlots] = useState([]);
    // Store all day timetables locally to preserve changes when switching days
    const [dayTimetables, setDayTimetables] = useState({});
    const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved'

    // Days constant
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const fetchTimetable = async () => {
        try {
            const res = await api.get('/timetable');
            setTimetable(res.data);

            // Build day-specific timetables object
            const dayData = {};
            res.data.forEach(t => {
                dayData[t.day] = t.slots || [];
            });
            setDayTimetables(dayData);

            // Load slots for default active day
            const current = res.data.find(t => t.day === 'Monday');
            if (current) setSlots(current.slots || []);
            else setSlots([]);

        } catch (err) {
            console.error(err);
        }
    };

    const handleDownload = () => {
        if (!timetable || timetable.length === 0) {
            alert('No timetable data to download');
            return;
        }

        const headers = ['Day', 'Start Time', 'End Time', 'Subject', 'Teacher', 'Room'];
        const rows = [];

        // Sort by day order
        const sorted = [...timetable].sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day));

        sorted.forEach(dayData => {
            dayData.slots.forEach(slot => {
                rows.push([
                    dayData.day,
                    slot.time,
                    slot.endTime || '',
                    `"${slot.subject}"`,
                    `"${slot.teacher || ''}"`,
                    `"${slot.room || ''}"`
                ]);
            });
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "full_timetable.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        fetchTimetable();
    }, []);

    const handleDayChange = (day) => {
        if (day === activeDay) return; // Don't reload if same day

        // Save current day's changes before switching
        const updatedDayTimetables = {
            ...dayTimetables,
            [activeDay]: slots
        };
        setDayTimetables(updatedDayTimetables);

        // Switch to new day
        setActiveDay(day);

        // Load the new day's slots from our local state or empty array
        const newDaySlots = updatedDayTimetables[day] || [];
        setSlots(newDaySlots);
    };

    const handleAddSlot = () => {
        setSlots([...slots, { time: '', endTime: '', subject: '', teacher: '', room: '' }]);
    };

    const handleSlotChange = (index, field, value) => {
        const newSlots = [...slots];
        newSlots[index][field] = value;
        setSlots(newSlots);
    };

    const handleRemoveSlot = (index) => {
        const newSlots = slots.filter((_, i) => i !== index);
        setSlots(newSlots);
    };

    const handleSave = async () => {
        try {
            setSaveStatus('saving');

            // First, update dayTimetables with current slots
            const updatedDayTimetables = {
                ...dayTimetables,
                [activeDay]: slots
            };

            // Validate
            if (slots.some(s => !s.time || !s.endTime || !s.subject)) {
                alert('Start Time, End Time, and Subject are required for all slots');
                setSaveStatus('');
                return;
            }

            const response = await api.post('/timetable', {
                day: activeDay,
                slots: slots
            });

            // Update local state immediately
            setDayTimetables(updatedDayTimetables);

            // Update timetable array with the saved data
            const existingDayIndex = timetable.findIndex(t => t.day === activeDay);
            const newTimetable = [...timetable];

            if (existingDayIndex !== -1) {
                // Update existing day
                newTimetable[existingDayIndex] = response.data;
            } else {
                // Add new day
                newTimetable.push(response.data);
            }

            setTimetable(newTimetable);

            // Show success status
            setSaveStatus('saved');

            // Clear status after 2 seconds
            setTimeout(() => {
                setSaveStatus('');
            }, 2000);
        } catch (err) {
            console.error(err);
            alert('Error updating timetable');
            setSaveStatus('');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white font-orbitron">Manage Timetable</h2>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-neon-blue/20 border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black px-4 py-2 transition-colors font-bold text-sm"
                >
                    <FaDownload /> Download Valid CSV
                </button>
            </div>

            {/* Official Time Slots Reference */}
            <div className="bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 backdrop-blur-xl border border-neon-purple/30 p-4 mb-6 rounded-lg">
                <h3 className="text-sm font-bold text-neon-purple mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Official Class Timings
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <div className="bg-black/30 border border-white/10 p-3 rounded">
                        <div className="text-neon-yellow font-bold text-sm mb-1">P1</div>
                        <div className="text-white text-xs">09:00 AM</div>
                        <div className="text-gray-400 text-xs">10:00 AM</div>
                    </div>
                    <div className="bg-black/30 border border-white/10 p-3 rounded">
                        <div className="text-neon-yellow font-bold text-sm mb-1">P2</div>
                        <div className="text-white text-xs">10:00 AM</div>
                        <div className="text-gray-400 text-xs">11:00 AM</div>
                    </div>
                    <div className="bg-black/30 border border-white/10 p-3 rounded">
                        <div className="text-neon-yellow font-bold text-sm mb-1">P3</div>
                        <div className="text-white text-xs">11:15 AM</div>
                        <div className="text-gray-400 text-xs">12:15 PM</div>
                    </div>
                    <div className="bg-black/30 border border-white/10 p-3 rounded">
                        <div className="text-neon-green font-bold text-sm mb-1">P4</div>
                        <div className="text-white text-xs">01:00 PM</div>
                        <div className="text-gray-400 text-xs">02:00 PM</div>
                    </div>
                    <div className="bg-black/30 border border-white/10 p-3 rounded">
                        <div className="text-neon-green font-bold text-sm mb-1">P5</div>
                        <div className="text-white text-xs">02:00 PM</div>
                        <div className="text-gray-400 text-xs">03:00 PM</div>
                    </div>
                    <div className="bg-black/30 border border-white/10 p-3 rounded">
                        <div className="text-neon-green font-bold text-sm mb-1">P6</div>
                        <div className="text-white text-xs">03:00 PM</div>
                        <div className="text-gray-400 text-xs">04:00 PM</div>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {days.map(day => (
                    <button
                        key={day}
                        onClick={() => handleDayChange(day)}
                        className={`px-4 py-2 whitespace-nowrap transition-colors border ${activeDay === day ? 'bg-neon-purple text-white font-bold border-neon-purple' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'}`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Schedule for {activeDay}</h3>
                    <button
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                        className={`px-6 py-3 font-bold border-2 flex items-center gap-2 transition-all transform ${saveStatus === 'saved'
                            ? 'bg-green-500 border-green-500 text-white scale-105'
                            : saveStatus === 'saving'
                                ? 'bg-yellow-500 border-yellow-500 text-black opacity-75 cursor-wait'
                                : 'bg-neon-green text-black border-neon-green hover:bg-black hover:text-neon-green hover:scale-105 animate-pulse'
                            }`}
                    >
                        <FaSave className={saveStatus === 'saving' ? 'animate-spin' : ''} />
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved!' : 'Save Changes'}
                    </button>
                </div>

                <div className="space-y-4">
                    {slots.map((slot, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white/5 p-4 border border-white/10">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Start Time</label>
                                <input
                                    type="text"
                                    placeholder="10:00 AM"
                                    className="w-full mt-1 bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                    value={slot.time}
                                    onChange={(e) => handleSlotChange(index, 'time', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">End Time</label>
                                <input
                                    type="text"
                                    placeholder="11:00 AM"
                                    className="w-full mt-1 bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                    value={slot.endTime || ''}
                                    onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-4">
                                <label className="text-xs font-bold text-gray-400 uppercase">Subject</label>
                                <input
                                    type="text"
                                    placeholder="Subject Name"
                                    className="w-full mt-1 bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                    value={slot.subject}
                                    onChange={(e) => handleSlotChange(index, 'subject', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-xs font-bold text-gray-400 uppercase">Teacher</label>
                                <input
                                    type="text"
                                    placeholder="Teacher Name"
                                    className="w-full mt-1 bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                    value={slot.teacher}
                                    onChange={(e) => handleSlotChange(index, 'teacher', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Room</label>
                                <input
                                    type="text"
                                    placeholder="Room No."
                                    className="w-full mt-1 bg-black/30 border border-white/20 text-white px-3 py-2 focus:outline-none focus:border-neon-purple transition-colors"
                                    value={slot.room}
                                    onChange={(e) => handleSlotChange(index, 'room', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-1 flex justify-center pb-2">
                                <button onClick={() => handleRemoveSlot(index)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 transition-colors">
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button onClick={handleAddSlot} className="w-full py-3 border-2 border-dashed border-white/20 text-gray-400 hover:border-neon-purple hover:text-neon-purple transition-colors flex items-center justify-center gap-2">
                        <FaPlus /> Add Class Slot
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimetableManager;
