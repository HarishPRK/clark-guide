import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  AppBar, 
  Toolbar, 
  Button, 
  Divider,
  Paper,
  Grid,
  useTheme,
  Link,
} from '@mui/material';
import ChatWidget from '../components/ChatWidget';
import SearchIcon from '@mui/icons-material/Search';

// Import a Clark University logo if available
// import ClarkLogo from '../assets/clark-logo.png';

const HomePage: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <AppBar position="static" sx={{ bgcolor: '#C8102E', boxShadow: 'none', height: 50 }}>
        <Toolbar variant="dense" sx={{ minHeight: 50, justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', width: '100%', maxWidth: 1200, mx: 'auto', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex' }}>
              <Button color="inherit" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>STUDENTS</Button>
              <Button color="inherit" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>NEW STUDENTS</Button>
              <Button color="inherit" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>FACULTY & STAFF</Button>
              <Button color="inherit" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>PARENTS & FAMILIES</Button>
              <Button color="inherit" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>ALUMNI</Button>
            </Box>
            <Box>
              <Button variant="outlined" color="inherit" sx={{ 
                fontSize: '0.75rem', 
                border: '1px solid white',
                mx: 0.5,
                height: 36,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white'
                }
              }}>
                VISIT
              </Button>
              <Button variant="outlined" color="inherit" sx={{ 
                fontSize: '0.75rem', 
                border: '1px solid white',
                mx: 0.5,
                height: 36,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white'
                }
              }}>
                GIVE
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Navigation */}
      <Box sx={{ bgcolor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            py: 2
          }}>
            {/* Clark University Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src="https://www.clarku.edu/wp-content/themes/clarku/assets/img/main-logo.svg" 
                alt="Clark University Logo" 
                style={{ 
                  height: '40px', 
                  marginRight: '16px'
                }}
              />
            </Box>
            
            {/* Main Navigation Links */}
            <Box sx={{ display: 'flex', gap: 5 }}>
              <Link 
                href="#" 
                underline="none" 
                sx={{ 
                  color: '#333', 
                  pb: 1, 
                  borderBottom: '3px solid transparent',
                  '&:hover': { 
                    borderBottom: `3px solid ${theme.palette.primary.main}`,
                    color: theme.palette.primary.main
                  } 
                }}
              >
                <Typography variant="h6" sx={{ 
                  fontFamily: '"Merriweather", serif',
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}>
                  Who We Are
                </Typography>
              </Link>
              <Link 
                href="#" 
                underline="none" 
                sx={{ 
                  color: '#333', 
                  pb: 1, 
                  borderBottom: '3px solid transparent',
                  '&:hover': { 
                    borderBottom: `3px solid ${theme.palette.primary.main}`,
                    color: theme.palette.primary.main
                  } 
                }}
              >
                <Typography variant="h6" sx={{ 
                  fontFamily: '"Merriweather", serif',
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}>
                  Admissions
                </Typography>
              </Link>
              <Link 
                href="#" 
                underline="none" 
                sx={{ 
                  color: '#333', 
                  pb: 1, 
                  borderBottom: '3px solid transparent',
                  '&:hover': { 
                    borderBottom: `3px solid ${theme.palette.primary.main}`,
                    color: theme.palette.primary.main
                  } 
                }}
              >
                <Typography variant="h6" sx={{ 
                  fontFamily: '"Merriweather", serif',
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}>
                  Academics
                </Typography>
              </Link>
              <Link 
                href="#" 
                underline="none" 
                sx={{ 
                  color: '#333', 
                  pb: 1, 
                  borderBottom: '3px solid transparent',
                  '&:hover': { 
                    borderBottom: `3px solid ${theme.palette.primary.main}`,
                    color: theme.palette.primary.main
                  } 
                }}
              >
                <Typography variant="h6" sx={{ 
                  fontFamily: '"Merriweather", serif',
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}>
                  Life at Clark
                </Typography>
              </Link>
            </Box>

            <Box>
              <Button 
                variant="text" 
                sx={{ minWidth: 40, color: '#555' }}
                aria-label="search"
              >
                <SearchIcon />
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative',
          height: 400,
          display: 'flex',
          alignItems: 'flex-end',
          bgcolor: '#f0f0f0',
          overflow: 'hidden'
        }}
      >
        {/* Base Background - Dark Overlay */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            zIndex: 1
          }}
        />
        
        {/* Campus Image */}
        <img 
          src="https://www.clarku.edu/wp-content/uploads/2023/01/clark-campus-1600x600-1.jpg"
          alt="Clark University Campus"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0
          }}
        />
        
        {/* Clark Hall Image */}
        <img 
          src="https://cdn.clarku.edu/wp-content/uploads/sites/2/2021/04/2019-Jonas-Clark-Hall-25-Apr-017.jpg"
          alt="Jonas Clark Hall"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.8,
            mixBlendMode: 'normal',
            zIndex: 2,
            filter: 'brightness(0.6)'
          }}
        />
        <Container maxWidth="lg" sx={{ mb: 8, position: 'relative', zIndex: 3 }}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                color: 'white', 
                fontFamily: '"Merriweather", serif',
                fontWeight: 700,
                mb: 2
              }}
            >
              We are a force for change
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white',
                fontWeight: 400,
                lineHeight: 1.5
              }}
            >
              Clark University cultivates dynamic, hands-on educational experiences so together, 
              we can connect extraordinary ideas and create far-reaching impact.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6, mt: 4 }}>
        <Box sx={{ my: 4 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontFamily: '"Merriweather", serif',
              fontWeight: 700,
              color: '#333'
            }}
          >
            Welcome to Clark University
          </Typography>
          <Typography 
            variant="h5" 
            component="h3" 
            gutterBottom 
            sx={{ 
              fontFamily: '"Merriweather", serif',
              color: '#555',
              fontWeight: 400,
              mb: 4
            }}
          >
            Challenging convention. Changing our world.
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              Clark University is a private research university in Worcester, Massachusetts. Founded in 1887, it is the oldest educational institution founded as an all-graduate university in the United States. Clark now also educates undergraduates.
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              The university's academic programs are organized into numerous schools and departments, with a strong focus on liberal arts, sciences, and professional studies. Clark is noted for its programs in the fields of psychology, geography, physics, biology, and entrepreneurship.
            </Typography>
            <Typography 
              variant="body1" 
              paragraph 
              sx={{ 
                fontSize: '1.1rem', 
                lineHeight: 1.6, 
                bgcolor: '#f9f9f9', 
                p: 2, 
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                mt: 3
              }}
            >
              <strong>Need assistance?</strong> Try our new AI Chatbox by clicking the chat icon in the bottom right corner!
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ bgcolor: '#f5f5f5', p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: '"Merriweather", serif' }}>
                Quick Links
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Link href="#" underline="hover" color="inherit">Apply Now</Link>
                <Link href="#" underline="hover" color="inherit">Request Information</Link>
                <Link href="#" underline="hover" color="inherit">Visit Campus</Link>
                <Link href="#" underline="hover" color="inherit">Academic Calendar</Link>
                <Link href="#" underline="hover" color="inherit">Tuition & Financial Aid</Link>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ my: 8 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontFamily: '"Merriweather", serif',
              fontWeight: 600,
              mb: 4,
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: 0,
                width: 80,
                height: 4,
                bgcolor: theme.palette.primary.main
              }
            }}
          >
            Featured Resources
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontFamily: '"Merriweather", serif',
                    fontWeight: 600,
                    color: theme.palette.primary.main
                  }}
                >
                  Academic Programs
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '0.95rem' }}>
                  Explore our undergraduate, graduate, and doctoral programs across various disciplines.
                </Typography>
                <Link 
                  href="#" 
                  underline="none" 
                  sx={{ 
                    display: 'inline-block',
                    fontWeight: 500,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Learn More →
                </Link>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontFamily: '"Merriweather", serif',
                    fontWeight: 600,
                    color: theme.palette.primary.main
                  }}
                >
                  Campus Life
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '0.95rem' }}>
                  Discover student organizations, housing options, dining, and recreational activities.
                </Typography>
                <Link 
                  href="#" 
                  underline="none" 
                  sx={{ 
                    display: 'inline-block',
                    fontWeight: 500,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Learn More →
                </Link>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontFamily: '"Merriweather", serif',
                    fontWeight: 600,
                    color: theme.palette.primary.main
                  }}
                >
                  Research Opportunities
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '0.95rem' }}>
                  Learn about our research centers, faculty-led projects, and opportunities for students.
                </Typography>
                <Link 
                  href="#" 
                  underline="none" 
                  sx={{ 
                    display: 'inline-block',
                    fontWeight: 500,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Learn More →
                </Link>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#C8102E', color: 'white', py: 4, mt: 'auto' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontFamily: '"Merriweather", serif',
                  fontWeight: 600
                }}
              >
                Clark University
              </Typography>
              <Typography variant="body2">
                950 Main Street<br />
                Worcester, MA 01610<br />
                Phone: (508) 793-7711
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontFamily: '"Merriweather", serif',
                  fontWeight: 600
                }}
              >
                Connect With Us
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexDirection: 'column' }}>
                <Link href="#" underline="hover" color="inherit">
                  <Typography variant="body2">Facebook</Typography>
                </Link>
                <Link href="#" underline="hover" color="inherit">
                  <Typography variant="body2">Twitter</Typography>
                </Link>
                <Link href="#" underline="hover" color="inherit">
                  <Typography variant="body2">Instagram</Typography>
                </Link>
                <Link href="#" underline="hover" color="inherit">
                  <Typography variant="body2">LinkedIn</Typography>
                </Link>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontFamily: '"Merriweather", serif',
                  fontWeight: 600
                }}
              >
                Resources
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexDirection: 'column' }}>
                <Link href="#" underline="hover" color="inherit">
                  <Typography variant="body2">Employment</Typography>
                </Link>
                <Link href="#" underline="hover" color="inherit">
                  <Typography variant="body2">Accessibility</Typography>
                </Link>
                <Link href="#" underline="hover" color="inherit">
                  <Typography variant="body2">Privacy Policy</Typography>
                </Link>
                <Link href="#" underline="hover" color="inherit">
                  <Typography variant="body2">Emergency Information</Typography>
                </Link>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Typography variant="body2" align="center">
              © {new Date().getFullYear()} Clark University. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Chat Widget */}
      <ChatWidget />
    </Box>
  );
};

export default HomePage;
