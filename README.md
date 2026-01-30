# 📋 Live Real-Time Polling System

A complete, production-ready real-time polling system built with React, Node.js, Express, Socket.io, and MongoDB.

## ✨ Features

- **Real-Time Updates**: Live polling with instant result updates using Socket.io
- **Teacher/Student Modes**: Separate interfaces for teachers to create polls and students to vote
- **Accurate Timers**: Server-based timer calculation for precision
- **Vote Validation**: One vote per student per poll enforced at DB level
- **State Recovery**: Automatic state synchronization for new/reconnecting clients
- **Beautiful UI**: Modern, responsive interface with Tailwind-inspired styling
- **Type-Safe**: Full TypeScript implementation
- **Architecture**: Strict Controller-Service-Model pattern

## 🏗️ Architecture Overview

### Backend (Node.js + Express + Socket.io)
- **Database**: MongoDB with Mongoose ORM
- **Pattern**: Controller → Service → Model
- **Real-Time**: Socket.io for live updates
- **Validation**: Unique vote constraints at DB level
- **Timer**: Server-calculated remaining time

### Frontend (React + TypeScript)
- **State Management**: React Context API
- **Real-Time**: Socket.io-client
- **Custom Hooks**: `useSocket`, `usePollTimer`
- **No Component Logic**: All logic in hooks/services
- **Responsive**: Works on desktop and mobile

## 📁 Project Structure

```
polling-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts           # MongoDB connection
│   │   │   └── env.ts          # Environment config
│   │   ├── controllers/
│   │   │   └── poll.controller.ts
│   │   ├── services/
│   │   │   └── poll.service.ts
│   │   ├── models/
│   │   │   ├── Poll.ts
│   │   │   └── Vote.ts
│   │   ├── routes/
│   │   │   └── poll.routes.ts
│   │   ├── sockets/
│   │   │   └── poll.socket.ts
│   │   ├── utils/
│   │   │   └── timer.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── NameEntry.tsx
    │   │   ├── TeacherDashboard.tsx
    │   │   ├── StudentView.tsx
    │   │   └── PollResults.tsx
    │   ├── hooks/
    │   │   ├── useSocket.ts
    │   │   └── usePollTimer.ts
    │   ├── services/
    │   │   └── api.ts
    │   ├── context/
    │   │   └── PollContext.tsx
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── public/
    │   └── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB running locally (or connection string configured)
- npm or yarn

### 1. Setup Backend

```bash
cd polling-app/backend

# Install dependencies
npm install

# Create .env file (already exists with defaults)
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/polling-app
# NODE_ENV=development

# Start development server
npm run dev
```

Server runs on `http://localhost:5000`

### 2. Setup Frontend

```bash
cd polling-app/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

App runs on `http://localhost:5173`

### 3. Start MongoDB

**Windows (using MongoDB Community Server):**
```bash
mongod --dbpath "C:\data\db"
```

**macOS (using Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 🎯 How to Use

### For Teachers
1. Open browser to `http://localhost:5173`
2. Check "Teacher Mode" checkbox
3. Click "Enter" (no name needed)
4. Fill in question, add options (2+), set duration (seconds)
5. Click "Create Poll"
6. Live results appear in real-time as students vote

### For Students
1. Open browser to `http://localhost:5173` (can be same or different device)
2. Enter your name
3. Click "Enter"
4. Wait for teacher to create a poll
5. When poll appears, select your option
6. Click option to vote
7. See live results update

## 📡 Socket Events

### Server to Client
- `poll:created` - New poll created
- `poll:state_sync` - Send current poll state and results
- `poll:results` - Updated vote results
- `poll:error` - Error occurred

### Client to Server
- `teacher:create_poll` - Create new poll
- `student:join` - Student joined (requests state)
- `student:vote` - Submit a vote
- `request:state` - Request current poll state

## 🗄️ Database Models

### Poll
```typescript
{
  question: string
  options: Array<{
    id: string (UUID)
    text: string
  }>
  startTime: Date
  duration: number (seconds)
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Vote
```typescript
{
  pollId: ObjectId (references Poll)
  studentId: string (unique per session)
  optionId: string
  createdAt: Date
  
  // Unique constraint: one vote per student per poll
}
```

## 🔐 Validation & Business Rules

1. **One Active Poll Max**: Only one poll can be active at a time
2. **Unique Votes**: Database enforces one vote per student per poll
3. **Time-Based Expiration**: Polls automatically expire based on server time
4. **Option Validation**: Minimum 2 options required
5. **Duration Validation**: Minimum 1 second

## 🎨 UI Features

### Responsive Design
- Mobile-friendly layouts
- Gradient backgrounds
- Smooth animations
- Real-time updates

### Timer Display
- M:SS format
- Server-calculated for accuracy
- Color changes when expired

### Results Visualization
- Percentage bars
- Vote counts
- Live updates
- Total vote count

## 🛠️ Development

### Build Backend
```bash
cd backend
npm run build
npm start
```

### Build Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 📝 API Routes

- `POST /api/polls/create` - Create poll
- `GET /api/polls/active` - Get active poll
- `GET /api/polls/:pollId/results` - Get poll results
- `GET /api/polls/history` - Get poll history
- `GET /api/polls/:pollId/student/:studentId/voted` - Check if voted
- `POST /api/polls/close` - Close active poll
- `GET /health` - Health check

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongo` or check Docker container
- Verify connection string in `.env`

### Socket Connection Failed
- Ensure backend is running on port 5000
- Check CORS settings in `server.ts` if running on different domain

### Votes Not Recording
- Check MongoDB is connected
- Check browser console for errors
- Ensure unique constraint is working

### Timer Out of Sync
- Timer is calculated on server and synced to client
- Refresh page to resync if needed

## 📊 Performance Considerations

- Vote counts calculated in memory for speed
- Socket.io reconnection built-in
- Debounced result updates
- Efficient database indexing on `pollId:studentId`

## 🔄 State Flow

1. **Poll Creation**: Teacher creates → Server broadcasts to all clients
2. **Student Join**: Student connects → Server sends current poll state
3. **Vote Submission**: Student votes → Server validates → Broadcasts results
4. **Poll Expiration**: Timer reaches 0 → Poll marked inactive → No more votes accepted
5. **Reconnection**: Returning client → Auto-syncs with server state

## 🌟 Key Features Implementation

### Accurate Timer
- Server sends `startTime` and `duration`
- Client calculates: `remaining = duration - (now - startTime)`
- Updates every 100ms for smooth display

### Vote Validation
```typescript
// DB enforces unique constraint
VoteSchema.index({ pollId: 1, studentId: 1 }, { unique: true });
```

### Session Management
- Student ID stored in `sessionStorage`
- Unique per tab/window
- Persists across refreshes

### Error Handling
- Socket error events
- Fallback to REST APIs
- User-friendly error messages

## 📚 Technologies Used

- **Frontend**: React 18, TypeScript, Socket.io-client, Axios, Vite
- **Backend**: Node.js, Express, TypeScript, Socket.io, Mongoose, MongoDB
- **Database**: MongoDB
- **Build**: TypeScript, Vite, ESBuild

