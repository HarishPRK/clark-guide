import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Pages
import HomePage from './pages/HomePage';
import Welcome from './pages/Welcome';
import Chat from './pages/Chat';

// Contexts
import { UserProvider } from './contexts/UserContext';

// Theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#C8102E', // Clark University Red
    },
    secondary: {
      main: '#000000', // Black
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Source Sans Pro',
      // 'Roboto',
      // '"Helvetica Neue"',
      // 'Arial',
      // 'sans-serif',
    ].join(','),
    h1: {
      fontFamily: '"Source Sans Pro", "Times New Roman", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Source Sans Pro", "Times New Roman", serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Source Sans Pro", "Times New Roman", serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Source Sans Pro", "Times New Roman", serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Source Sans Pro", "Times New Roman", serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Source Sans Pro", "Times New Roman", serif',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
          }}
        >
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/chat" element={<Chat />} />
            </Routes>
          </Router>
        </Box>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
