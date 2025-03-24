# Clark University AI Chatbox

An AI-powered chatbot designed to provide information and services to Clark University students, faculty, and visitors. This application uses real AI processing via OpenAI's GPT-3.5 Turbo to provide accurate and contextual responses.

## Features

### Student Services
- Courses information
- Campus resources (Library, Kneller, Dolan Field House)
- ClarkYou credential assistance
- OneCard queries
- Appointment scheduling
- Other queries/feedback

### Faculty Services
- Campus resources (Library, etc.)
- Course schedules
- Other queries/feedback

### Other Services
- Commuter options (Transloc, MBTA, WRTA)
- Places near Clark

## Tech Stack

### Frontend
- React with TypeScript
- Material UI for components
- React Router for navigation
- Context API for state management

### Backend
- Node.js with Express
- TypeScript
- SQLite for data storage (simplified from MongoDB)
- OpenAI API for natural language processing
- Socket.io for real-time chat

## Project Structure

```
clark-chatbox/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS and style files
│   │   ├── utils/         # Utility functions
│   │   └── App.tsx        # Main application component
│   └── package.json       # Frontend dependencies
│
├── backend/               # Node.js backend server
│   ├── src/
│   │   ├── api/           # API routes and controllers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database models
│   │   ├── config/        # Configuration files
│   │   ├── utils/         # Utility functions
│   │   └── server.ts      # Server entry point
│   └── package.json       # Backend dependencies
│
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- OpenAI API key

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/clark-chatbox.git
cd clark-chatbox
```

2. Set up backend
```
cd backend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
```

4. Set up frontend
```
cd ../frontend
npm install
```

5. Create a `.env` file in the frontend directory with:
```
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Running the Application

1. Start the backend server
```
cd backend
npm run dev
```

2. In a new terminal, start the frontend application
```
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

4. Use the ChatWidget in the bottom-right corner to interact with the AI

### Demo Mode

For hackathon presentations or when you don't want to use the OpenAI API, you can use the built-in Demo Mode:

1. Comment out the `OPENAI_API_KEY` line in your backend `.env` file
2. Restart the backend server
3. The system will automatically use pre-defined responses for common queries

For a list of supported demo questions and more details, see the [DEMO_MODE.md](DEMO_MODE.md) file.

### AI Features

The chatbox is now fully connected to the OpenAI-powered backend. Features include:

- Real AI responses using GPT-3.5 Turbo
- Persistent chat history using SQLite database
- User identification to maintain conversation context
- Intent recognition to categorize queries
- Different AI responses based on user type (student/faculty/other)

## Development Roadmap

### Phase 1: Foundation
- Basic UI with chat interface
- Simple NLP pipeline with intent recognition
- Knowledge base structure

### Phase 2: Core Functionality
- Student services module
- Faculty services module
- Other services module
- AI integration

### Phase 3: Integration & Enhancement ✓
- Connect modules with knowledge base
- Implement context awareness
- Add persistent conversation storage with SQLite
- Real-time communication with Socket.io

### Phase 4: Polish & Presentation ✓
- Improved UI/UX with modern design
- Loading indicators and error handling
- Connection status monitoring
- Live demo preparation

## Hackathon Project

This project was developed as part of the Clark University Hackathon. The goal was to create an AI-powered chatbot that can assist the Clark University community with various services and information.
