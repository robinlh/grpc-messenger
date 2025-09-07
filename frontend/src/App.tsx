import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/auth/LoginForm';
import { ChatPage } from './components/messaging/ChatPage';

function App() {
  const { isAuthenticated, initializeAuth } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/chat" replace /> : 
                <LoginForm onSuccess={() => window.location.href = '/chat'} />
            } 
          />
          <Route 
            path="/chat" 
            element={
              isAuthenticated ? 
                <ChatPage /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route path="/" element={<Navigate to="/chat" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
