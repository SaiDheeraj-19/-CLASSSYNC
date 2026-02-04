# ClassSync - Student Management System

A modern, cyberpunk-themed class management system for educational institutions.

## Features

### For Students
- View attendance records
- Check assignments and deadlines
- Access class timetable
- Download study materials
- View notices
- Profile management

### For Admin/CR
- Manage student attendance (Select All Present/Absent)
- Add/Remove students with roll numbers
- Create and manage assignments
- Configure class timetable
- Auto-calculate monthly class statistics
- Upload study notes
- Post notices
- View their own student data

## Tech Stack

- **Frontend**: React + Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set root directory to `client`
3. Add environment variable: `VITE_API_BASE_URL=your-backend-url`

### Backend (Render/Railway)
1. Deploy the `server` directory
2. Set environment variables:
   - `PORT=5001`
   - `MONGO_URI=your-mongodb-uri`
   - `JWT_SECRET=your-jwt-secret`
   - `ADMIN_SECRET=your-admin-secret`

## Local Development

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Start development servers
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

## Environment Variables

### Client (.env)
```
VITE_API_BASE_URL=http://localhost:5001/api
```

### Server (.env)
```
PORT=5001
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
ADMIN_SECRET=your-admin-registration-key
```

## License
MIT
