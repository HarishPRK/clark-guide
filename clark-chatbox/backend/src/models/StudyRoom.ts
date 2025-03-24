import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

// Interface for StudyRoom attributes
export interface StudyRoomAttributes {
  id?: number;
  roomNumber: string;
  building: string;
  floor: number;
  capacity: number;
  features: string; // Stored as JSON string: ["whiteboard", "projector", etc.]
  isActive: boolean;
}

class StudyRoom extends Model<StudyRoomAttributes> implements StudyRoomAttributes {
  public id!: number;
  public roomNumber!: string;
  public building!: string;
  public floor!: number;
  public capacity!: number;
  public features!: string;
  public isActive!: boolean;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  
  // Helper getter to parse the JSON features string
  public getFeatures(): string[] {
    if (!this.features) return [];
    return JSON.parse(this.features);
  }
}

StudyRoom.init(
  {
    roomNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    building: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    floor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    features: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('features');
        return JSON.parse(rawValue);
      },
      set(value: string[]) {
        this.setDataValue('features', JSON.stringify(value));
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    }
  },
  {
    sequelize,
    modelName: 'StudyRoom',
    tableName: 'study_rooms',
    timestamps: true,
  }
);

export default StudyRoom;
