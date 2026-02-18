const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/resources
// @desc    Get all resources
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 });
        res.json(resources);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const { notifyAllStudents } = require('../services/notificationService');

// @route   POST api/resources
// @desc    Add a resource (Note)
// @access  Private (Admin)
router.post('/', [auth, admin], async (req, res) => {
    const { title, subject, description, link } = req.body;

    try {
        console.log(`[RESOURCE] Uploading: ${title} for ${subject}`);
        const newResource = new Resource({
            title,
            subject,
            description,
            link,
            uploadedBy: req.user.id
        });

        await newResource.save();
        console.log(`[RESOURCE] Saved to DB.`);

        // Send Notification
        console.log('[RESOURCE] Triggering notification...');
        await notifyAllStudents(
            `New Resource: ${title}`,
            `A new resource "${title}" for ${subject} has been uploaded.`,
            `<p>A new resource "<strong>${title}</strong>" for <strong>${subject}</strong> has been uploaded.</p><p>${description}</p><p>Check it out in the resources section.</p>`
        );
        console.log('[RESOURCE] Notification complete.');

        res.json(newResource);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/resources/:id
// @desc    Delete a resource
// @access  Private (Admin)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        await Resource.findByIdAndDelete(req.params.id);
        res.json({ message: 'Resource deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
