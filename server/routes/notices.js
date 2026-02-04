const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/notices
// @desc    Get all notices
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const notices = await Notice.find().sort({ date: -1 });
        res.json(notices);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/notices
// @desc    Create a notice
// @access  Private (Admin)
router.post('/', [auth, admin], async (req, res) => {
    const { title, content, type } = req.body;

    try {
        const newNotice = new Notice({
            title,
            content,
            type,
            postedBy: req.user.id
        });

        const notice = await newNotice.save();
        res.json(notice);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/notices/:id
// @desc    Delete a notice
// @access  Private (Admin)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        await notice.deleteOne();

        res.json({ message: 'Notice removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
