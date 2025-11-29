import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Login from "../Login/Login";
import MainPage from '../MainPage/MainPage';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';
import Preloader from '@components/Preloader';
import { authAPI } from '@utils/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem('auth_token')
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      const response = await authAPI.checkToken();
      
      setIsAuthenticated(response.status === 200);
    } catch (error) {
      console.error('Token check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <Preloader />
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ?
              <Navigate to='/' replace /> :
              <Login onLoginSuccess={handleLoginSuccess} />
          }
        />
        <Route
          path='/'
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MainPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;