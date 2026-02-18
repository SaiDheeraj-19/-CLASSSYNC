const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const { auth, admin } = require('../middleware/auth');

// Get all polls
router.get('/', auth, async (req, res) => {
    try {
        const polls = await Poll.find()
            .populate('createdBy', 'name')
            .populate('options.votedBy', 'name rollNumber')
            .sort({ createdAt: -1 });
        res.json(polls);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a new poll (Admin only)
const { notifyAllStudents } = require('../services/notificationService');

// Create a new poll (Admin only)
router.post('/', [auth, admin], async (req, res) => {
    const { question, options } = req.body;

    try {
        console.log(`[POLL] Creating new poll: ${question}`);
        const newPoll = new Poll({
            question,
            options: options.map(opt => ({ text: opt, votes: 0 })),
            createdBy: req.user.id
        });

        const poll = await newPoll.save();
        console.log(`[POLL] Saved to DB: ${poll._id}`);

        // Send Notification (Background Process)
        console.log('[POLL] Triggering notification in background...');

        // Do NOT await this, to prevent request timeout on Vercel/Render
        notifyAllStudents(
            `New Poll: ${question}`,
            `A new poll has been created: "${question}". Please vote!`,
            `<p>A new poll has been created: "<strong>${question}</strong>".</p><p>Please log in to vote.</p>`
        ).catch(err => console.error('[POLL] Background notification failed:', err));

        console.log('[POLL] Notification process started. Sending immediate response.');

        res.json(poll);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Vote in a poll
router.post('/:id/vote', auth, async (req, res) => {
    const { optionIndex } = req.body;

    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ msg: 'Poll not found' });

        if (!poll.active) return res.status(400).json({ msg: 'Poll is closed' });

        // Check if user has already voted
        if (poll.votedBy.includes(req.user.id)) {
            return res.status(400).json({ msg: 'User already voted' });
        }

        // Increment vote count
        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return res.status(400).json({ msg: 'Invalid option' });
        }

        poll.options[optionIndex].votes += 1;
        poll.options[optionIndex].votedBy.push(req.user.id);
        poll.votedBy.push(req.user.id);

        await poll.save();
        res.json(poll);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a poll (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ msg: 'Poll not found' });

        await Poll.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Poll removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Toggle active status (Admin only)
router.put('/:id/toggle', [auth, admin], async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ msg: 'Poll not found' });

        poll.active = !poll.active;
        await poll.save();
        res.json(poll);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
