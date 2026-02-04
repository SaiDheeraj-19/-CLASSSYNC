const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/timetable
// @desc    Get full timetable
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const timetable = await Timetable.find();
        // Sort logic could be improved (Mon-Sun), but frontend can handle or we assume insert order/day string map
        // Custom sort:
        const daysOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };

        timetable.sort((a, b) => daysOrder[a.day] - daysOrder[b.day]);

        res.json(timetable);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/timetable
// @desc    Create or Update a day's timetable
// @access  Private (Admin)
router.post('/', [auth, admin], async (req, res) => {
    const { day, slots } = req.body;

    try {
        let timetable = await Timetable.findOne({ day });

        if (timetable) {
            timetable.slots = slots;
            await timetable.save();
            return res.json(timetable);
        }

        timetable = new Timetable({
            day,
            slots
        });

        await timetable.save();
        res.json(timetable);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/timetable/:id
// @desc    Delete a day entry
// @access  Private (Admin)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        await Timetable.findByIdAndDelete(req.params.id);
        res.json({ message: 'Timetable entry removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
