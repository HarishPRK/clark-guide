import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Button,
  Grid,
  Container,
  Paper
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';

// Import user context
import { useUser, UserType } from '../contexts/UserContext';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { setUserType } = useUser();
  const [selected, setSelected] = useState<UserType | null>(null);

  // Handle user type selection
  const handleSelect = (type: UserType) => {
    setSelected(type);
  };

  // Start chat with selected user type
  const handleStartChat = () => {
    if (selected) {
      setUserType(selected);
      navigate('/chat');
    }
  };

  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            width: '100%', 
            borderRadius: 3, 
            overflow: 'hidden',
            mb: 4
          }}
        >
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 3, 
              textAlign: 'center' 
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Welcome to Clark University AI Chatbox
            </Typography>
            <Typography variant="subtitle1">
              Your personal assistant for all Clark University services
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Please select who you are:
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card 
                  onClick={() => handleSelect('student')}
                  sx={{ 
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { 
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                    },
                    border: selected === 'student' ? 2 : 0,
                    borderColor: 'primary.main',
                    bgcolor: selected === 'student' ? 'primary.light' : 'background.paper',
                    color: selected === 'student' ? 'white' : 'inherit'
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <SchoolIcon sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" component="div" fontWeight="medium">
                      Student
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Access course info, campus resources, ClarkYou help, and more
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card 
                  onClick={() => handleSelect('faculty')}
                  sx={{ 
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { 
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                    },
                    border: selected === 'faculty' ? 2 : 0,
                    borderColor: 'primary.main',
                    bgcolor: selected === 'faculty' ? 'primary.light' : 'background.paper',
                    color: selected === 'faculty' ? 'white' : 'inherit'
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <WorkIcon sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" component="div" fontWeight="medium">
                      Faculty
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Campus resources, course schedules, and general support
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card 
                  onClick={() => handleSelect('other')}
                  sx={{ 
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { 
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                    },
                    border: selected === 'other' ? 2 : 0,
                    borderColor: 'primary.main',
                    bgcolor: selected === 'other' ? 'primary.light' : 'background.paper',
                    color: selected === 'other' ? 'white' : 'inherit'
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <PersonIcon sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" component="div" fontWeight="medium">
                      Other
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Transportation, places near Clark, and general information
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={handleStartChat}
                disabled={!selected}
                sx={{ px: 4, py: 1 }}
              >
                Start Chatting
              </Button>
            </Box>
          </Box>
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          © {new Date().getFullYear()} Clark University Hackathon Project
        </Typography>
      </Box>
    </Container>
  );
};

export default Welcome;
