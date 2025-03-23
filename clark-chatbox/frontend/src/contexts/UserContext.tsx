import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define user types
export type UserType = 'student' | 'faculty' | 'other';

// User interface
export interface User {
  id: string;
  type: UserType;
  name?: string;
  sessionId?: string;
}

// Context interface
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setUserType: (type: UserType) => void;
  startNewSession: () => void;
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  setUserType: () => {},
  startNewSession: () => {},
});

// Hook to use the user context
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Generate a random user ID if needed
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  // Generate a session ID
  const generateSessionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Set user type (student, faculty, other)
  const setUserType = (type: UserType) => {
    if (!user) {
      // Create a new user if none exists
      setUser({
        id: generateId(),
        type,
        sessionId: generateSessionId(),
      });
    } else {
      // Update existing user type
      setUser({
        ...user,
        type,
        sessionId: user.sessionId || generateSessionId(),
      });
    }
  };

  // Start a new chat session
  const startNewSession = () => {
    if (user) {
      setUser({
        ...user,
        sessionId: generateSessionId(),
      });
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        setUser, 
        isAuthenticated, 
        setUserType, 
        startNewSession 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
