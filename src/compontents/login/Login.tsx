import React, { useState } from "react";
import '@styles/styles.css'
import './Login.css'
import SyncIcon from "../../icons/LoginIcon";
import { useNavigate } from "react-router-dom";

const URL = process.env.HOST;

const Login = ({ onLoginSuccess }: { onLoginSuccess?: () => void }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await LoginUser(email, password);

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

    const LoginUser = async (email: string, password: string) => {
        const response = await fetch(`${URL}/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': '0'
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error('Ошибка авторизации');
        }

        return data;
    };

    return (
        <div className="background">
            <div className="login-container">
                <div className="login-header">
                    <div className="sync-text">
                        <span className="sync-bold gradient">sync</span>
                        <span className="sync-regular">Организуй задачи.</span>
                        <span className="sync-regular">Работай синхронно.</span>
                        <SyncIcon />
                    </div>
                </div>

                <div className="login-form-container">
                    <h2 className="login-title">Вход в аккаунт</h2>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="password"
                                id="password"
                                className="form-input"
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;