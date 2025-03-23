# How to Connect Using MongoDB Drivers

Based on the MongoDB connection screen you shared, here are the exact steps to follow:

## Step 1: Click on "Drivers" Option

In the "Connect to Cluster0" dialog you're seeing:

1. Click on the first option: **Drivers** (highlighted with a Node.js icon)
   - This is the correct option for connecting with your Node.js backend application

![Drivers Option](https://i.imgur.com/example.png)

## Step 2: Follow the Driver Setup Instructions

After clicking on Drivers, you'll see a new screen with these steps:

1. Select your driver and version:
   - Select **Node.js** from the dropdown
   - Choose the latest version (e.g., 5.0 or higher)

2. You'll see a connection string like this:
   ```
   mongodb+srv://HarishPRK:<password>@cluster0.xed0m.mongodb.net/?retryWrites=true&w=majority
   ```

3. Copy this connection string

## Step 3: Replace Placeholders in the Connection String

In the connection string you copied:

1. Replace `<password>` with your actual MongoDB Atlas password
2. Add your database name before the question mark:
   - Change: `cluster0.xed0m.mongodb.net/?retryWrites=true`
   - To: `cluster0.xed0m.mongodb.net/clark-chatbox?retryWrites=true`

Your final connection string should look like:
```
mongodb+srv://HarishPRK:your_actual_password@cluster0.xed0m.mongodb.net/clark-chatbox?retryWrites=true&w=majority
```

## Step 4: Update Your Application's .env File

1. Open `clark-chatbox/backend/.env`
2. Uncomment the MongoDB URI line by removing the # symbol
3. Paste your complete connection string:

```
# Before:
# MONGODB_URI=mongodb+srv://HarishPRK:<db_password>@cluster0.xed0m.mongodb.net/clark-chatbox

# After:
MONGODB_URI=mongodb+srv://HarishPRK:your_actual_password@cluster0.xed0m.mongodb.net/clark-chatbox?retryWrites=true&w=majority
```

## Step 5: Test Your Connection

After updating the .env file, restart your backend server:

```bash
cd clark-chatbox/backend
npm run dev
```

You should see the message "Connected to MongoDB" if the connection is successful.

## For the Hackathon Demo

If you're just giving a demo and don't need to persist data to MongoDB, you can skip this entire process and leave the MongoDB connection commented out in the `.env` file:

```
# MONGODB_URI=mongodb+srv://...
```

The application will run with mock data for the demo.
