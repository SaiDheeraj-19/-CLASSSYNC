const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/assignments
// @desc    Get all assignments
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Automatically delete expired assignments
        const now = new Date();
        await Assignment.deleteMany({ deadline: { $lt: now } });

        // Sort by deadline ascending
        const assignments = await Assignment.find()
            .populate('createdBy', 'name')
            .sort({ deadline: 1 });
        res.json(assignments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/assignments
// @desc    Create an assignment
// @access  Private (Admin)
router.post('/', [auth, admin], async (req, res) => {
    const { title, description, subject, deadline } = req.body;

    try {
        const newAssignment = new Assignment({
            title,
            description,
            subject,
            deadline,
            createdBy: req.user.id
        });

        const assignment = await newAssignment.save();
        res.json(assignment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/assignments/:id
// @desc    Update an assignment
// @access  Private (Admin)
router.put('/:id', [auth, admin], async (req, res) => {
    const { title, description, subject, deadline } = req.body;

    try {
        let assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });

        assignment.title = title || assignment.title;
        assignment.description = description || assignment.description;
        assignment.subject = subject || assignment.subject;
        assignment.deadline = deadline || assignment.deadline;

        await assignment.save();
        res.json(assignment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/assignments/:id
// @desc    Delete an assignment
// @access  Private (Admin)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        await assignment.deleteOne();

        res.json({ message: 'Assignment removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
