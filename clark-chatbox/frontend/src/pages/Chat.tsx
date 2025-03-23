import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  List, 
  ListItem,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Divider,
  Chip,
  Container,
  Grid
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EventIcon from '@mui/icons-material/Event';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PlaceIcon from '@mui/icons-material/Place';

// Import user context
import { useUser, UserType } from '../contexts/UserContext';

// Mock chat service (would connect to real backend in production)
const mockChatResponse = async (message: string, userType: UserType): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple response patterns
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    return `Hello! I'm Clark AI, your ${userType} assistant. How can I help you today?`;
  }
  
  if (message.toLowerCase().includes('course')) {
    return 'You can find course information in the ClarkYou portal. Would you like me to provide more details about specific courses?';
  }
  
  if (message.toLowerCase().includes('library')) {
    return 'The Goddard Library is open Monday-Friday 8am-10pm, Saturday 10am-8pm, and Sunday 10am-10pm. Do you need directions or have specific questions about library services?';
  }
  
  if (message.toLowerCase().includes('onecard')) {
    return 'Your OneCard is your official Clark University ID card. You can manage your OneCard account at onecard.clarku.edu. If you\'ve lost your card, you can request a replacement at the OneCard office.';
  }
  
  if (message.toLowerCase().includes('appointment')) {
    return 'I can help you schedule an appointment with various departments. Which department would you like to schedule with?';
  }
  
  if (message.toLowerCase().includes('clark')) {
    return 'Clark University is a private research university in Worcester, Massachusetts, founded in 1887. Is there something specific about Clark you\'d like to know?';
  }
  
  // Default response
  return 'I understand you\'re asking about something important. I\'m still learning, so please provide more details about what you need help with.';
};

