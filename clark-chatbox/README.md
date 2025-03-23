# Clark University AI Chatbox

An AI-powered chatbot designed to provide information and services to Clark University students, faculty, and visitors.

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
- MongoDB for data storage
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
- MongoDB (local or Atlas)
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
MONGODB_URI=mongodb://localhost:27017/clark-chatbox
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
```

4. Set up frontend
```
cd ../frontend
npm install
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

### Phase 3: Integration & Enhancement
- Connect modules with knowledge base
- Implement context awareness
- Add authentication (if needed)
- Testing

### Phase 4: Polish & Presentation
- Improve UI/UX
- Add analytics and feedback collection
- Final testing and bug fixes
- Demo preparation

## Hackathon Project

This project was developed as part of the Clark University Hackathon. The goal was to create an AI-powered chatbot that can assist the Clark University community with various services and information.
