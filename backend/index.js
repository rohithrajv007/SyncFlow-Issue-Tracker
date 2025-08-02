import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

// --- Route Imports ---
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import issueRoutes from './routes/issues.js';

// --- Initialization ---
dotenv.config();
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, restrict this to your frontend URL
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Middleware to attach the `io` instance to every request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/issues', issueRoutes);

// A simple root route to check if the API is running
app.get('/', (req, res) => {
  res.send('SyncFlow API is live!');
});

// --- Socket.IO Connection Logic ---
io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ A user disconnected:', socket.id);
  });
});

// --- Conditional Server Start ---
// This `if` block prevents the server from starting automatically during tests
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

// --- Exports for Testing ---
// We export the app and server so our Jest tests can use them
export { app, httpServer };