// Message interface
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { user, startNewSession } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Check if user is set
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      text: getWelcomeMessage(user.type),
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  }, [user, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get welcome message based on user type
  const getWelcomeMessage = (type: UserType): string => {
    switch (type) {
      case 'student':
        return 'Welcome to Clark AI! I can help you with course information, campus resources, ClarkYou credentials, OneCard queries, appointment scheduling, and more. What can I assist you with today?';
      case 'faculty':
        return 'Welcome to Clark AI! I can help you with campus resources, course schedules, and other faculty services. How can I assist you today?';
      case 'other':
        return 'Welcome to Clark AI! I can provide information about commuter options, places near Clark, and general university information. What would you like to know?';
      default:
        return 'Welcome to Clark AI! How can I help you today?';
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      // Get AI response (via mock function for now)
      const response = await mockChatResponse(input.trim(), user.type);
      
      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error getting chat response:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle preset message selection
  const handlePresetMessage = (message: string) => {
    setInput(message);
    setDrawerOpen(false);
  };

  // Get preset messages based on user type
  const getPresetMessages = (): { category: string; messages: string[] }[] => {
    switch (user?.type) {
      case 'student':
        return [
          {
            category: 'Courses',
            messages: [
              'How do I register for classes?',
              'What courses are available for next semester?',
              'Where can I find my course schedule?'
            ]
          },
          {
            category: 'Campus Resources',
            messages: [
              'What are the library hours?',
              'Where is the Kneller Athletic Center?',
              'How do I reserve a study room?'
            ]
          },
          {
            category: 'ClarkYou Credentials',
            messages: [
              'I forgot my ClarkYou password',
              'How do I access my email?',
              'Where do I find my student records?'
            ]
          },
          {
            category: 'OneCard',
            messages: [
              'I lost my OneCard',
              'How do I add money to my OneCard?',
              'Where can I use my OneCard?'
            ]
          },
          {
            category: 'Appointments',
            messages: [
              'How do I schedule an appointment with an advisor?',
              'I need to meet with a professor',
              'Where is the health center?'
            ]
          }
        ];
      case 'faculty':
        return [
          {
            category: 'Campus Resources',
            messages: [
              'What are the library hours?',
              'How do I access research databases?',
              'Where can I book rooms for events?'
            ]
          },
          {
            category: 'Course Schedules',
            messages: [
              'How do I submit grades?',
              'Where can I access the academic calendar?',
              'How do I set up my course in Moodle?'
            ]
          }
        ];
      case 'other':
        return [
          {
            category: 'Commuter Options',
            messages: [
              'How do I use the Transloc app?',
              'Where can I find MBTA schedules?',
              'Is there a shuttle to the train station?'
            ]
          },
          {
            category: 'Places Near Clark',
            messages: [
              'What restaurants are near campus?',
              'Where is the nearest grocery store?',
              'Are there any coffee shops nearby?'
            ]
          }
        ];
      default:
        return [];
    }
  };

  // Render user icon based on type
  const getUserIcon = () => {
    switch (user?.type) {
      case 'student':
        return <SchoolIcon />;
      case 'faculty':
        return <WorkIcon />;
      case 'other':
        return <PersonIcon />;
      default:
        return <PersonIcon />;
    }
  };

  // Render category icon
  const getCategoryIcon = (category: string) => {
    if (category.includes('Course')) return <SchoolIcon />;
    if (category.includes('Library') || category.includes('Campus')) return <LocalLibraryIcon />;
    if (category.includes('OneCard')) return <CreditCardIcon />;
    if (category.includes('Appointment')) return <EventIcon />;
    if (category.includes('Commuter')) return <DirectionsBusIcon />;
    if (category.includes('Places')) return <PlaceIcon />;
    return <SchoolIcon />;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Clark University AI Chatbox
          </Typography>
          
          <IconButton
            color="inherit"
            aria-label="back to welcome"
            onClick={() => navigate('/')}
          >
            <ArrowBackIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer for categories */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {getUserIcon()}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {user && user.type ? `${user.type.charAt(0).toUpperCase() + user.type.slice(1)} Services` : 'Services'}
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {getPresetMessages().map((category, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getCategoryIcon(category.category)}
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ ml: 1 }}>
                      {category.category}
                    </Typography>
                  </Box>
                </ListItem>
                
                {category.messages.map((msg, idx) => (
                  <ListItem key={idx} sx={{ pl: 4 }}>
                    <Button 
                      variant="text" 
                      color="primary"
                      onClick={() => handlePresetMessage(msg)}
                      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      {msg}
                    </Button>
                  </ListItem>
                ))}
                
                {index < getPresetMessages().length - 1 && (
                  <Divider sx={{ my: 1 }} />
                )}
              </React.Fragment>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Button 
            variant="outlined" 
            color="primary" 
            fullWidth
            onClick={() => {
              startNewSession();
              setMessages([{
                id: Date.now().toString(),
                text: getWelcomeMessage(user?.type || 'student'),
                sender: 'ai',
                timestamp: new Date()
              }]);
              setDrawerOpen(false);
            }}
          >
            Start New Chat
          </Button>
        </Box>
      </Drawer>

      {/* Chat Area */}
      <Box 
        sx={{ 
          flex: 1, 
          p: 2, 
          overflowY: 'auto',
          bgcolor: 'background.default' 
        }}
      >
        <Container maxWidth="md">
          {messages.map((message) => (
            <Box 
              key={message.id}
              sx={{ 
                display: 'flex', 
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2 
              }}
            >
              <Paper 
                elevation={1}
                sx={{ 
                  p: 2, 
                  maxWidth: '80%',
                  borderRadius: 2,
                  bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                  color: message.sender === 'user' ? 'white' : 'text.primary'
                }}
              >
                <Typography variant="body1">
                  {message.text}
                </Typography>
                <Typography variant="caption" color={message.sender === 'user' ? 'white' : 'text.secondary'}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Paper>
            </Box>
          ))}
          
          {isTyping && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography>Clark AI is typing...</Typography>
              </Paper>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Container>
      </Box>

      {/* Input Area */}
      <Box 
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper' 
        }}
      >
        <Container maxWidth="md">
          <Grid container spacing={1} alignItems="center">
            <Grid item xs>
              <TextField
                fullWidth
                placeholder="Type your message here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                multiline
                maxRows={3}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
              >
                Send
              </Button>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label="Hi Clark AI" 
              variant="outlined" 
              onClick={() => handlePresetMessage('Hi Clark AI')} 
              clickable 
            />
            <Chip 
              label="Library hours" 
              variant="outlined" 
              onClick={() => handlePresetMessage('What are the library hours?')} 
              clickable 
            />
            <Chip 
              label="OneCard help" 
              variant="outlined" 
              onClick={() => handlePresetMessage('I need help with my OneCard')} 
              clickable 
            />
            <Chip 
              label="Course registration" 
              variant="outlined" 
              onClick={() => handlePresetMessage('How do I register for courses?')} 
              clickable 
            />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Chat;
