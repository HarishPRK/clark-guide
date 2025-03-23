import Message, { MessageAttributes } from '../../models/Message';
import aiService, { UserQuery, AIResponse } from '../ai/aiService';
import { v4 as uuidv4 } from 'uuid';
import { Op, Sequelize } from 'sequelize';

export interface ChatMessage {
  id?: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  metadata?: any;
}

export class ChatService {
  // Process a user message and generate AI response
  async processUserMessage(message: ChatMessage, userId: string, userType: 'student' | 'faculty' | 'other', sessionId?: string): Promise<ChatMessage> {
    try {
      // Create session ID if not provided
      const finalSessionId = sessionId || uuidv4();

      // Prepare query for AI service
      const query: UserQuery = {
        text: message.text,
        userId,
        userType,
        sessionId: finalSessionId
      };

      // Process message with AI service
      const aiResponse: AIResponse = await aiService.processMessage(query);

      // Save user message to database
      const userMessage = await Message.create({
        userId,
        userType,
        sessionId: finalSessionId,
        content: message.text,
        timestamp: message.timestamp || new Date(),
        intent: 'unknown', // Will be updated after AI processing
        category: userType,
        isUserMessage: true
      });

      // Save AI response to database
      const aiMessageData: MessageAttributes = {
        userId,
        userType,
        sessionId: finalSessionId,
        content: aiResponse.text,
        timestamp: new Date(),
        intent: aiResponse.intent,
        category: aiResponse.category,
        subcategory: aiResponse.subcategory,
        isUserMessage: false,
        responseId: userMessage.id
      };
      
      const aiMessageDoc = await Message.create(aiMessageData);

      // Update user message with intent info
      await userMessage.update({
        intent: aiResponse.intent,
        category: aiResponse.category,
        subcategory: aiResponse.subcategory
      });

      // Return AI response message
      return {
        id: aiMessageDoc.id.toString(),
        text: aiResponse.text,
        sender: 'ai',
        timestamp: aiMessageDoc.timestamp,
        metadata: {
          intent: aiResponse.intent,
          category: aiResponse.category,
          subcategory: aiResponse.subcategory,
          confidence: aiResponse.confidence,
          sources: aiResponse.sources
        }
      };
    } catch (error) {
      console.error('Error in chat service:', error);
      return {
        text: "I'm sorry, I encountered an error processing your request. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };
    }
  }

  // Get chat history for a user session
  async getChatHistory(userId: string, sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const messages = await Message.findAll({
        where: { 
          userId, 
          sessionId 
        },
        order: [
          ['timestamp', 'ASC']
        ],
        limit
      });

      return messages.map(msg => ({
        id: msg.id.toString(),
        text: msg.content,
        sender: msg.isUserMessage ? 'user' : 'ai',
        timestamp: msg.timestamp,
        metadata: msg.isUserMessage ? undefined : {
          intent: msg.intent,
          category: msg.category,
          subcategory: msg.subcategory
        }
      }));
    } catch (error) {
      console.error('Error retrieving chat history:', error);
      return [];
    }
  }

  // Get all user sessions
  async getUserSessions(userId: string): Promise<{ sessionId: string, lastActivity: Date, messageCount: number }[]> {
    try {
      // Simplified approach for SQLite - easier to handle
      const result = await Message.sequelize!.query(
        `SELECT sessionId, 
                MAX(timestamp) as lastActivity, 
                COUNT(id) as messageCount 
         FROM messages 
         WHERE userId = ? 
         GROUP BY sessionId 
         ORDER BY MAX(timestamp) DESC`,
        {
          replacements: [userId],
          type: 'SELECT'
        }
      );
      
      return (result as any[]).map(row => ({
        sessionId: row.sessionId as string,
        lastActivity: new Date(row.lastActivity),
        messageCount: Number(row.messageCount)
      }));
    } catch (error) {
      console.error('Error retrieving user sessions:', error);
      return [];
    }
  }
}

export default new ChatService();
