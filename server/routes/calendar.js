const express = require('express');
const router = express.Router();
const Holiday = require('../models/Holiday');
const MonthlyStat = require('../models/MonthlyStat');
const { auth, admin } = require('../middleware/auth');

// --- Holidays ---

// @route   GET api/calendar/holidays
// @desc    Get all holidays
// @access  Private
router.get('/holidays', auth, async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });
        res.json(holidays);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/calendar/holidays
// @desc    Add a holiday
// @access  Private (Admin)
router.post('/holidays', [auth, admin], async (req, res) => {
    const { name, date, type } = req.body;
    try {
        const newHoliday = new Holiday({ name, date, type });
        await newHoliday.save();
        res.json(newHoliday);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/calendar/holidays/:id
// @desc    Delete a holiday
// @access  Private (Admin)
router.delete('/holidays/:id', [auth, admin], async (req, res) => {
    try {
        await Holiday.findByIdAndDelete(req.params.id);
        res.json({ message: 'Holiday deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Monthly Stats ---

// @route   GET api/calendar/stats
// @desc    Get monthly stats
// @access  Private
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await MonthlyStat.find().sort({ createdAt: -1 });
        res.json(stats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/calendar/stats
// @desc    Add/Update monthly stat
// @access  Private (Admin)
router.post('/stats', [auth, admin], async (req, res) => {
    const { month, totalWorkingDays, totalClassesConducted, notes } = req.body;
    try {
        let stat = await MonthlyStat.findOne({ month });
        if (stat) {
            stat.totalWorkingDays = totalWorkingDays;
            stat.totalClassesConducted = totalClassesConducted;
            stat.notes = notes;
            await stat.save();
            return res.json(stat);
        }

        stat = new MonthlyStat({ month, totalWorkingDays, totalClassesConducted, notes });
        await stat.save();
        res.json(stat);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/calendar/stats/:id
// @desc    Delete monthly stat
// @access  Private (Admin)
router.delete('/stats/:id', [auth, admin], async (req, res) => {
    try {
        await MonthlyStat.findByIdAndDelete(req.params.id);
        res.json({ message: 'Stat deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
