import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import StudyRoom from './StudyRoom';

// Interface for RoomBooking attributes
export interface RoomBookingAttributes {
  id?: number;
  roomId: number;
  userId: string;
  userEmail?: string;
  bookingDate: Date;
  startTime: string; // 24-hour format: "14:00"
  endTime: string;
  purpose?: string;
  attendees?: number;
  confirmationCode: string;
  status: 'confirmed' | 'cancelled' | 'pending';
}

class RoomBooking extends Model<RoomBookingAttributes> implements RoomBookingAttributes {
  public id!: number;
  public roomId!: number;
  public userId!: string;
  public userEmail!: string;
  public bookingDate!: Date;
  public startTime!: string;
  public endTime!: string;
  public purpose!: string;
  public attendees!: number;
  public confirmationCode!: string;
  public status!: 'confirmed' | 'cancelled' | 'pending';
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RoomBooking.init(
  {
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: StudyRoom,
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userEmail: {
      type: DataTypes.STRING
    },
    bookingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    purpose: {
      type: DataTypes.STRING
    },
    attendees: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    confirmationCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'cancelled', 'pending'),
      allowNull: false,
      defaultValue: 'confirmed'
    }
  },
  {
    sequelize,
    modelName: 'RoomBooking',
    tableName: 'room_bookings',
    timestamps: true
  }
);

export default RoomBooking;
