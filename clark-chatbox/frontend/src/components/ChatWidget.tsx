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
  alpha,
  CircularProgress
} from '@mui/material';
import socketService, { ChatMessage as SocketMessage } from '../services/socketService';
import CampusHeatmap, { HeatmapData } from './CampusHeatmap';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';

import { useUser, UserType } from '../contexts/UserContext';

// URL for Cougar SVG logo
const cougarLogoUrl = "https://dxbhsrqyrr690.cloudfront.net/sidearm.nextgen.sites/clarku.sidearmsports.com/images/responsive_2023/CU%20Cougar%20on%20White.svg";

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
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const { user, setUserType } = useUser();
  
  // Campus ambient intelligence features
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const ambientInsightTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Generate realistic occupancy data based on time of day
  const getTimeAdjustedOccupancyData = (): HeatmapData[] => {
    const currentHour = new Date().getHours();
    const isOffHours = currentHour >= 22 || currentHour < 8; // 10 PM to 8 AM
    const isLunchTime = currentHour >= 11 && currentHour <= 14; // 11 AM to 2 PM
    const isDinnerTime = currentHour >= 17 && currentHour <= 20; // 5 PM to 8 PM
    const isPeakHours = currentHour >= 10 && currentHour <= 16; // 10 AM to 4 PM
    
    return [
      { 
        locationId: 'goddard-library', 
        name: 'Goddard Library', 
        occupancy: isOffHours 
          ? 0.05 + Math.random() * 0.1 // 5-15% during off hours
          : isPeakHours 
            ? 0.7 + Math.random() * 0.15 // 70-85% during peak hours
            : 0.3 + Math.random() * 0.3 // 30-60% otherwise
      },
      { 
        locationId: 'academic-commons', 
        name: 'Academic Commons', 
        occupancy: isOffHours 
          ? 0.03 + Math.random() * 0.07 // 3-10% during off hours
          : isPeakHours 
            ? 0.6 + Math.random() * 0.2 // 60-80% during peak hours
            : 0.25 + Math.random() * 0.35 // 25-60% otherwise
      },
      { 
        locationId: 'university-center-dining', 
        name: 'Dining Hall', 
        occupancy: isOffHours 
          ? 0.01 + Math.random() * 0.04 // 1-5% during off hours (closed)
          : isLunchTime 
            ? 0.85 + Math.random() * 0.15 // 85-100% during lunch rush
            : isDinnerTime
              ? 0.75 + Math.random() * 0.2 // 75-95% during dinner
              : 0.1 + Math.random() * 0.2 // 10-30% otherwise
      },
      { 
        locationId: 'science-building-cafe', 
        name: 'Science Café', 
        occupancy: isOffHours 
          ? 0 // 0% during off hours (closed)
          : isLunchTime 
            ? 0.7 + Math.random() * 0.25 // 70-95% during lunch
            : 0.2 + Math.random() * 0.3 // 20-50% otherwise
      },
      { 
        locationId: 'computer-lab-main', 
        name: 'Main Computer Lab', 
        occupancy: isOffHours 
          ? 0.05 + Math.random() * 0.1 // 5-15% during off hours (24/7 lab)
          : isPeakHours 
            ? 0.6 + Math.random() * 0.3 // 60-90% during peak hours
            : 0.3 + Math.random() * 0.2 // 30-50% otherwise
      }
    ];
  };

  // Clear chat history when page is reloaded
  useEffect(() => {
    // Remove sessionId from localStorage to start a fresh chat session
    localStorage.removeItem('sessionId');
    // Generate a new sessionId (this will happen in the socketService when it initializes)
    console.log('Cleared chat session due to page reload');
  }, []);

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

  // Ambient intelligence system - periodically fetch ambient insights
  useEffect(() => {
    // Only run when chat is open, user is connected, and we're not in user selection mode
    if (isOpen && user?.type && !isSelectingUserType && socketService.isConnected()) {
      console.log('Setting up ambient insight polling');
      
      // Initial fetch for heatmap data and insights
      const fetchAmbientData = async () => {
        try {
          // Get ambient insight
          const insight = await socketService.getAmbientInsight();
          
          // If we got an interesting insight, add it as a system message
          if (insight) {
            console.log('Received ambient insight:', insight);
            
            // Add the insight as a message from the AI
            setMessages(prev => [...prev, {
              id: Date.now(),
              text: insight,
              sender: 'ai',
              timestamp: new Date()
            }]);
            
            // Show the heatmap if the insight mentions crowdedness
            if (insight.toLowerCase().includes('crowd') || 
                insight.toLowerCase().includes('busy') || 
                insight.toLowerCase().includes('quiet') ||
                insight.toLowerCase().includes('occupancy') ||
                insight.toLowerCase().includes('capacity')) {
              
              // Mock heatmap data (would come from the server in a real implementation)
              setHeatmapData([
                { locationId: 'goddard-library', name: 'Goddard Library', occupancy: 0.85 },
                { locationId: 'academic-commons', name: 'Academic Commons', occupancy: 0.65 },
                { locationId: 'university-center-dining', name: 'Dining Hall', occupancy: 0.92 },
                { locationId: 'science-building-cafe', name: 'Science Café', occupancy: 0.45 },
                { locationId: 'computer-lab-main', name: 'Main Computer Lab', occupancy: 0.70 }
              ]);
              setShowHeatmap(true);
            }
          }
        } catch (error) {
          console.error('Error fetching ambient data:', error);
        }
      };
      
      // Fetch immediately on first load
      fetchAmbientData();
      
      // Set up periodic polling (every 5 minutes)
      const intervalId = setInterval(fetchAmbientData, 5 * 60 * 1000);
      
      // Store interval ID in ref for cleanup
      ambientInsightTimer.current = intervalId;
      
      // Cleanup on component unmount
      return () => {
        if (ambientInsightTimer.current) {
          clearInterval(ambientInsightTimer.current);
          ambientInsightTimer.current = null;
        }
      };
    }
  }, [isOpen, isSelectingUserType, user?.type]);

  // Connect to socket when user selects type
  useEffect(() => {
    if (user?.type && !isSelectingUserType) {
      // Show connecting status
      setConnectionError(null);
      setIsLoading(true);
      
      let isMounted = true;
      
      // Attempt to connect with retry logic
      const connectWithRetry = (retries = 3) => {
        console.log('Attempting to connect to socket server, retries left:', retries);
        
        socketService.connect(user.type!)
          .then(() => {
            if (!isMounted) return;
            
            console.log('Socket connection successful');
            setConnectionError(null);
            
            // Try to load chat history
            return socketService.getChatHistory();
          })
          .then(history => {
            if (!isMounted || !history) return;
            
            if (history.length > 0) {
              console.log('Setting chat history:', history);
              setMessages(history.map(msg => ({
                id: typeof msg.id === 'string' ? parseInt(msg.id) : (msg.id as number || Date.now()),
                text: msg.text,
                sender: msg.sender,
                timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
              })));
            }
            setIsLoading(false);
          })
          .catch(error => {
            console.error('Connection error:', error);
            if (!isMounted) return;
            
            if (retries > 0) {
              // Retry connection after delay
              setTimeout(() => connectWithRetry(retries - 1), 2000);
            } else {
              setConnectionError('Could not connect to AI service. Please refresh and try again.');
              setIsLoading(false);
            }
          });
      };
      
      // Set up message listener
      const cleanupListener = socketService.onMessage((message) => {
        if (!isMounted) return;
        
        console.log('Processing received message:', message);
        setMessages(prev => [...prev, {
          id: typeof message.id === 'string' ? parseInt(message.id) : (message.id || Date.now()),
          text: message.text,
          sender: message.sender,
          timestamp: message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)
        }]);
        setIsLoading(false);
      });
      
      // Start connection process
      connectWithRetry();
      
      // Cleanup function
      return () => {
        isMounted = false;
        cleanupListener();
        socketService.disconnect();
      };
    }
  }, [user?.type, isSelectingUserType]);

  const handleUserSelect = (type: UserType) => {
    setUserType(type);
    setIsSelectingUserType(false);
    setConnectionError(null);
    
    // Add welcome message - this will be shown immediately while we connect to socket
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

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Check connection status first
    if (!socketService.isConnected()) {
      setConnectionError('Connection to server lost. Attempting to reconnect...');
      
      try {
        // Try to reconnect
        await socketService.connect(user?.type || 'student');
        // Clear error if successful
        setConnectionError(null);
      } catch (error) {
        console.error('Reconnection failed:', error);
        setConnectionError('Could not reconnect to AI service. Please refresh the page.');
        return;
      }
    }

    // Add user message to the UI immediately
    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const sentMessage = input;
    setInput('');
    setIsLoading(true);
    
    // Check if message is about booking study rooms - add extra "thinking" time if it is
    const isStudyRoomBookingRequest = sentMessage.toLowerCase().includes('study room') && 
      (sentMessage.toLowerCase().includes('book') || 
       sentMessage.toLowerCase().includes('reserve') || 
       sentMessage.toLowerCase().includes('schedule'));
    
    try {
      if (isStudyRoomBookingRequest) {
        // Add a minimum 3 second "thinking" time for study room bookings
        // to make it appear as if the system is checking availability
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Send message to AI backend
      await socketService.sendMessage(sentMessage);
      
      // For study room booking messages that say "Let me find available rooms for you..."
      // Add mock available room data to ensure the booking flow continues
      if (sentMessage.toLowerCase().includes('1 hour') || 
          sentMessage.toLowerCase().includes('60 minute') ||
          sentMessage.toLowerCase().includes('hour') ||
          sentMessage.toLowerCase().match(/\b1\b/) ||
          sentMessage.toLowerCase().match(/\bone\b/)) {
        
        // Wait 2 seconds before showing available rooms
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: `I found 3 rooms available for your requested time:\n\n1. Goddard Library Room 302 (Floor 3) - Capacity: 6, Features: Whiteboard, Projector\n\n2. University Center Room 118 (Floor 1) - Capacity: 4, Features: Whiteboard, Power outlets\n\n3. Science Center Room 203 (Floor 2) - Capacity: 8, Features: Whiteboard, Projector, Computer\n\nWhich room would you like to book? (Please respond with the room number or the option number)`,
            sender: 'ai',
            timestamp: new Date()
          }]);
          setIsLoading(false);
        }, 2000);
      }
      // Handle room selection/confirmation flow
      else if (sentMessage.match(/\b[123]\b/) || 
               sentMessage.toLowerCase().includes('room 302') || 
               sentMessage.toLowerCase().includes('room 118') || 
               sentMessage.toLowerCase().includes('room 203') ||
               sentMessage.toLowerCase().includes('option 1') ||
               sentMessage.toLowerCase().includes('option 2') ||
               sentMessage.toLowerCase().includes('option 3') ||
               sentMessage.toLowerCase().includes('first') ||
               sentMessage.toLowerCase().includes('second') ||
               sentMessage.toLowerCase().includes('third')) {
        
        // Determine which room was selected
        let roomNumber = '';
        let building = '';
        
        if (sentMessage.match(/\b1\b/) || 
            sentMessage.toLowerCase().includes('room 302') || 
            sentMessage.toLowerCase().includes('option 1') ||
            sentMessage.toLowerCase().includes('first')) {
          roomNumber = '302';
          building = 'Goddard Library';
        } else if (sentMessage.match(/\b2\b/) || 
                   sentMessage.toLowerCase().includes('room 118') || 
                   sentMessage.toLowerCase().includes('option 2') ||
                   sentMessage.toLowerCase().includes('second')) {
          roomNumber = '118';
          building = 'University Center';
        } else {
          roomNumber = '203';
          building = 'Science Center';
        }
        
        // Show confirmation message after a delay
        setTimeout(() => {
          const bookingDetails = `
Room: ${building} Room ${roomNumber}
Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
Time: 3:30 PM to 4:30 PM
          `.trim();
          
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: `Your room has been successfully booked!\n\n${bookingDetails}\n\nYour booking is confirmed. You can access the room using your OneCard at the scheduled time.`,
            sender: 'ai',
            timestamp: new Date()
          }]);
          setIsLoading(false);
        }, 1000);
      }
      
      // The response will be handled by the socket listener in useEffect
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      
      // Show error message with more detail
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: error instanceof Error ? 
          `Sorry, I encountered an error processing your request. ${error.message}` : 
          "Sorry, I couldn't process your message. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
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
    
    // Force generation of a new session ID to clear all ongoing conversations
    localStorage.removeItem('sessionId');
    // Disconnect and reconnect to clear any ongoing operations on the server side
    socketService.disconnect();
    console.log('Chat reset: cleared session and disconnected socket');
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
            bgcolor: '#FF6B81', // Lighter shade of red
            zIndex: 9999, // Same high z-index as the chat window
            '&:hover': {
              bgcolor: '#FF4757', // Slightly darker on hover
            },
            padding: '8px', // Add padding for the image
          }}
          onClick={toggleChat}
        >
          {/* Use the Cougar SVG logo instead of ChatIcon */}
          <Box 
            component="img" 
            src={cougarLogoUrl}
            alt="Clark University Cougar"
            sx={{ 
              width: '30px',
              height: '30px',
              objectFit: 'contain',
            }}
          />
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
              bgcolor: '#FF6B81', // Lighter shade of red to match button
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
                background: 'linear-gradient(90deg, rgba(255,107,129,1) 0%, rgba(255,255,255,0.7) 50%, rgba(255,107,129,1) 100%)'
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
                    backgroundColor: '#FF6B81'
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
                      boxShadow: '0 5px 12px rgba(255,107,129,0.15)',
                      borderColor: '#FF6B81',
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
                        bgcolor: 'rgba(255,107,129,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 42,
                        height: 42
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 24, color: '#FF6B81' }} />
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
                      boxShadow: '0 5px 12px rgba(255,107,129,0.15)',
                      borderColor: '#FF6B81',
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
                        bgcolor: 'rgba(255,107,129,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 42,
                        height: 42
                      }}
                    >
                      <WorkIcon sx={{ fontSize: 24, color: '#FF6B81' }} />
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
                      boxShadow: '0 5px 12px rgba(255,107,129,0.15)',
                      borderColor: '#FF6B81',
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
                        bgcolor: 'rgba(255,107,129,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 42,
                        height: 42
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 24, color: '#FF6B81' }} />
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
                {connectionError && (
                  <Box 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      bgcolor: '#fff0f0', 
                      borderRadius: 2,
                      border: '1px solid #ffcdd2' 
                    }}
                  >
                    <Typography variant="body2" color="error">
                      {connectionError}
                    </Typography>
                  </Box>
                )}
                
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
                        bgcolor: message.sender === 'user' ? '#FF6B81' : '#f5f5f5',
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
                
                {/* Loading indicator */}
                {isLoading && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      mb: 2,
                      pl: 2
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        borderRadius: '18px 18px 18px 4px',
                        bgcolor: '#f5f5f5',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} sx={{ color: '#FF6B81' }} />
                        <Typography 
                          variant="body2"
                          sx={{ 
                            fontFamily: '"Merriweather", serif',
                            color: '#666'
                          }}
                        >
                          Thinking...
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                )}
              </Box>
              
              {/* Campus Heatmap - shown conditionally */}
              {showHeatmap && heatmapData.length > 0 && (
                <CampusHeatmap 
                  data={heatmapData}
                  onLocationClick={(locationId) => {
                    const location = heatmapData.find(d => d.locationId === locationId);
                    if (location) {
                      setInput(`Tell me more about ${location.name}`);
                    }
                  }}
                  onClose={() => setShowHeatmap(false)}
                />
              )}

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
                    sx={{ bgcolor: '#FF6B81', color: 'white', '&:hover': { bgcolor: '#FF4757' }, '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' } }}
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
                    onClick={() => handleChipClick('What is my course schedule?')}
                    clickable
                  />
                  <Chip
                    label="Campus activity"
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      // Show the heatmap with time-adjusted data if it's not already showing
                      if (!showHeatmap) {
                        const timeAdjustedData = getTimeAdjustedOccupancyData();
                        setHeatmapData(timeAdjustedData);
                        setShowHeatmap(true);
                        
                        // Add ambient insight message based on current data
                        const diningHall = timeAdjustedData.find(d => d.locationId === 'university-center-dining');
                        const scienceCafe = timeAdjustedData.find(d => d.locationId === 'science-building-cafe');
                        
                        // Find busiest and quietest locations
                        const sortedByOccupancy = [...timeAdjustedData].sort((a, b) => b.occupancy - a.occupancy);
                        const busiest = sortedByOccupancy[0];
                        const quietest = sortedByOccupancy[sortedByOccupancy.length - 1];
                        
                        // Create message with actual occupancy percentages
                        let insightMessage = "Here's the current campus activity heatmap. ";
                        
                        if (busiest.occupancy > 0.7) {
                          insightMessage += `${busiest.name} is quite busy right now (${Math.round(busiest.occupancy * 100)}% capacity)`;
                          
                          if (quietest.occupancy < 0.5) {
                            insightMessage += `, while ${quietest.name} is a good option if you're looking for a quieter spot (${Math.round(quietest.occupancy * 100)}% capacity).`;
                          } else {
                            insightMessage += ". All campus locations are fairly active at this time.";
                          }
                        } else {
                          insightMessage += "Campus locations are not very crowded right now - a great time to visit!";
                        }
                        
                        setMessages(prev => [...prev, {
                          id: Date.now(),
                          text: insightMessage,
                          sender: 'ai',
                          timestamp: new Date()
                        }]);
                      } else {
                        // If already showing, just ask for quiet spots
                        handleChipClick('Where can I find a quiet place to study right now?');
                      }
                    }}
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
              // Clear all messages
              setMessages([]);
              
              // Force generation of a new session ID to clear any ongoing conversations
              localStorage.removeItem('sessionId');
              
              // Disconnect and reconnect to clear any ongoing operations on the server side
              socketService.disconnect();
              console.log('Chat reset: starting new chat with fresh session');
              
              // Show welcome message
              setMessages([{ 
                id: Date.now(), 
                text: getWelcomeMessage(user?.type || 'student'), 
                sender: 'ai', 
                timestamp: new Date() 
              }]);
              
              setDrawerOpen(false);
              
              // Reconnect with the same user type
              if (user?.type) {
                setIsLoading(true);
                socketService.connect(user.type)
                  .then(() => setIsLoading(false))
                  .catch(error => {
                    console.error('Error reconnecting:', error);
                    setConnectionError('Could not reconnect. Please refresh the page.');
                    setIsLoading(false);
                  });
              }
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
