// Test MongoDB Connection Script for Hackathon Demo
// This simplified script uses a direct MongoDB connection string format

const mongoose = require('mongoose');

// The connection string follows this format:
// mongodb+srv://username:password@hostname/database

// Replace PASSWORD with your actual password
const connectionString = `mongodb+srv://HarishPRK:Harish@66@cluster0.xed0m.mongodb.net/clark-chatbox?retryWrites=true&w=majority&appName=Cluster0`;

// Connect using Mongoose (same as in our main application)
async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(connectionString);
    
    console.log('✅ Connected to MongoDB successfully!');
    
    // Optional: Create a test document
    const TestModel = mongoose.model('Test', new mongoose.Schema({
      message: String,
      createdAt: { type: Date, default: Date.now }
    }));
    
    const testDoc = new TestModel({ message: 'Test connection successful' });
    await testDoc.save();
    console.log('✅ Created test document in database');
    
    // Optional: Retrieve the test document
    const docs = await TestModel.find({});
    console.log('Documents in Test collection:', docs);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('\nTroubleshooting tips:');
    console.log('1. Check your password is correct');
    console.log('2. Make sure your IP address is whitelisted in MongoDB Atlas');
    console.log('3. Verify the cluster name (cluster0.xed0m) is correct');
    console.log('\nAlternative: Skip MongoDB for the demo by:');
    console.log('- Commenting out the MONGODB_URI line in .env');
    console.log('- The app will work with mock data instead\n');
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
testConnection();

/*
// Native MongoDB driver approach (for reference only)
const { MongoClient } = require('mongodb');

async function testNativeDriver() {
  // Replace PASSWORD with your actual password
  const uri = "mongodb+srv://HarishPRK:PASSWORD@cluster0.xed0m.mongodb.net/clark-chatbox";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db("clark-chatbox");
    const result = await db.command({ ping: 1 });
    console.log("Connected to MongoDB using native driver!");
  } finally {
    await client.close();
  }
}
*/
