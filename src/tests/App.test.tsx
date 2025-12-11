jest.mock('@icons/Vector.svg', () => 'test-svg');
jest.mock('@icons/LinkIcon.svg', () => 'test-svg');
jest.mock('@icons/notificationIconActive.svg', () => 'test-svg');
jest.mock('@icons/logout.svg', () => 'test-svg');
jest.mock('@icons/releases-active.svg', () => 'test-svg');
jest.mock('@icons/releases-inactive.svg', () => 'test-svg');
jest.mock('@icons/colleague-active.svg', () => 'test-svg');
jest.mock('@icons/colleague-inactive.svg', () => 'test-svg');
jest.mock('@icons/plus.svg', () => 'test-svg');
jest.mock('@icons/filters.svg', () => 'test-svg');
jest.mock('@icons/SearchIcon.svg', () => 'test-svg');

import { mockAuthAPI } from './mocks/apiMocks';

jest.mock('@utils/api', () => ({
  authAPI: mockAuthAPI,
}));

import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@components/app/App';

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Authentication flow', () => {
    test('should show preloader while checking auth', async () => {
      localStorage.setItem('auth_token', 'test-token-123');
      jest.useFakeTimers();

      mockAuthAPI.checkToken.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ status: 200 }), 100))
      );

      render(<App />);
      expect(screen.getByTestId('preloader')).toBeInTheDocument();

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('preloader')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    test('should redirect to login when not authenticated', async () => {
      mockAuthAPI.checkToken.mockResolvedValue({ status: 401 });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Вход в аккаунт')).toBeInTheDocument();
      });
    });

    test('should show main page when authenticated', async () => {
      localStorage.setItem('auth_token', 'test-token');
      mockAuthAPI.checkToken.mockResolvedValue({ status: 200 });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('sync')).toBeInTheDocument();
      });
    });
  });

  describe('Login functionality', () => {
    test('should navigate to main page after successful login', async () => {
      const mockToken = 'test-token-123';
      mockAuthAPI.checkToken.mockResolvedValue({ status: 401 });
      mockAuthAPI.login.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ access_token: mockToken }),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      });
    });

    test('should redirect to main page if trying to access login while authenticated', async () => {
      localStorage.setItem('auth_token', 'test-token');
      mockAuthAPI.checkToken.mockResolvedValue({ status: 200 });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('sync')).toBeInTheDocument();
      });
    });
  });
});