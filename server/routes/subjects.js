const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/subjects
// @desc    Get all subjects
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ name: 1 });
        res.json(subjects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/subjects
// @desc    Add a subject
// @access  Private (Admin)
router.post('/', [auth, admin], async (req, res) => {
    const { name, code } = req.body;

    try {
        let subject = await Subject.findOne({ name });
        if (subject) {
            return res.status(400).json({ message: 'Subject already exists' });
        }

        subject = new Subject({
            name,
            code
        });

        await subject.save();
        res.json(subject);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/subjects/:id
// @desc    Delete a subject
// @access  Private (Admin)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        await Subject.findByIdAndDelete(req.params.id);
        res.json({ message: 'Subject deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
