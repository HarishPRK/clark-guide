import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Import database and services
import { initializeDatabase } from './config/database';
import chatService from './services/chat/chatService';

// Import routes (to be created)
// import authRoutes from './api/routes/auth';
// import chatRoutes from './api/routes/chat';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server
const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Initialize SQLite database
const initializeApp = async () => {
  try {
    await initializeDatabase();
    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    console.warn('Continuing with limited functionality');
  }
};

// API routes
// app.use('/api/auth', authRoutes);
// app.use('/api/chat', chatRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Clark University AI Chatbox API is running with SQLite');
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Listen for incoming messages
  socket.on('message:send', async (message) => {
    console.log('Message received:', message);
    
    try {
      // Process message with chat service
      const userId = message.userId || socket.id;
      const userType = message.userType || 'student';
      const sessionId = message.sessionId || uuidv4();
      
      const response = await chatService.processUserMessage(
        {
          text: message.text,
          sender: 'user',
          timestamp: new Date()
        },
        userId,
        userType as 'student' | 'faculty' | 'other',
        sessionId
      );
      
      // Send response back to client
      socket.emit('message:receive', {
        id: response.id,
        text: response.text,
        sender: 'ai',
        timestamp: response.timestamp,
        metadata: response.metadata
      });
    } catch (error) {
      console.error('Error processing message:', error);
      // Fallback to simple echo if there's an error
      socket.emit('message:receive', {
        id: Date.now().toString(),
        text: `I'm sorry, I encountered an error. Here's what you said: "${message.text}"`,
        sender: 'ai',
        timestamp: new Date()
      });
    }
  });

  // Handle get chat history
  socket.on('chat:history', async (data) => {
    try {
      const { userId, sessionId } = data;
      const history = await chatService.getChatHistory(userId, sessionId);
      socket.emit('chat:history', history);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      socket.emit('chat:error', { message: 'Failed to retrieve chat history' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initializeApp();
});

export default server;
