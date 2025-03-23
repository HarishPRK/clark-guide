run # Clark University AI Chatbox with SQLite

This document explains the changes made to implement SQLite as the database for the Clark University AI Chatbox project.

## Implementation Overview

We've replaced MongoDB with SQLite for easier hackathon deployment, eliminating the need for external database services. The following components have been updated:

### 1. Database Configuration

A SQLite database configuration has been created at `backend/src/config/database.ts`:
- Uses Sequelize ORM for database operations
- Creates a local database file at `backend/database.sqlite`
- Provides automatic table creation and synchronization

### 2. Updated Models

The Message model has been updated to work with Sequelize:
- Defines proper column types and constraints
- Includes indexes for efficient queries
- Provides TypeScript interfaces for type safety

### 3. Updated Chat Service

The chat service now works with SQLite:
- Handles message creation and retrieval
- Processes user messages and AI responses
- Manages chat history and user sessions

### 4. Server Integration

The server has been updated to:
- Initialize the SQLite database on startup
- Process messages using the updated chat service
- Handle socket.io events for real-time chat functionality

## Running the Application

### Backend

```bash
cd clark-chatbox/backend
npm install          # Install dependencies
npm run dev          # Start the development server
```

The first time you run the server, it will:
1. Create the SQLite database file (`database.sqlite`)
2. Initialize all required tables
3. Start the server on port 5000

### Frontend

```bash
cd clark-chatbox/frontend
npm install --legacy-peer-deps
npm start
```

The frontend will be available at http://localhost:3000

## Testing

A test script is provided to verify the SQLite implementation:

```bash
cd clark-chatbox/backend
node test-sqlite.js
```

This script:
1. Tests the database connection
2. Creates and queries test messages
3. Verifies SQL query functionality

## Benefits of SQLite

1. **No External Dependencies**: Everything runs locally without need for cloud services
2. **Simple Setup**: No connection strings or authentication required
3. **File-Based Storage**: Data is stored in a single file (database.sqlite)
4. **Perfect for Demos**: Ideal for hackathons and presentations

## Data Persistence

All chat messages are stored in the SQLite database and will persist between server restarts. The database file is located at `clark-chatbox/backend/database.sqlite`.

## Technical Details

- The implementation uses Sequelize ORM with the SQLite dialect
- Models are defined using TypeScript for better type safety
- SQL queries are used for complex operations like aggregation
- Connection pooling and error handling are included for reliability
