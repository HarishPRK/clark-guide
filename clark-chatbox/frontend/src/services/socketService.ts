import { io, Socket } from 'socket.io-client';
import { UserType } from '../contexts/UserContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export interface ChatMessage {
  id?: string | number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  metadata?: any;
}

// Singleton instance to ensure only one socket connection
class SocketService {
  private static instance: SocketService; // Singleton instance
  private socket: Socket | null = null;
  private userId: string | null = null;
  private sessionId: string | null = null;
  private userType: UserType = 'student';
  private messageListeners: Array<(message: ChatMessage) => void> = [];
  private processedMessages = new Set<string>(); // Track message IDs we've already processed
  private connecting = false; // Flag to prevent multiple simultaneous connection attempts
  
  // Private constructor for singleton
  private constructor() {
    console.log('SocketService instance created');
    // Initialize userId from localStorage if available
    this.userId = localStorage.getItem('userId') || `user-${Date.now()}`;
    
    // Always generate a new sessionId on page load to clear chat history
    this.sessionId = `session-${Date.now()}`;
    
    // Store IDs for persistence
    localStorage.setItem('userId', this.userId);
    localStorage.setItem('sessionId', this.sessionId);
    
    // Clear any previously processed messages
    this.processedMessages.clear();
  }
  
  // Get singleton instance
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }
  
  connect(userType: UserType): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // If already connected, just resolve
      if (this.socket && this.socket.connected) {
        console.log('Socket already connected, reusing connection');
        this.userType = userType; // Update userType
        resolve(true);
        return;
      }
      
      // If currently trying to connect, wait
      if (this.connecting) {
        console.log('Connection attempt already in progress');
        setTimeout(() => {
          if (this.socket && this.socket.connected) {
            resolve(true);
          } else {
            reject(new Error('Connection in progress timed out'));
          }
        }, 5000);
        return;
      }
      
      this.connecting = true;
      console.log('Starting new socket connection');
      
      // Disconnect existing socket if any
      if (this.socket) {
        console.log('Disconnecting existing socket');
        this.socket.disconnect();
        this.socket = null;
      }
      
      console.log('Connecting to socket server at:', BACKEND_URL);
      this.socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        timeout: 10000
      });
      
      this.userType = userType;
      
      // Set up connection timeout
      const connectionTimeout = setTimeout(() => {
        console.error('Connection timeout');
        this.connecting = false;
        reject(new Error('Connection timeout'));
      }, 10000);
      
      this.socket.on('connect', () => {
        console.log('Successfully connected to server with socket ID:', this.socket?.id);
        clearTimeout(connectionTimeout);
        this.connecting = false;
        resolve(true);
      });
      
      this.socket.on('message:receive', (message: ChatMessage & { requestId?: string }) => {
        console.log('Received message:', message);
        
        // Generate a message key for deduplication
        const messageKey = message.requestId || 
                          (message.id ? message.id.toString() : 
                          `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
        
        // Check if we've already processed this message
        if (this.processedMessages.has(messageKey)) {
          console.log(`Skipping duplicate message with ID: ${messageKey}`);
          return;
        }
        
        // Mark this message as processed
        this.processedMessages.add(messageKey);
        
        // Limit the size of the processed messages set to avoid memory leaks
        if (this.processedMessages.size > 100) {
          // Remove the oldest items (first 50) when we hit the limit
          const iterator = this.processedMessages.values();
          for (let i = 0; i < 50; i++) {
            const value = iterator.next().value;
            if (value) this.processedMessages.delete(value);
          }
        }
        
        // Convert timestamp to Date object if it's a string
        if (typeof message.timestamp === 'string') {
          message.timestamp = new Date(message.timestamp);
        }
        
        // Notify all listeners
        this.messageListeners.forEach(listener => listener(message));
      });
      
      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        this.connecting = false;
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        clearTimeout(connectionTimeout);
        this.connecting = false;
        reject(error);
      });
    });
  }
  
  sendMessage(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        console.error('Socket not connected');
        reject(new Error('Socket not connected. Please refresh and try again.'));
        return;
      }
      
      const messageData = {
        text,
        userId: this.userId,
        userType: this.userType,
        sessionId: this.sessionId
      };
      
      console.log('Sending message:', messageData);
      
      // Just emit the message and resolve immediately - no need to wait for acknowledgment
      // The actual response will come through the message:receive event handler
      this.socket.emit('message:send', messageData);
      
      // Resolve the promise immediately
      resolve();
    });
  }
  
  onMessage(callback: (message: ChatMessage) => void) {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
    };
  }
  
  disconnect() {
    if (this.socket) {
      console.log('Manually disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  getChatHistory(): Promise<ChatMessage[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        console.error('Socket not connected');
        resolve([]); // Return empty array instead of rejecting for better UX
        return;
      }
      
      console.log('Requesting chat history for:', this.userId, this.sessionId);
      
      // Set a timeout in case the server doesn't respond
      const historyTimeout = setTimeout(() => {
        console.error('Chat history timeout');
        resolve([]); // Return empty array on timeout
      }, 8000);
      
      this.socket.emit('chat:history', {
        userId: this.userId,
        sessionId: this.sessionId
      });
      
      this.socket.once('chat:history', (history: ChatMessage[]) => {
        console.log('Received chat history:', history);
        clearTimeout(historyTimeout);
        
        // Check if history is valid
        if (!Array.isArray(history)) {
          console.error('Invalid chat history format:', history);
          resolve([]);
          return;
        }
        
        // Convert timestamps to Date objects
        const processedHistory = history.map(msg => ({
          ...msg,
          timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
        }));
        resolve(processedHistory);
      });
      
      this.socket.once('chat:error', (error) => {
        console.error('Chat history error:', error);
        clearTimeout(historyTimeout);
        resolve([]); // Return empty array instead of rejecting
      });
    });
  }
  
  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
  
  // Get socket ID for debugging
  getSocketId(): string | null {
    return this.socket?.id || null;
  }
  
  // Get ambient insight from the campus intelligence system
  getAmbientInsight(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        console.log('Socket not connected, cannot fetch ambient insights');
        resolve(null);
        return;
      }
      
      console.log('Requesting ambient insight from server');
      
      // Set a timeout in case the server doesn't respond
      const insightTimeout = setTimeout(() => {
        console.log('Ambient insight request timed out');
        resolve(null);
      }, 5000);
      
      this.socket.emit('ambient:insight', { sessionId: this.sessionId }, (insight: string | null) => {
        clearTimeout(insightTimeout);
        if (insight) {
          console.log('Received ambient insight:', insight);
        } else {
          console.log('No ambient insight available at this time');
        }
        resolve(insight);
      });
    });
  }
}

// Export the singleton instance
export default SocketService.getInstance();
