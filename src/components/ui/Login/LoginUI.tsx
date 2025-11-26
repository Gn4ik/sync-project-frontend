import React from "react";
import '@styles/styles.css';
import './Login.css';
import SyncIcon from "../../../icons/LoginIcon";

interface LoginUIProps {
  email: string;
  password: string;
  isLoading: boolean;
  error: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LoginUI: React.FC<LoginUIProps> = ({
  email,
  password,
  isLoading,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit
}) => {
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

          <form className="login-form" onSubmit={onSubmit}>
            <div className="form-group">
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="Email"
                value={email}
                onChange={onEmailChange}
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
                onChange={onPasswordChange}
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
};

export default LoginUI;