const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Notification Service (WhatsApp Client)
require('./services/notificationService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes (Importing)
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const assignmentRoutes = require('./routes/assignments');
const timetableRoutes = require('./routes/timetable');
const noticeRoutes = require('./routes/notices');
const subjectRoutes = require('./routes/subjects');
const calendarRoutes = require('./routes/calendar');
const resourceRoutes = require('./routes/resources');
const pollRoutes = require('./routes/polls');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/polls', pollRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('ClassSync API is Running');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
