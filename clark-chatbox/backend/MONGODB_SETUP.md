# MongoDB Setup for Clark University AI Chatbox

This guide explains how to configure the MongoDB connection for your chatbox application.

## Current Configuration

For the hackathon demo, the MongoDB connection has been disabled by default. This means:

1. You'll see a message "Continuing without database connection for demo purposes" when starting the backend
2. The application will work with mock data instead of persistent storage
3. This is perfectly fine for demonstration purposes

## Enabling MongoDB (Optional)

If you want to enable MongoDB for full functionality with data persistence:

1. Open `clark-chatbox/backend/.env`
2. Uncomment the MongoDB URI line by removing the # symbol
3. Replace `<db_password>` with your actual MongoDB Atlas password
4. Save the file

For example:
```
# Before:
# MONGODB_URI=mongodb+srv://HarishPRK:<db_password>@cluster0.xed0m.mongodb.net/clark-chatbox

# After:
MONGODB_URI=mongodb+srv://HarishPRK:mySecurePassword123@cluster0.xed0m.mongodb.net/clark-chatbox
```

## Verifying Your MongoDB Connection

To test if your MongoDB connection is working:

1. Make sure you've updated the .env file with the correct password
2. Restart the backend server:
   ```bash
   cd clark-chatbox/backend
   npm run dev
   ```
3. Look for a success message: "Connected to MongoDB"

## Common Issues and Solutions

1. **Authentication Failed**: Double-check your password is correct
2. **Network Issues**: Make sure your IP address is whitelisted in MongoDB Atlas
3. **Database Name Issues**: Ensure the database name is correctly specified at the end of the URI

## Help with MongoDB Atlas

If you need help finding your password or managing your MongoDB Atlas account:

1. Visit [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign in to your account
3. Go to "Database Access" under Security
4. You can reset your password there if needed
5. Make sure your current IP address is added to the IP Access List under "Network Access"

For demonstration purposes during your hackathon, you can continue using the application without the database connection, as it will gracefully handle the error and provide mock functionality.
