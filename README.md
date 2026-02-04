# ClassSync

ClassSync is a production-ready class management web platform.

## Features

- **Authentication**: Secure JWT login for Students and Admins (Class Reps).
- **Attendance Management**: 
  - Track subject-wise attendance.
  - Smart warning system (calculates classes needed to reach 75%).
  - Visual charts.
- **Assignment Manager**: Track deadlines and status.
- **Timetable**: Weekly schedule management.
- **Notices & Events**: Digital notice board.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, MongoDB
- **Database**: MongoDB

## Setup Instructions

1. **Prerequisites**: Ensure Node.js and MongoDB are installed and running.
2. **Environment**: 
   - `server/.env` is pre-configured with `MONGO_URI=mongodb://localhost:27017/classsync`. Adjust if needed.
3. **Run**:
   - Open a terminal in the root directory.
   - Run `chmod +x start.sh` (Mac/Linux)
   - Run `./start.sh`

   Alternatively:
   - Terminal 1: `cd server && npm install && npm run dev`
   - Terminal 2: `cd client && npm install && npm run dev`

4. **Access**:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

## Default Usage (First Time)

1. Go to Register page.
2. Create an **Admin** account (Select Role: Class Rep).
3. Create a **Student** account (Select Role: Student).
4. Login as Admin to post data (Assignments, Timetable, Attendance).
5. Login as Student to view dashboard.

## Security

- Passwords are hashed with bcrypt.
- Routes are protected via JWT middleware.
- Admin routes are strictly role-checked.

