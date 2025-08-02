const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http'); // 1. Import http
const { Server } = require("socket.io"); // 2. Import Server from socket.io

// Route Imports
const authRoutes = require('./routes/auth.js');
const projectRoutes = require('./routes/projects.js');
const issueRoutes = require('./routes/issues.js');

// Initialization
const app = express();
const httpServer = http.createServer(app); // 3. Create an HTTP server from the Express app
const io = new Server(httpServer, { // 4. Create a Socket.IO server
  cors: {
    origin: "*", // Allow all origins for now. In production, you'd restrict this.
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to attach io to each request
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/issues', issueRoutes);

app.get('/', (req, res) => {
  res.send('SyncFlow API with Real-time Support is running!');
});

// Socket.IO connection logic
io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ A user disconnected:', socket.id);
  });
});

// 5. Start the server using httpServer
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});