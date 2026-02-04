const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import the Timetable model
const TimetableSchema = new mongoose.Schema({
    day: { type: String, required: true, unique: true },
    slots: [
        {
            time: String,
            endTime: String,
            subject: String,
            teacher: String,
            room: String
        }
    ]
});

const Timetable = mongoose.model('Timetable', TimetableSchema);

async function importTimetable() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Read the timetable data
        const timetableData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '..', '..', 'timetable_data.json'), 'utf8')
        );

        console.log('Importing timetable data...');

        // Import each day
        for (const [day, slots] of Object.entries(timetableData)) {
            // Filter out empty slots
            const validSlots = slots.filter(slot => slot.subject && slot.subject.trim() !== '');

            // Find existing or create new
            let timetableEntry = await Timetable.findOne({ day });

            if (timetableEntry) {
                timetableEntry.slots = validSlots;
                await timetableEntry.save();
                console.log(`✓ Updated ${day} with ${validSlots.length} slots`);
            } else {
                timetableEntry = new Timetable({ day, slots: validSlots });
                await timetableEntry.save();
                console.log(`✓ Created ${day} with ${validSlots.length} slots`);
            }
        }

        console.log('\n✅ Timetable import completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error importing timetable:', error);
        process.exit(1);
    }
}

importTimetable();
