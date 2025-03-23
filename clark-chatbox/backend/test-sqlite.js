// Simple script to test SQLite database connection and functionality
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Create database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'), // Will create this file in backend folder
  logging: false
});

// Define a simple test model
const TestMessage = sequelize.define('TestMessage', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isUserMessage: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Main test function
async function testSQLite() {
  console.log('🔍 Testing SQLite connection and functionality...');
  
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connection to SQLite has been established successfully.');
    
    // Sync the model with the database (creates the table)
    await sequelize.sync({ force: true }); // force:true will drop the table if it exists
    console.log('✅ Database synchronized. Tables created.');
    
    // Create test data
    console.log('📝 Creating test messages...');
    
    // User message
    const userMessage = await TestMessage.create({
      userId: 'test-user-1',
      userType: 'student',
      content: 'Hello, I need help with my courses',
      isUserMessage: true
    });
    
    // AI response
    const aiMessage = await TestMessage.create({
      userId: 'test-user-1',
      userType: 'student',
      content: 'I can help you with your courses. What specific information do you need?',
      isUserMessage: false
    });
    
    console.log('✅ Test messages created successfully:', {
      userMessageId: userMessage.id,
      aiMessageId: aiMessage.id
    });
    
    // Query the data
    console.log('🔍 Retrieving messages...');
    const messages = await TestMessage.findAll({
      where: { userId: 'test-user-1' },
      order: [['timestamp', 'ASC']]
    });
    
    // Display results
    console.log('✅ Retrieved', messages.length, 'messages:');
    messages.forEach(msg => {
      console.log(`- ${msg.isUserMessage ? 'USER' : 'AI'}: ${msg.content} (${msg.timestamp})`);
    });
    
    // Run a direct SQL query (demonstrating the query method used in chat service)
    console.log('🔍 Testing direct SQL query...');
    const result = await sequelize.query(
      `SELECT userId, COUNT(*) as messageCount FROM TestMessages GROUP BY userId`,
      { type: 'SELECT' }
    );
    
    console.log('✅ SQL query result:', result);
    
    console.log('\n✅✅✅ SQLite test completed successfully! ✅✅✅');
    console.log('The database file has been created at:', path.join(__dirname, 'database.sqlite'));
    
  } catch (error) {
    console.error('❌ Error during SQLite test:', error);
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('Connection closed.');
  }
}

// Run the test
testSQLite();
