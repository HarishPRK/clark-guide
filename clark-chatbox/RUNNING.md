# Running the Clark University AI Chatbox

This guide will walk you through the steps to run and test the Clark University AI Chatbox locally.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- OpenAI API key (for the AI functionality)

## Step 1: Install Dependencies

First, you need to install the dependencies for both the frontend and backend:

### Backend Dependencies

```bash
cd clark-chatbox/backend
npm install
```

### Frontend Dependencies

```bash
cd clark-chatbox/frontend
npm install --legacy-peer-deps

# If you encounter an error with ajv modules, run these additional commands:
npm install ajv@latest --legacy-peer-deps
npm install --force
```

> **Note**: We use `--legacy-peer-deps` or `--force` flags to resolve dependency conflicts. The React ecosystem sometimes has package incompatibilities that require these workarounds.

## Step 2: Set Up MongoDB (Optional for Demo)

For the hackathon demo, you can skip this step initially as we've configured the backend to continue without a database connection. If you want full functionality with data persistence, you can set up MongoDB using either:

1. **Local MongoDB installation**:
   - Install MongoDB from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Start the MongoDB server with `mongod`

2. **MongoDB Atlas (cloud-based)**:
   - Create a free account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Get your connection string and update it in the `.env` file

> **Note**: For the initial demo, you can leave the MongoDB connection string as is in the `.env` file. The application will display a warning but will continue to run with mocked data responses.

## Step 3: Get OpenAI API Key

For the AI chat functionality:

1. Create an account at [https://platform.openai.com/](https://platform.openai.com/)
2. Navigate to API keys section
3. Create a new API key
4. Add this key to your `.env` file

## Step 4: Configure Environment Variables

The backend `.env` file has already been created. You'll need to update it with your actual values:

```
# In clark-chatbox/backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clark-chatbox
# OR use your MongoDB Atlas connection string
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/clark-chatbox
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_jwt_secret_for_hackathon
```

## Step 5: Start the Backend Server

```bash
cd clark-chatbox/backend
npm run dev
```

If you encounter TypeScript errors, you can temporarily bypass them for the demo:

```bash
cd clark-chatbox/backend
npx ts-node src/server.ts
```

The backend server should start on port 5000.

## Step 6: Start the Frontend Development Server

```bash
cd clark-chatbox/frontend
npm start
```

This will start the React development server on port 3000.

## Step 7: Access the Application

Open your web browser and navigate to:

```
http://localhost:3000
```

You should see the welcome screen where you can select your user type (student, faculty, or other).

## Testing the Chatbot

1. Select a user type on the welcome screen
2. Try asking questions related to the selected user type:
   - For students: "What are the library hours?" or "How do I register for classes?"
   - For faculty: "How do I submit grades?" or "Where can I book rooms for events?"
   - For others: "What restaurants are near Clark?" or "How do I use the Transloc app?"

3. Explore the sidebar menu to see preset message categories
4. Test the quick-access chips at the bottom of the chat

## Current Limitations

For the hackathon demo:

1. The AI responses are currently simulated using mock data in the frontend
2. The database connection requires MongoDB to be set up
3. User authentication is not fully implemented
4. The OpenAI integration is present but will require a valid API key

## Troubleshooting

- **Backend Connection Issues**: Ensure MongoDB is running and accessible
- **Frontend Errors**: Check browser console for any React errors
- **Dependency Issues**: Make sure all required packages are installed
- **Port Conflicts**: If ports 3000 or 5000 are already in use, you can modify them in the respective configuration files
