# How to Find Your MongoDB Connection URL from Atlas Cloud

This step-by-step guide shows you how to obtain your MongoDB connection URL from MongoDB Atlas and configure it in your application.

## Step 1: Log in to MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in with your credentials

## Step 2: Navigate to Your Cluster

1. Once logged in, you'll see your Atlas dashboard
2. Find your cluster (in your case, "Cluster0") and click "Connect"

![Connect to Cluster Button](https://i.imgur.com/wzqH1xS.png)

## Step 3: Choose Connection Method

1. In the connection dialog, you'll see a screen like in your screenshot
2. Click on the "Drivers" option (the first option)
   - This is for connecting with Node.js which is what our backend uses

![Choose Drivers option](https://i.imgur.com/W92JLhz.png)

## Step 4: Get Your Connection String

1. Select your driver and version (Node.js and the latest version)
2. You'll see your connection string in the format:
   ```
   mongodb+srv://<username>:<password>@cluster0.xed0m.mongodb.net/?retryWrites=true&w=majority
   ```
3. Copy this connection string

![Copy connection string](https://i.imgur.com/KAxJLHC.png)

## Step 5: Modify the Connection String for Your Application

1. Replace `<username>` with your MongoDB Atlas username (likely "HarishPRK")
2. Replace `<password>` with your actual password
3. Add your database name at the end of the URL before the parameters

For example, transform:
```
mongodb+srv://HarishPRK:<password>@cluster0.xed0m.mongodb.net/?retryWrites=true&w=majority
```

Into:
```
mongodb+srv://HarishPRK:your_actual_password@cluster0.xed0m.mongodb.net/clark-chatbox?retryWrites=true&w=majority
```

## Step 6: Update Your .env File

1. Open `clark-chatbox/backend/.env`
2. Uncomment the MongoDB URI line by removing the # symbol
3. Replace the existing URI with your complete connection string:

```
# Before:
# MONGODB_URI=mongodb+srv://HarishPRK:<db_password>@cluster0.xed0m.mongodb.net/clark-chatbox

# After:
MONGODB_URI=mongodb+srv://HarishPRK:your_actual_password@cluster0.xed0m.mongodb.net/clark-chatbox?retryWrites=true&w=majority
```

## Step 7: Ensure Your IP Address is Whitelisted

1. In MongoDB Atlas, go to "Network Access" under Security
2. Click "Add IP Address"
3. You can add your current IP or use "Allow Access from Anywhere" for development
4. Click "Confirm"

![Add IP Address](https://i.imgur.com/ZPjT6yp.png)

## Step 8: Test Your Connection

1. Save your `.env` file
2. Restart your backend server:
   ```bash
   cd clark-chatbox/backend
   npm run dev
   ```
3. Look for the message "Connected to MongoDB" in the console

If you see this message, your connection is successful! If not, double-check your connection string, particularly your username and password.

## Common Issues and Solutions

1. **Authentication Failed**: Make sure your password is correct and doesn't contain special characters that need escaping
2. **Network Access Error**: Ensure your IP address is whitelisted in MongoDB Atlas
3. **Cluster Not Found**: Verify the cluster hostname (the part after @) is correct

## Skip for Hackathon Demo

Remember, for the hackathon demo, you can leave the MongoDB connection commented out in the `.env` file, and the application will run with mock data:

```
# MONGODB_URI=mongodb+srv://...
```

This allows you to focus on demonstrating your application's features without worrying about database configuration.
