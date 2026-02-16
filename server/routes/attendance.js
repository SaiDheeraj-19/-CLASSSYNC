const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const AttendanceSession = require('../models/AttendanceSession');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/attendance/last/:subject
// @desc    Get last attendance session for a subject
// @access  Private (Admin)
router.get('/last/:subject', [auth, admin], async (req, res) => {
    try {
        const session = await AttendanceSession.findOne({ subject: req.params.subject })
            .sort({ date: -1, createdAt: -1 });

        if (!session) {
            return res.status(404).json({ message: 'No previous session found for this subject' });
        }
        res.json(session);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/attendance/sessions
// @desc    Get all attendance sessions
// @access  Private (Admin)
// @route   DELETE api/attendance/session/:id
// @desc    Delete an attendance session and rollback cumulative counts
// @access  Private (Admin)
router.get('/sessions', [auth, admin], async (req, res) => {
    try {
        const sessions = await AttendanceSession.find()
            .populate('absentees', 'name rollNumber')
            .sort({ date: -1, createdAt: -1 })
            .limit(50);
        res.json(sessions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.delete('/session/:id', [auth, admin], async (req, res) => {
    try {
        const session = await AttendanceSession.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        const { subject, absentees } = session;

        // Rollback cumulative counts
        // 1. For absentees: Decrease totalClasses
        await Attendance.updateMany(
            { subject, student: { $in: absentees } },
            { $inc: { totalClasses: -1 } }
        );

        // 2. For those who were present: Decrease totalClasses AND attendedClasses
        // We need to find the students who were NOT absentees in this specific session
        // However, we don't have the full list of students in the session record.
        // We assume all students who have a record for this subject were part of the pool.
        // A safer way is to find all Attendance records for this subject excluding absentees.
        await Attendance.updateMany(
            { subject, student: { $nin: absentees } },
            { $inc: { totalClasses: -1, attendedClasses: -1 } }
        );

        // 3. Remove records where totalClasses becomes 0 (optional cleanup)
        // await Attendance.deleteMany({ subject, totalClasses: { $lte: 0 } });

        await AttendanceSession.findByIdAndDelete(req.params.id);
        res.json({ message: 'Session deleted and attendance rolled back' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

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

// @route   GET api/attendance/my-sessions
// @desc    Get individual session history for student (especially absences)
// @access  Private
router.get('/my-sessions', auth, async (req, res) => {
    try {
        const missedSessions = await AttendanceSession.find({
            absentees: req.user.id
        })
            .sort({ date: -1, createdAt: -1 })
            .limit(20);

        res.json(missedSessions);
    } catch (err) {
        console.error(err);
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
    const { updates, date, timeSlot } = req.body;

    if (!updates || updates.length === 0) {
        return res.status(400).json({ message: 'No updates provided' });
    }

    try {
        const subject = updates[0].subject;
        const studentIds = updates.map(u => u.studentId);
        const sessionDate = date ? new Date(date) : new Date();

        // 1. Save Attendance Session
        const absentees = updates.filter(u => !u.isPresent).map(u => u.studentId);
        const newSession = new AttendanceSession({
            subject,
            date: sessionDate,
            timeSlot: timeSlot || '9:00 AM',
            absentees
        });
        await newSession.save();

        // 2. Update Cumulative
        const existingRecords = await Attendance.find({
            subject: subject,
            student: { $in: studentIds }
        });

        const recordMap = {};
        existingRecords.forEach(record => {
            recordMap[record.student.toString()] = record;
        });

        const operations = updates.map(update => {
            const existing = recordMap[update.studentId];

            if (existing) {
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

        res.json({ message: 'Bulk attendance updated and session saved' });
    } catch (err) {
        console.error('Bulk update error:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
