import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

// Interface for Message attributes
export interface MessageAttributes {
  id?: number;
  userId: string;
  userType: 'student' | 'faculty' | 'other';
  sessionId: string;
  content: string;
  timestamp?: Date;
  intent?: string;
  category: string;
  subcategory?: string;
  isUserMessage: boolean;
  responseId?: number;
}

// Message model class
class Message extends Model<MessageAttributes> implements MessageAttributes {
  public id!: number;
  public userId!: string;
  public userType!: 'student' | 'faculty' | 'other';
  public sessionId!: string;
  public content!: string;
  public timestamp!: Date;
  public intent!: string;
  public category!: string;
  public subcategory!: string;
  public isUserMessage!: boolean;
  public responseId!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model
Message.init(
  {
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['student', 'faculty', 'other']]
      }
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    intent: {
      type: DataTypes.STRING,
      defaultValue: 'general_inquiry'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subcategory: {
      type: DataTypes.STRING
    },
    isUserMessage: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    responseId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Messages',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: true, // Enables createdAt and updatedAt
    indexes: [
      {
        fields: ['userId', 'sessionId']
      },
      {
        fields: ['timestamp']
      },
      {
        fields: ['intent']
      }
    ]
  }
);

export default Message;
