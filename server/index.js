const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
console.log('[CONFIG] EMAIL_USER:', process.env.EMAIL_USER ? 'Set (Hidden)' : 'MISSING');

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

// VERSION ENDPOINT
app.get('/api/version', (req, res) => {
  res.json({ version: '3.1.0-FIX-POLLS-EMAIL', timestamp: new Date().toISOString() });
});

// DEBUG EMAIL ROUTE
app.get('/api/test-email', async (req, res) => {
  try {
    const { sendEmail } = require('./services/notificationService');
    const target = process.env.EMAIL_USER;
    console.log(`[DEBUG] Attempting to send email to ${target}`);

    if (!target) return res.status(500).json({ error: 'EMAIL_USER is not defined in environment variables' });

    await sendEmail(target, 'ClassSync Deployment Test', 'If you see this, email configuration is CORRECT on Render.', '<p>Configuration Valid.</p>');
    res.json({ message: `Email sent to ${target}`, status: 'Success' });
  } catch (err) {
    console.error('[DEBUG] Email Failed:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

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
