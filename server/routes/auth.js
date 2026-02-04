const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, admin } = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
const Config = require('../models/Config');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, password, role, rollNumber, secretKey } = req.body;

    try {
        // Validation for Admin Role
        if (role === 'admin') {
            // Fetch dynamic secret from DB, create if not exists
            let config = await Config.findOne({ key: 'admin_secret' });
            if (!config) {
                config = new Config({ key: 'admin_secret', value: 'cyberadmin2024' });
                await config.save();
            }

            if (secretKey !== config.value) {
                return res.status(403).json({ message: 'Admin registration requires a valid Secret Key' });
            }
        }

        let user = await User.findOne({ rollNumber });
        if (user) {
            return res.status(400).json({ message: 'User with this Roll Number already exists' });
        }

        user = new User({
            name,
            password,
            role: role || 'student',
            rollNumber
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            id: user.id,
            role: user.role
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, role: user.role });
            }
        );
    } catch (err) {
        console.error("SERVER REGISTRATION ERROR:", err);
        const fs = require('fs');
        fs.appendFileSync('error.log', `${new Date().toISOString()} - ${err.message}\n`);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// @route   PUT api/auth/update-secret
// @desc    Update Admin Master Key
// @access  Private (Admin)
router.put('/update-secret', [auth, admin], async (req, res) => {
    const { newSecret } = req.body;

    if (!newSecret || newSecret.length < 6) {
        return res.status(400).json({ message: 'New secret must be at least 6 characters' });
    }

    try {
        let config = await Config.findOne({ key: 'admin_secret' });
        if (!config) {
            config = new Config({ key: 'admin_secret', value: 'cyberadmin2024' });
        }

        config.value = newSecret;
        await config.save();

        res.json({ message: 'Admin Master Key updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { rollNumber, password } = req.body;

    try {
        let user = await User.findOne({ rollNumber });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            id: user.id,
            role: user.role
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, rollNumber: user.rollNumber, role: user.role } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/students
// @desc    Get all students
// @access  Private (Admin)
router.get('/students', [auth, admin], async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.json(students);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/auth/all-users
// @desc    Get all users (students and admins)
// @access  Private (Admin)
router.get('/all-users', [auth, admin], async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/auth/students/:id
// @desc    Delete a student
// @access  Private (Admin)
router.delete('/students/:id', [auth, admin], async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if (student.role !== 'student') {
            return res.status(403).json({ message: 'Cannot delete admin users' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/auth/students
// @desc    Delete all students
// @access  Private (Admin)
router.delete('/students', [auth, admin], async (req, res) => {
    try {
        await User.deleteMany({ role: 'student' });
        res.json({ message: 'All students deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
    const { name, department, semester } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (department) user.department = department;
        if (semester) user.semester = semester;

        await user.save();
        res.json({ message: 'Profile updated successfully', user: { name: user.name, department: user.department, semester: user.semester } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/auth/password
// @desc    Change user password
// @access  Private
router.put('/password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
