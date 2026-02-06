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

        // Normalize roll number to uppercase for consistency
        const normalizedRollNumber = rollNumber.toUpperCase().trim();

        // Case-insensitive check for existing user
        let user = await User.findOne({
            rollNumber: { $regex: new RegExp(`^${normalizedRollNumber}$`, 'i') }
        });
        if (user) {
            return res.status(400).json({ message: 'User with this Roll Number already exists' });
        }

        user = new User({
            name: name.trim(),
            password,
            role: role || 'student',
            rollNumber: normalizedRollNumber
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
        // Case-insensitive roll number search to fix login issues
        let user = await User.findOne({
            rollNumber: { $regex: new RegExp(`^${rollNumber}$`, 'i') }
        });

        if (!user) {
            console.log(`Login failed: Roll number not found - ${rollNumber}`);
            return res.status(400).json({ message: 'Invalid Roll Number or Password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Login failed: Wrong password for roll number - ${rollNumber}`);
            return res.status(400).json({ message: 'Invalid Roll Number or Password' });
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
                console.log(`Login successful for: ${user.rollNumber} (${user.name})`);
                res.json({ token, user: { id: user.id, name: user.name, rollNumber: user.rollNumber, role: user.role } });
            }
        );
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Server error. Please try again.' });
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

// @route   PUT api/auth/students/:id
// @desc    Update student details (Admin only)
// @access  Private (Admin)
router.put('/students/:id', [auth, admin], async (req, res) => {
    const { name, rollNumber } = req.body;

    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If updating roll number, check if it's already taken by someone else (case-insensitive)
        if (rollNumber && rollNumber.toUpperCase() !== user.rollNumber.toUpperCase()) {
            const normalizedNewRoll = rollNumber.toUpperCase().trim();
            const existingUser = await User.findOne({
                rollNumber: { $regex: new RegExp(`^${normalizedNewRoll}$`, 'i') }
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Roll Number already exists' });
            }
            user.rollNumber = normalizedNewRoll;
        }

        if (name) user.name = name;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
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

// @route   POST api/auth/forgot-password
// @desc    Reset password using roll number and name verification
// @access  Public
router.post('/forgot-password', async (req, res) => {
    const { rollNumber, name, newPassword } = req.body;

    try {
        // Validate input
        if (!rollNumber || !name || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Case-insensitive search for roll number
        const user = await User.findOne({
            rollNumber: { $regex: new RegExp(`^${rollNumber}$`, 'i') }
        });

        if (!user) {
            return res.status(404).json({ message: 'No account found with this roll number' });
        }

        // Verify name matches (case-insensitive, trimmed)
        const userName = user.name.toLowerCase().trim();
        const providedName = name.toLowerCase().trim();

        if (userName !== providedName) {
            return res.status(400).json({ message: 'Verification failed. Name does not match our records.' });
        }

        // Reset password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        console.log(`Password reset successful for: ${user.rollNumber} (${user.name})`);
        res.json({ message: 'Password reset successfully! You can now login with your new password.' });
    } catch (err) {
        console.error('Forgot password error:', err.message);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// @route   PUT api/auth/reset-password/:id
// @desc    Admin resets a student's password
// @access  Private (Admin)
router.put('/reset-password/:id', [auth, admin], async (req, res) => {
    const { newPassword } = req.body;

    try {
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        console.log(`Admin reset password for: ${user.rollNumber} (${user.name})`);
        res.json({ message: `Password reset successfully for ${user.name}` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/check-user
// @desc    Check if a user exists with the given roll number
// @access  Public
router.post('/check-user', async (req, res) => {
    const { rollNumber } = req.body;

    try {
        const user = await User.findOne({
            rollNumber: { $regex: new RegExp(`^${rollNumber}$`, 'i') }
        });

        if (!user) {
            return res.status(404).json({ exists: false, message: 'No account found with this roll number' });
        }

        // Return masked name for verification hint
        const nameParts = user.name.split(' ');
        const maskedName = nameParts.map(part =>
            part.charAt(0) + '*'.repeat(Math.max(part.length - 2, 1)) + (part.length > 1 ? part.charAt(part.length - 1) : '')
        ).join(' ');

        res.json({
            exists: true,
            hint: `Account found! Enter your full name to verify: ${maskedName}`
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST api/auth/verify-name
// @desc    Verify that roll number and name match (for forgot password step 2)
// @access  Public
router.post('/verify-name', async (req, res) => {
    const { rollNumber, name } = req.body;

    try {
        if (!rollNumber || !name) {
            return res.status(400).json({ verified: false, message: 'Roll number and name are required' });
        }

        const user = await User.findOne({
            rollNumber: { $regex: new RegExp(`^${rollNumber}$`, 'i') }
        });

        if (!user) {
            return res.status(404).json({ verified: false, message: 'No account found with this roll number' });
        }

        // Verify name matches (case-insensitive, trimmed)
        const userName = user.name.toLowerCase().trim();
        const providedName = name.toLowerCase().trim();

        if (userName !== providedName) {
            return res.status(400).json({ verified: false, message: 'Name verification failed. Please enter your name exactly as registered.' });
        }

        // Name verified successfully
        res.json({ verified: true, message: 'Identity verified successfully!' });
    } catch (err) {
        console.error('Verify name error:', err.message);
        res.status(500).json({ verified: false, message: 'Server error. Please try again.' });
    }
});

// @route   PUT api/auth/promote-admin/:id
// @desc    Promote a user to admin (Admin only)
// @access  Private (Admin)
router.put('/promote-admin/:id', [auth, admin], async (req, res) => {
    const { secretKey } = req.body;

    try {
        // Verify Master Key
        let config = await Config.findOne({ key: 'admin_secret' });
        if (!config) {
            config = new Config({ key: 'admin_secret', value: 'cyberadmin2024' });
            await config.save();
        }

        if (secretKey !== config.value) {
            return res.status(403).json({ message: 'Invalid Master Key. Authorization denied.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'User is already an admin' });
        }

        user.role = 'admin';
        await user.save();

        res.json({ message: `${user.name} has been promoted to Admin successfully`, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

// @route   PUT api/auth/demote-admin/:id
// @desc    Demote an admin to student (Admin only)
// @access  Private (Admin)
router.put('/demote-admin/:id', [auth, admin], async (req, res) => {
    const { secretKey } = req.body;

    try {
        // Verify Master Key
        let config = await Config.findOne({ key: 'admin_secret' });
        if (!config) {
            config = new Config({ key: 'admin_secret', value: 'cyberadmin2024' });
            await config.save();
        }

        if (secretKey !== config.value) {
            return res.status(403).json({ message: 'Invalid Master Key. Authorization denied.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(400).json({ message: 'User is not an admin' });
        }

        // Prevent self-demotion to avoid locking oneself out (optional but good practice)
        if (req.user.id === req.params.id) {
            return res.status(400).json({ message: 'You cannot demote yourself. Ask another admin.' });
        }

        user.role = 'student';
        await user.save();

        res.json({ message: `${user.name} has been demoted to Student successfully`, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
