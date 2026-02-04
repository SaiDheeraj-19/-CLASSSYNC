import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FaTrash, FaPlus, FaSave } from 'react-icons/fa';

const TimetableManager = () => {
    const [timetable, setTimetable] = useState([]);
    const [activeDay, setActiveDay] = useState('Monday');
    const [slots, setSlots] = useState([]);

    // Days constant
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const fetchTimetable = async () => {
        try {
            const res = await api.get('/timetable');
            setTimetable(res.data);

            // Load slots for default active day
            const current = res.data.find(t => t.day === 'Monday');
            if (current) setSlots(current.slots);
            else setSlots([]);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTimetable();
    }, []);

    const handleDayChange = (day) => {
        setActiveDay(day);
        const current = timetable.find(t => t.day === day);
        if (current) setSlots(current.slots);
        else setSlots([]);
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
            // Validate
            if (slots.some(s => !s.time || !s.endTime || !s.subject)) {
                alert('Start Time, End Time, and Subject are required for all slots');
                return;
            }

            await api.post('/timetable', {
                day: activeDay,
                slots
            });
            alert(`Timetable for ${activeDay} updated!`);
            fetchTimetable(); // Refresh
        } catch (err) {
            console.error(err);
            alert('Error updating timetable');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white font-orbitron">Manage Timetable</h2>
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
                    <button onClick={handleSave} className="px-4 py-2 bg-neon-green text-black font-bold hover:bg-neon-green/80 flex items-center gap-2 transition-colors">
                        <FaSave /> Save Changes
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
