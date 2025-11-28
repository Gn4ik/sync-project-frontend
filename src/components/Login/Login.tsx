import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginUI from '@ui/Login';

const URL = process.env.HOST;

interface LoginProps {
  onLoginSuccess?: () => void;
}

interface LoginResponse {
  access_token: string;
}

const Login = ({ onLoginSuccess }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${URL}/auth/login/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'ngrok-skip-browser-warning': '0'
      },
      body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error('Ошибка авторизации');
    }

    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await loginUser(email, password);

      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        onLoginSuccess?.();
        navigate('/');
      } else {
        setError('Неверный email или пароль');
      }
    } catch (error: any) {
      if (error.message && error.message.includes('401')) {
        setError('Неверный email или пароль');
      } else {
        setError(error.message || 'Ошибка сети. Попробуйте еще раз.');
      }
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <LoginUI
      email={email}
      password={password}
      isLoading={isLoading}
      error={error}
      onEmailChange={handleEmailChange}
      onPasswordChange={handlePasswordChange}
      onSubmit={handleSubmit}
    />
  );
};

export default Login;