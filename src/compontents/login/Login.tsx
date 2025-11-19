import React from "react";
import '@styles/styles.css'
import './Login.css'
import SyncIcon from "../../icons/LoginIcon";

const Login = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return(
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
                    required
                    />
                </div>

                <div className="form-group">
                    <input
                    type="password"
                    id="password"
                    className="form-input"
                    placeholder="Пароль"
                    required
                    />
                </div>

                <button type="submit" className="login-button">
                    Войти
                </button>
                </form>
            </div>
        </div>
        </div>
    );
}

export default Login;