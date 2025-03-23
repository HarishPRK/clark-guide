import { Sequelize } from 'sequelize';
import path from 'path';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'), // Stores DB file in backend folder
  logging: false // Disable SQL query logging
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('SQLite database connected successfully');
    
    // Sync all models
    await sequelize.sync();
    console.log('All models synchronized with database');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export default sequelize;
