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

const { notifyAllStudents } = require('../services/notificationService');

// @route   POST api/notices
// @desc    Create a notice
// @access  Private (Admin)
router.post('/', [auth, admin], async (req, res) => {
    const { title, content, type } = req.body;

    try {
        console.log(`[NOTICE] Creating: ${title}`);
        const newNotice = new Notice({
            title,
            content,
            type,
            postedBy: req.user.id
        });

        const notice = await newNotice.save();
        console.log(`[NOTICE] Saved to DB: ${notice._id}`);

        // 🔔 Send Notification
        console.log('[NOTICE] Triggering notification...');
        await notifyAllStudents(
            `New Notice: ${title}`,
            `A new notice has been posted.\nTitle: ${title}\nContent: ${content}`,
            `<h3>New Notice Posted</h3><div style="background:#222; padding:15px; border-radius:5px;"><p><strong>Title:</strong> ${title}</p><p>${content}</p></div><p>Check the portal for details.</p>`
        );
        console.log('[NOTICE] Notification complete.');

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

// @route   PUT api/notices/:id
// @desc    Update a notice
// @access  Private (Admin)
router.put('/:id', [auth, admin], async (req, res) => {
    const { title, content, type, link } = req.body;

    try {
        let notice = await Notice.findById(req.params.id);
        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        notice.title = title || notice.title;
        notice.content = content || notice.content;
        notice.type = type || notice.type;
        notice.link = link || notice.link;
        notice.date = Date.now(); // Update the timestamp

        await notice.save();
        res.json(notice);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
