import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Fab, 
  Paper, 
  Typography, 
  TextField,
  IconButton,
  Drawer,
  List,
  ListItem,
  Divider,
  Button,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';

import { useUser, UserType } from '../contexts/UserContext';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatWidget: React.FC = () => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isSelectingUserType, setIsSelectingUserType] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const { user, setUserType } = useUser();

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleChat = () => {
    setIsAnimating(true);
    setIsOpen(!isOpen);
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleUserSelect = (type: UserType) => {
    setUserType(type);
    setIsSelectingUserType(false);
    
    // Add welcome message
    const welcomeMessage = getWelcomeMessage(type);
    setMessages([
      { 
        id: Date.now(), 
        text: welcomeMessage, 
        sender: 'ai', 
        timestamp: new Date() 
      }
    ]);
  };

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

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(input, user?.type || 'student');
      const aiMessage: Message = {
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const generateAIResponse = (message: string, userType: UserType): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello! I'm Clark AI, your ${userType} assistant. How can I help you today?`;
    }
    
    if (lowerMessage.includes('course')) {
      return 'You can find course information in the ClarkYou portal. Would you like me to provide more details about specific courses?';
    }
    
    if (lowerMessage.includes('library')) {
      return 'The Goddard Library is open Monday-Friday 8am-10pm, Saturday 10am-8pm, and Sunday 10am-10pm. Do you need directions or have specific questions about library services?';
    }
    
    if (lowerMessage.includes('onecard')) {
      return 'Your OneCard is your official Clark University ID card. You can manage your OneCard account at onecard.clarku.edu. If you\'ve lost your card, you can request a replacement at the OneCard office.';
    }
    
    if (lowerMessage.includes('appointment')) {
      return 'I can help you schedule an appointment with various departments. Which department would you like to schedule with?';
    }
    
    return 'I understand you\'re asking about something important. I\'m still learning, so please provide more details about what you need help with.';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChipClick = (text: string) => {
    setInput(text);
  };

  const resetChat = () => {
    setIsSelectingUserType(true);
    setMessages([]);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Fab
          color="primary"
          aria-label="chat"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: '#C8102E', // Clark University Red
            zIndex: 9999, // Same high z-index as the chat window
            '&:hover': {
              bgcolor: '#a5001e',
            },
          }}
          onClick={toggleChat}
        >
          <ChatIcon />
        </Fab>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Paper
          elevation={4}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 400,
            height: 520,
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: isAnimating ? 'fadeIn 0.3s ease-in-out' : 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            zIndex: 9999, // Ensure it's above all other elements
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(20px) scale(0.9)' },
              '100%': { opacity: 1, transform: 'translateY(0) scale(1)' }
            },
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              bgcolor: '#C8102E',
              color: 'white',
              p: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, rgba(200,16,46,1) 0%, rgba(255,255,255,0.7) 50%, rgba(200,16,46,1) 100%)'
              }
            }}
          >
            {!isSelectingUserType && (
              <IconButton
                color="inherit"
                size="small"
                onClick={() => setDrawerOpen(true)}
                sx={{
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'rotate(180deg)' }
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              <img 
                src="https://www.clarku.edu/wp-content/themes/clarku/assets/img/main-logo.svg" 
                alt="Clark University Logo" 
                style={{ 
                  height: '28px', 
                  marginRight: '8px',
                  // filter: 'brightness(0) invert(1)' // Make the logo white
                }} 
              />
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontFamily: '"Merriweather", serif',
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '0.5px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                AI
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            
            <Box>
              <IconButton
                color="inherit"
                size="small"
                onClick={() => setIsOpen(false)}
                sx={{ 
                  mr: 0.5,
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}
              >
                <MinimizeIcon />
              </IconButton>
              <IconButton
                color="inherit"
                size="small"
                onClick={() => {
                  setIsOpen(false);
                  resetChat();
                }}
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'rotate(90deg)' }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* User Type Selection */}
          {isSelectingUserType ? (
            <Box 
              sx={{ 
                p: 3, 
                overflow: 'auto', 
                flexGrow: 1,
                background: 'linear-gradient(to bottom, #f8f8f8, #ffffff)',
                position: 'relative'
              }}
            >
              <Typography 
                variant="h5" 
                component="div" 
                gutterBottom
                sx={{ 
                  fontFamily: '"Merriweather", serif',
                  fontWeight: 700,
                  color: '#2a2a2a',
                  textAlign: 'center',
                  mb: 3,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '3px',
                    backgroundColor: '#C8102E'
                  }
                }}
              >
                Hello😀 I am ClarkGuide💬
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: '1px solid #eaeaea',
                    borderRadius: '12px',
                    background: 'linear-gradient(145deg, #ffffff, #f9f9f9)',
                    '&:hover': { 
                      transform: 'translateY(-3px)', 
                      boxShadow: '0 5px 12px rgba(200,16,46,0.15)',
                      borderColor: '#C8102E',
                      background: 'linear-gradient(145deg, #ffffff, #fff8f8)'
                    },
                  }}
                  onClick={() => handleUserSelect('student')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        mr: 2, 
                        p: 1, 
                        borderRadius: '50%',
                        bgcolor: 'rgba(200,16,46,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 42,
                        height: 42
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 24, color: '#C8102E' }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontFamily: '"Merriweather", serif',
                          fontWeight: 600,
                          fontSize: '1rem'
                        }}
                      >
                        Student
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4, fontSize: '0.85rem' }}>
                        Access course info, campus resources, ClarkYou help, and more
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
                
                <Paper
                  elevation={2}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: '1px solid #eaeaea',
                    borderRadius: '12px',
                    background: 'linear-gradient(145deg, #ffffff, #f9f9f9)',
                    '&:hover': { 
                      transform: 'translateY(-3px)', 
                      boxShadow: '0 5px 12px rgba(200,16,46,0.15)',
                      borderColor: '#C8102E',
                      background: 'linear-gradient(145deg, #ffffff, #fff8f8)'
                    },
                  }}
                  onClick={() => handleUserSelect('faculty')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        mr: 2, 
                        p: 1, 
                        borderRadius: '50%',
                        bgcolor: 'rgba(200,16,46,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 42,
                        height: 42
                      }}
                    >
                      <WorkIcon sx={{ fontSize: 24, color: '#C8102E' }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontFamily: '"Merriweather", serif',
                          fontWeight: 600,
                          fontSize: '1rem'
                        }}
                      >
                        Faculty
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4, fontSize: '0.85rem' }}>
                        Campus resources, course schedules, and general support
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
                
                <Paper
                  elevation={2}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: '1px solid #eaeaea',
                    borderRadius: '12px',
                    background: 'linear-gradient(145deg, #ffffff, #f9f9f9)',
                    '&:hover': { 
                      transform: 'translateY(-3px)', 
                      boxShadow: '0 5px 12px rgba(200,16,46,0.15)',
                      borderColor: '#C8102E',
                      background: 'linear-gradient(145deg, #ffffff, #fff8f8)'
                    },
                  }}
                  onClick={() => handleUserSelect('other')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        mr: 2, 
                        p: 1, 
                        borderRadius: '50%',
                        bgcolor: 'rgba(200,16,46,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 42,
                        height: 42
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 24, color: '#C8102E' }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontFamily: '"Merriweather", serif',
                          fontWeight: 600,
                          fontSize: '1rem'
                        }}
                      >
                        Other
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4, fontSize: '0.85rem' }}>
                        Transportation, places near Clark, and general information
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
              
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  textAlign: 'center', 
                  mt: 5,
                  color: 'rgba(0,0,0,0.5)',
                  fontStyle: 'italic'
                }}
              >
                © 2025 Clark University Hackathon Project
              </Typography>
            </Box>
          ) : (
            <>
              {/* Chat Messages */}
              <Box sx={{ p: 2, overflow: 'auto', flexGrow: 1 }}>
                {messages.map((message, index) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      mb: 2,
                      animation: 'messageAppear 0.3s ease-out',
                      '@keyframes messageAppear': {
                        '0%': { 
                          opacity: 0,
                          transform: message.sender === 'user' ? 'translateX(20px)' : 'translateX(-20px)'
                        },
                        '100%': {
                          opacity: 1,
                          transform: 'translateX(0)'
                        }
                      },
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        maxWidth: '80%',
                        borderRadius: message.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        bgcolor: message.sender === 'user' ? '#C8102E' : '#f5f5f5',
                        color: message.sender === 'user' ? 'white' : 'inherit',
                        fontFamily: message.sender === 'ai' ? '"Merriweather", serif' : 'inherit',
                      }}
                    >
                      <Typography variant="body2" 
                        sx={{ 
                          fontFamily: message.sender === 'ai' ? '"Merriweather", serif' : 'inherit',
                          lineHeight: 1.5
                        }}
                      >
                        {message.text}
                      </Typography>
                      <Typography variant="caption" color={message.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary'} sx={{ display: 'block', mt: 0.5 }}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                <div ref={chatBottomRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!input.trim()}
                    sx={{ bgcolor: '#C8102E', color: 'white', '&:hover': { bgcolor: '#a5001e' }, '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' } }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip
                    label="Library hours"
                    size="small"
                    variant="outlined"
                    onClick={() => handleChipClick('What are the library hours?')}
                    clickable
                  />
                  <Chip
                    label="OneCard"
                    size="small"
                    variant="outlined"
                    onClick={() => handleChipClick('I need help with my OneCard')}
                    clickable
                  />
                  <Chip
                    label="Courses"
                    size="small"
                    variant="outlined"
                    onClick={() => handleChipClick('How do I register for courses?')}
                    clickable
                  />
                </Box>
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* Side Drawer for options (when in chat mode) */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {user?.type === 'student' ? 'Student' : user?.type === 'faculty' ? 'Faculty' : 'Other'} Options
          </Typography>
          <Divider sx={{ my: 1 }} />
          <List>
            <ListItem button onClick={() => {
              resetChat();
              setDrawerOpen(false);
            }}>
              <Typography>Change User Type</Typography>
            </ListItem>
            <ListItem button onClick={() => {
              setMessages([{ 
                id: Date.now(), 
                text: getWelcomeMessage(user?.type || 'student'), 
                sender: 'ai', 
                timestamp: new Date() 
              }]);
              setDrawerOpen(false);
            }}>
              <Typography>Start New Chat</Typography>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default ChatWidget;
