import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Login from '../components/Login/Login';
import { MemoryRouter } from 'react-router-dom';
import { authAPI } from '@utils/api';

jest.mock('@utils/api');

describe('Login Component', () => {
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockOnLoginSuccess.mockClear();
  });

  test('should render login form', () => {
    render(
      <MemoryRouter>
        <Login onLoginSuccess={mockOnLoginSuccess} />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
  });

  test('should show network error message', async () => {
    (authAPI.login as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <Login onLoginSuccess={mockOnLoginSuccess} />
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Пароль'), {
        target: { value: 'password123' }
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Войти' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  test('should save token and call onLoginSuccess', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ access_token: 'token-123' }),
    } as unknown as Response;

    (authAPI.login as jest.Mock).mockResolvedValue(mockResponse);

    render(
      <MemoryRouter>
        <Login onLoginSuccess={mockOnLoginSuccess} />
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Пароль'), {
        target: { value: 'password123' }
      });
      fireEvent.click(screen.getByRole('button', { name: 'Войти' }));
    });

    await waitFor(() => {
      expect(localStorage.getItem('auth_token')).toBe('token-123');
      expect(mockOnLoginSuccess).toHaveBeenCalled();
    });
  });

  test('should handle 401 error with correct message', async () => {
    (authAPI.login as jest.Mock).mockRejectedValue(new Error('Ошибка авторизации'));

    render(
      <MemoryRouter>
        <Login onLoginSuccess={mockOnLoginSuccess} />
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'wrong@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Пароль'), {
        target: { value: 'wrongpassword' }
      });
      fireEvent.click(screen.getByRole('button', { name: 'Войти' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Ошибка авторизации')).toBeInTheDocument();
    });
  });

  test('should show loading state during login', async () => {
    let resolvePromise: (value: any) => void;
    const loginPromise = new Promise<Response>((resolve) => {
      resolvePromise = resolve;
    });

    (authAPI.login as jest.Mock).mockReturnValue(loginPromise);

    render(
      <MemoryRouter>
        <Login onLoginSuccess={mockOnLoginSuccess} />
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Пароль'), {
        target: { value: 'password123' }
      });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Вход...');
      expect(button).toBeDisabled();
    });

    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ access_token: 'token-123' }),
    } as unknown as Response;

    await act(async () => {
      resolvePromise!(mockResponse);
    });

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Войти');
      expect(button).not.toBeDisabled();
    });
  });

  test('should handle other error statuses', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal server error' }),
    } as unknown as Response;

    (authAPI.login as jest.Mock).mockResolvedValue(mockResponse);

    render(
      <MemoryRouter>
        <Login onLoginSuccess={mockOnLoginSuccess} />
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Пароль'), {
        target: { value: 'password123' }
      });
      fireEvent.click(screen.getByRole('button', { name: 'Войти' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Ошибка авторизации')).toBeInTheDocument();
    });
  });
});