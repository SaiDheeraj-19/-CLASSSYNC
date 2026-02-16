const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/attendance (My Attendance)
// @desc    Get attendance for logged in student
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const attendance = await Attendance.find({ student: req.user.id });

        // Add logic for warning and analysis
        const withAnalysis = attendance.map(record => {
            const percentage = record.totalClasses === 0 ? 0 : (record.attendedClasses / record.totalClasses) * 100;
            let status = 'Safe';
            let classesNeeded = 0;

            if (percentage < 75) {
                status = 'Warning';
                classesNeeded = Math.ceil((0.75 * record.totalClasses - record.attendedClasses) / 0.25);
                if (classesNeeded < 0) classesNeeded = 0;
            }

            return {
                ...record._doc,
                percentage: Number(percentage.toFixed(2)),
                status,
                classesNeededToReach75: classesNeeded
            };
        });

        res.json(withAnalysis);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/attendance
// @desc    Create/Update attendance (Admin)
// @access  Private (Admin)
router.post('/', [auth, admin], async (req, res) => {
    const { studentId, subject, totalClasses, attendedClasses } = req.body;

    try {
        let attendance = await Attendance.findOne({ student: studentId, subject });

        if (attendance) {
            attendance.totalClasses = totalClasses;
            attendance.attendedClasses = attendedClasses;
            await attendance.save();
            return res.json(attendance);
        }

        attendance = new Attendance({
            student: studentId,
            subject,
            totalClasses,
            attendedClasses
        });

        await attendance.save();
        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/attendance/all
// @desc    Get all attendance records (Admin)
// @access  Private (Admin)
router.get('/all', [auth, admin], async (req, res) => {
    try {
        const attendance = await Attendance.find().populate('student', ['name', 'email', 'rollNumber']);
        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/attendance/:id
// @desc    Delete attendance record
// @access  Private (Admin)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        await Attendance.findByIdAndDelete(req.params.id);
        res.json({ message: 'Attendance record removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/attendance/bulk
// @desc    Bulk Create/Update attendance (Admin)
// @access  Private (Admin)
router.post('/bulk', [auth, admin], async (req, res) => {
    const { updates } = req.body; // Array of { studentId, subject, isPresent }

    if (!updates || updates.length === 0) {
        return res.status(400).json({ message: 'No updates provided' });
    }

    try {
        const subject = updates[0].subject;
        const studentIds = updates.map(u => u.studentId);

        // Fetch existing records for this subject and these students
        const existingRecords = await Attendance.find({
            subject: subject,
            student: { $in: studentIds }
        });

        // Map for quick lookup: studentId -> record
        const recordMap = {};
        existingRecords.forEach(record => {
            // Use toString() because record.student is ObjectId
            recordMap[record.student.toString()] = record;
        });

        const operations = updates.map(update => {
            const existing = recordMap[update.studentId];

            if (existing) {
                // Update existing record
                return {
                    updateOne: {
                        filter: { _id: existing._id },
                        update: {
                            $inc: {
                                totalClasses: 1,
                                attendedClasses: update.isPresent ? 1 : 0
                            }
                        }
                    }
                };
            } else {
                // Insert new record
                return {
                    insertOne: {
                        document: {
                            student: new mongoose.Types.ObjectId(update.studentId),
                            subject: update.subject,
                            totalClasses: 1,
                            attendedClasses: update.isPresent ? 1 : 0
                        }
                    }
                };
            }
        });

        if (operations.length > 0) {
            await Attendance.bulkWrite(operations);
        }

        res.json({ message: 'Bulk attendance updated successfully' });
    } catch (err) {
        console.error('Bulk update error:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
