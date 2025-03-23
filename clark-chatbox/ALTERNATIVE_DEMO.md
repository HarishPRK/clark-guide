# Alternative Demo Method for Clark University AI Chatbox

If you encounter dependency issues when setting up the full application, this alternative method allows you to quickly see a working demo of the frontend interface with the chatbox widget in the bottom right corner.

## Option 1: Using Create React App from Scratch

If you're having trouble with the provided frontend code, you can create a new React app from scratch:

```bash
# Create a new React app
npx create-react-app clark-demo --template typescript

# Navigate to the new app directory
cd clark-demo

# Install Material UI dependencies
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

# Install React Router
npm install react-router-dom
```

Then copy only the essential frontend files:

1. Copy the following files from `clark-chatbox/frontend/src` to your new `clark-demo/src` directory:
   - `App.tsx`
   - `contexts/UserContext.tsx`
   - `pages/Welcome.tsx`
   - `pages/Chat.tsx`

2. Start the development server:
```bash
npm start
```

## Option 2: Using a Static HTML Demo

For a completely dependency-free option, you can use this simple HTML file that demonstrates the basic UI:

1. Create a file named `clark-demo.html` and copy the following code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clark University AI Chatbox Demo</title>
  <!-- Material UI CSS -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
  <style>
    body, html {
      margin: 0;
      padding: 0;
      font-family: 'Roboto', sans-serif;
      height: 100%;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .welcome-screen, .chat-screen {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 20px;
      margin: 20px 0;
      flex: 1;
    }
    .header {
      background-color: #C8102E;
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      margin: -20px -20px 20px -20px;
      text-align: center;
    }
    .card-container {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin: 20px 0;
    }
    .card {
      flex: 1;
      min-width: 200px;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;
      text-align: center;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .card.selected {
      border: 2px solid #C8102E;
      background-color: #ffeaee;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .button {
      background-color: #C8102E;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 20px;
    }
    .button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background-color: #C8102E;
      color: white;
    }
    .chat-area {
      height: 400px;
      overflow-y: auto;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 4px;
      margin: 20px 0;
    }
    .message {
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 8px;
      max-width: 70%;
    }
    .user-message {
      background-color: #C8102E;
      color: white;
      margin-left: auto;
    }
    .ai-message {
      background-color: white;
      border: 1px solid #ddd;
    }
    .input-area {
      display: flex;
      gap: 10px;
    }
    .input-field {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .chip {
      display: inline-block;
      margin: 5px;
      padding: 5px 10px;
      background-color: #f1f1f1;
      border-radius: 16px;
      cursor: pointer;
    }
    .chip:hover {
      background-color: #e1e1e1;
    }
    .hidden {
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Welcome Screen -->
    <div id="welcome-screen" class="welcome-screen">
      <div class="header">
        <h1>Welcome to Clark University AI Chatbox</h1>
        <p>Your personal assistant for all Clark University services</p>
      </div>
      
      <h2>Please select who you are:</h2>
      
      <div class="card-container">
        <div id="student-card" class="card" onclick="selectUserType('student')">
          <i class="material-icons icon">school</i>
          <h3>Student</h3>
          <p>Access course info, campus resources, ClarkYou help, and more</p>
        </div>
        
        <div id="faculty-card" class="card" onclick="selectUserType('faculty')">
          <i class="material-icons icon">work</i>
          <h3>Faculty</h3>
          <p>Campus resources, course schedules, and general support</p>
        </div>
        
        <div id="other-card" class="card" onclick="selectUserType('other')">
          <i class="material-icons icon">person</i>
          <h3>Other</h3>
          <p>Transportation, places near Clark, and general information</p>
        </div>
      </div>
      
      <div style="text-align: center;">
        <button id="start-chat-btn" class="button" disabled onclick="startChat()">Start Chatting</button>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #666;">
        <p>© 2025 Clark University Hackathon Project</p>
      </div>
    </div>
    
    <!-- Chat Screen (initially hidden) -->
    <div id="chat-screen" class="chat-screen hidden">
      <div class="chat-header">
        <i class="material-icons" onclick="backToWelcome()">arrow_back</i>
        <h2>Clark University AI Chatbox</h2>
        <i class="material-icons">menu</i>
      </div>
      
      <div id="chat-area" class="chat-area">
        <div class="message ai-message">
          <p id="welcome-message">Welcome to Clark AI! How can I help you today?</p>
        </div>
      </div>
      
      <div class="input-area">
        <input id="chat-input" type="text" class="input-field" placeholder="Type your message here..." onkeydown="handleKeyPress(event)">
        <button class="button" onclick="sendMessage()">Send</button>
      </div>
      
      <div style="margin-top: 10px;">
        <div class="chip" onclick="setInput('Hi Clark AI')">Hi Clark AI</div>
        <div class="chip" onclick="setInput('What are the library hours?')">Library hours</div>
        <div class="chip" onclick="setInput('I need help with my OneCard')">OneCard help</div>
        <div class="chip" onclick="setInput('How do I register for courses?')">Course registration</div>
      </div>
    </div>
  </div>

  <script>
    let selectedUserType = null;
    const welcomeMessages = {
      student: 'Welcome to Clark AI! I can help you with course information, campus resources, ClarkYou credentials, OneCard queries, appointment scheduling, and more. What can I assist you with today?',
      faculty: 'Welcome to Clark AI! I can help you with campus resources, course schedules, and other faculty services. How can I assist you today?',
      other: 'Welcome to Clark AI! I can provide information about commuter options, places near Clark, and general university information. What would you like to know?'
    };

    function selectUserType(type) {
      // Reset all cards
      document.getElementById('student-card').classList.remove('selected');
      document.getElementById('faculty-card').classList.remove('selected');
      document.getElementById('other-card').classList.remove('selected');
      
      // Select the clicked card
      document.getElementById(`${type}-card`).classList.add('selected');
      
      // Set the selected type
      selectedUserType = type;
      
      // Enable the start button
      document.getElementById('start-chat-btn').disabled = false;
    }

    function startChat() {
      if (!selectedUserType) return;
      
      // Hide welcome screen, show chat screen
      document.getElementById('welcome-screen').classList.add('hidden');
      document.getElementById('chat-screen').classList.remove('hidden');
      
      // Set appropriate welcome message
      document.getElementById('welcome-message').textContent = welcomeMessages[selectedUserType];
      
      // Focus on input
      document.getElementById('chat-input').focus();
    }

    function backToWelcome() {
      // Hide chat screen, show welcome screen
      document.getElementById('chat-screen').classList.add('hidden');
      document.getElementById('welcome-screen').classList.remove('hidden');
    }

    function setInput(text) {
      document.getElementById('chat-input').value = text;
      document.getElementById('chat-input').focus();
    }

    function handleKeyPress(event) {
      if (event.key === 'Enter') {
        sendMessage();
      }
    }

    function addMessage(text, isUser) {
      const chatArea = document.getElementById('chat-area');
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message');
      messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
      
      const messagePara = document.createElement('p');
      messagePara.textContent = text;
      messageDiv.appendChild(messagePara);
      
      chatArea.appendChild(messageDiv);
      
      // Scroll to bottom
      chatArea.scrollTop = chatArea.scrollHeight;
    }

    function sendMessage() {
      const input = document.getElementById('chat-input');
      const message = input.value.trim();
      
      if (!message) return;
      
      // Add user message
      addMessage(message, true);
      
      // Clear input
      input.value = '';
      
      // Simulate AI thinking
      setTimeout(() => {
        // Generate response based on message content
        let response = '';
        
        if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
          response = `Hello! I'm Clark AI, your ${selectedUserType} assistant. How can I help you today?`;
        } 
        else if (message.toLowerCase().includes('library')) {
          response = 'The Goddard Library is open Monday-Friday 8am-10pm, Saturday 10am-8pm, and Sunday 10am-10pm. Do you need directions or have specific questions about library services?';
        }
        else if (message.toLowerCase().includes('course') || message.toLowerCase().includes('class')) {
          response = 'You can find course information in the ClarkYou portal. Would you like me to provide more details about specific courses?';
        }
        else if (message.toLowerCase().includes('onecard')) {
          response = 'Your OneCard is your official Clark University ID card. You can manage your OneCard account at onecard.clarku.edu. If you\'ve lost your card, you can request a replacement at the OneCard office.';
        }
        else if (message.toLowerCase().includes('appointment')) {
          response = 'I can help you schedule an appointment with various departments. Which department would you like to schedule with?';
        }
        else if (message.toLowerCase().includes('clark')) {
          response = 'Clark University is a private research university in Worcester, Massachusetts, founded in 1887. Is there something specific about Clark you\'d like to know?';
        }
        else {
          response = 'I understand you\'re asking about something important. I\'m still learning, so please provide more details about what you need help with.';
        }
        
        // Add AI response
        addMessage(response, false);
      }, 1000);
    }
  </script>
</body>
</html>
```

2. Open this file directly in your web browser by double-clicking it.

This HTML demo provides the same visual interface and interaction as the full application, but runs entirely in the browser without any server or dependencies.

## Option 3: Vite React Template (Modern Alternative)

If you're familiar with Vite (a modern build tool), it often has fewer dependency issues than Create React App:

```bash
# Create a new Vite React project
npm create vite@latest clark-vite -- --template react-ts

# Navigate to new project
cd clark-vite

# Install dependencies
npm install

# Install Material UI
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

# Install React Router
npm install react-router-dom

# Start the development server
npm run dev
```

Then copy the components as described in Option 1.
