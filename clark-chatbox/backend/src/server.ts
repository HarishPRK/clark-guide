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
import Message from './models/Message';

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

// Import campus insight service
import campusInsightService from './services/ai/campusInsightService';

// Socket.io events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Listen for incoming messages - using Claude AI with robust error handling
  socket.on('message:send', async (message) => {
    console.log(`==== MESSAGE RECEIVED FROM ${socket.id} ====`);
    
    // Generate a unique request ID to prevent duplicate responses
    const requestId = uuidv4();
    
    // Track whether a response has been sent for this request
    let responseSent = false;
    
    // Setup user information
    const userId = message.userId || socket.id;
    const userType = message.userType || 'student';
    const sessionId = message.sessionId || uuidv4();
    
    // Function to send a response (ensures we send only once)
    const sendResponse = (text: string, metadata?: any) => {
      if (responseSent) {
        console.log(`Skipping duplicate response for request ${requestId}`);
        return;
      }
      
      responseSent = true;
      console.log(`Sending AI response to client ${socket.id}`);
      
      socket.emit('message:receive', {
        id: Date.now().toString(),
        requestId: requestId,
        text: text,
        sender: 'ai',
        timestamp: new Date(),
        metadata: metadata || {
          intent: 'ai_response',
          category: userType,
          confidence: 1.0,
          sources: ['Claude AI']
        }
      });
    };
    
    // Set a shorter timeout to ensure the client always gets a response
    const timeout = setTimeout(() => {
      console.log(`⏰ AI response timeout for request ${requestId}`);
      sendResponse("I'm processing your request. Please wait a moment while I find the information for you.");
    }, 5000); // 5 seconds timeout for initial response
    
    try {
      console.log(`⏳ Processing AI request ${requestId}`);
      
      // Store user message (non-blocking)
      const userMessagePromise = Message.create({
        userId,
        userType,
        sessionId: sessionId,
        content: message.text,
        timestamp: new Date(),
        intent: 'user_query',
        category: userType,
        isUserMessage: true
      }).catch((err: Error) => console.error('Error storing user message:', err));
      
      // Process with AI service (direct Claude call for reliability)
      import('./services/ai/claudeService')
        .then(async (claudeModule) => {
          const claudeService = claudeModule.default;
          
          try {
            // Call Claude directly
            const aiResponse = await claudeService.processMessage({
              text: message.text,
              userId,
              userType: userType as 'student' | 'faculty' | 'other',
              sessionId: sessionId
            });
            
            // Clear the timeout
            clearTimeout(timeout);
            
            // Send the AI response
            sendResponse(aiResponse.text, {
              intent: aiResponse.intent,
              category: aiResponse.category,
              subcategory: aiResponse.subcategory,
              confidence: aiResponse.confidence,
              sources: aiResponse.sources
            });
            
            // Store AI message (non-blocking)
            const userMessage = await userMessagePromise;
            if (userMessage) {
              Message.create({
                userId,
                userType,
                sessionId: sessionId,
                content: aiResponse.text,
                timestamp: new Date(),
                intent: aiResponse.intent,
                category: aiResponse.category,
                subcategory: aiResponse.subcategory,
                isUserMessage: false,
                responseId: userMessage.id
              }).catch((err: Error) => console.error('Error storing AI message:', err));
            }
          } catch (claudeError) {
            console.error('Claude AI error:', claudeError);
            
            // Clear the timeout
            clearTimeout(timeout);
            
            // Send fallback response if no response has been sent yet
            sendResponse(
              "I'm sorry, I'm having trouble processing your request right now. Please try asking in a different way or try again later."
            );
          }
        })
        .catch(importError => {
          console.error('Error importing Claude service:', importError);
          clearTimeout(timeout);
          sendResponse("I apologize, but I'm experiencing technical difficulties. Please try again later.");
        });
    } catch (error) {
      console.error('==== ERROR IN AI RESPONSE HANDLER ====', error);
      
      // Clear the timeout
      clearTimeout(timeout);
      
      // Send error response if none has been sent yet
      sendResponse("I'm sorry, I encountered an unexpected error. Please try again later.");
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

  // Handle ambient insight requests
  socket.on('ambient:insight', async (data, callback) => {
    try {
      const sessionId = data.sessionId || socket.id;
      console.log(`Ambient insight requested by session ${sessionId}`);
      
      // Get an insight from the campus insight service
      const insight = campusInsightService.getProactiveInsight(sessionId);
      
      // Send the insight back through the callback
      callback(insight);
    } catch (error) {
      console.error('Error fetching ambient insight:', error);
      callback(null); // Return null if there's an error
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
