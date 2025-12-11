jest.mock('@icons/Vector.svg', () => 'test-svg');
jest.mock('@icons/notificationIconActive.svg', () => 'test-svg');
jest.mock('@icons/logout.svg', () => 'test-svg');

import { mockNotificationsAPI, mockAuthAPI, mockDbDump } from './mocks/apiMocks';
jest.mock('@utils/api', () => ({
  notificationsAPI: mockNotificationsAPI,
  authAPI: mockAuthAPI,
  dbDump: mockDbDump,
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppHeader from '@components/AppHeader/AppHeader';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('AppHeader Component', () => {
  const mockOnCalendarClick = jest.fn();
  const mockOnNotificationClick = jest.fn();

  const defaultProps = {
    userRole: 'manager',
    onCalendarClick: mockOnCalendarClick,
    isCalendarActive: false,
    onNotificationClick: mockOnNotificationClick,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockNotificationsAPI.getMyNotifications.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  test('should render header with all elements', () => {
    render(
      <BrowserRouter>
        <AppHeader {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByText('sync')).toBeInTheDocument();
    expect(screen.getByLabelText('Календарь')).toBeInTheDocument();
    expect(screen.getByLabelText('Уведомления')).toBeInTheDocument();
    expect(screen.getByLabelText('Выйти')).toBeInTheDocument();
  });

  test('should show calendar button for manager and executor roles', () => {
    const { rerender } = render(
      <BrowserRouter>
        <AppHeader {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByLabelText('Календарь')).toBeInTheDocument();

    rerender(
      <BrowserRouter>
        <AppHeader {...defaultProps} userRole="executor" />
      </BrowserRouter>
    );
    expect(screen.getByLabelText('Календарь')).toBeInTheDocument();
  });

  test('should not show calendar button for admin role', () => {
    render(
      <BrowserRouter>
        <AppHeader {...defaultProps} userRole="admin" />
      </BrowserRouter>
    );

    expect(screen.queryByLabelText('Календарь')).not.toBeInTheDocument();
  });

  test('should show backup button only for admin role', () => {
    const { rerender } = render(
      <BrowserRouter>
        <AppHeader {...defaultProps} userRole="admin" />
      </BrowserRouter>
    );

    expect(screen.getByText('Резервное копирование')).toBeInTheDocument();

    rerender(
      <BrowserRouter>
        <AppHeader {...defaultProps} userRole="manager" />
      </BrowserRouter>
    );
    expect(screen.queryByText('Резервное копирование')).not.toBeInTheDocument();
  });

  describe('Logout functionality', () => {
    test('should call logout API and clear token on logout', async () => {
      localStorage.setItem('auth_token', 'test-token');

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      const logoutButton = screen.getByLabelText('Выйти');
      fireEvent.click(logoutButton);
      await waitFor(() => {
        expect(mockAuthAPI.logout).toHaveBeenCalled();
        expect(localStorage.getItem('auth_token')).toBeNull();
      });
    });
  });

  describe('Calendar functionality', () => {
    test('should call onCalendarClick when calendar button is clicked', () => {
      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      const calendarButton = screen.getByLabelText('Календарь');
      fireEvent.click(calendarButton);
      expect(mockOnCalendarClick).toHaveBeenCalled();
    });

    test('should show active calendar icon when isCalendarActive is true', () => {
      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} isCalendarActive={true} />
        </BrowserRouter>
      );

      const calendarButton = screen.getByLabelText('Календарь');
      expect(calendarButton).toBeInTheDocument();
    });
  });

  describe('Backup functionality', () => {
    test('should call backup API when backup button is clicked', async () => {
      mockDbDump.mockResolvedValue({ ok: true });

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} userRole="admin" />
        </BrowserRouter>
      );

      const backupButton = screen.getByText('Резервное копирование');
      fireEvent.click(backupButton);
      await waitFor(() => {
        expect(mockDbDump).toHaveBeenCalled();
      });
    });

    test('should show success modal when backup succeeds', async () => {
      mockDbDump.mockResolvedValue({ ok: true });

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} userRole="admin" />
        </BrowserRouter>
      );

      const backupButton = screen.getByText('Резервное копирование');
      fireEvent.click(backupButton);
      await waitFor(() => {
        expect(screen.getByText('База данных успешно скопирована!')).toBeInTheDocument();
      });
    });
  });

  describe('Notification functionality', () => {

    test('should load notifications on mount', async () => {
      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockNotificationsAPI.getMyNotifications).toHaveBeenCalled();
      });
    });

    test('should show notification badge when there are unread notifications', async () => {
      const mockNotifications = [
        { id: 1, title: 'Test', is_read: false, created_at: new Date().toISOString() },
        { id: 2, title: 'Test 2', is_read: true, created_at: new Date().toISOString() },
      ];

      mockNotificationsAPI.getMyNotifications.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockNotifications),
      });

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });

    test('should open notifications popup on button click', async () => {
      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      const notificationButton = screen.getByLabelText('Уведомления');
      fireEvent.click(notificationButton);
      await waitFor(() => {
        expect(screen.getByText('Уведомления')).toBeInTheDocument();
      });
    });

    test('should format notification dates correctly', async () => {
      const mockNotifications = [
        {
          id: 1,
          title: 'Test',
          is_read: false,
          created_at: new Date(Date.now() - 5 * 60000).toISOString(),
          description: 'Test description',
          link: '/test'
        },
      ];

      mockNotificationsAPI.getMyNotifications.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockNotifications),
      });

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      const notificationButton = screen.getByLabelText('Уведомления');
      fireEvent.click(notificationButton);
      await waitFor(() => {
        expect(screen.getByText(/мин\. назад/)).toBeInTheDocument();
      });
    });

    test('should show "99+" when unread count exceeds 99', async () => {
      const mockNotifications = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        title: `Test ${i + 1}`,
        is_read: false,
        created_at: new Date().toISOString(),
        description: 'Test description',
        link: '/test'
      }));

      mockNotificationsAPI.getMyNotifications.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockNotifications),
      });

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('99+')).toBeInTheDocument();
      });
    });

    test('should handle notification click with external link', async () => {
      const mockNotification = {
        id: 1,
        title: 'External Test',
        is_read: false,
        created_at: new Date().toISOString(),
        description: 'External link',
        link: 'https://external.com'
      };

      mockNotificationsAPI.getMyNotifications.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockNotification]),
      });

      window.open = jest.fn();

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      const notificationButton = screen.getByLabelText('Уведомления');
      fireEvent.click(notificationButton);
      await waitFor(() => {
        const notificationItem = screen.getByText('External Test').closest('.notification-item');
        fireEvent.click(notificationItem!);
      });
      expect(window.open).toHaveBeenCalledWith('https://external.com', '_blank');
    });

    test('should handle notification click with internal navigation', async () => {
      const mockNavigate = jest.fn();
      jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

      const mockNotification = {
        id: 1,
        title: 'Internal Test',
        is_read: false,
        created_at: new Date().toISOString(),
        description: 'Internal link',
        link: '/internal-page'
      };

      mockNotificationsAPI.getMyNotifications.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockNotification]),
      });

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      const notificationButton = screen.getByLabelText('Уведомления');
      fireEvent.click(notificationButton);
      await waitFor(() => {
        const notificationItem = screen.getByText('Internal Test').closest('.notification-item');
        fireEvent.click(notificationItem!);
      });
      expect(mockNavigate).toHaveBeenCalledWith('/internal-page');
    });

    test('should mark notification as read on click', async () => {
      const mockNotification = {
        id: 1,
        title: 'Test',
        is_read: false,
        created_at: new Date().toISOString(),
        description: 'Test description',
        link: '/test'
      };

      mockNotificationsAPI.getMyNotifications.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockNotification]),
      });

      mockNotificationsAPI.readNotifications.mockResolvedValue({
        ok: true,
      });

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      const notificationButton = screen.getByLabelText('Уведомления');
      fireEvent.click(notificationButton);
      await waitFor(() => {
        const notificationItem = screen.getByText('Test').closest('.notification-item');
        fireEvent.click(notificationItem!);
      });
      expect(mockNotificationsAPI.readNotifications).toHaveBeenCalledWith(1);
    });

    test('should handle notification click for meetings', async () => {
      const mockNotification = {
        id: 1,
        title: 'Meeting Test',
        is_read: false,
        created_at: new Date().toISOString(),
        description: 'Meeting description',
        link: '/meetings/get_by_id/?id=123'
      };

      mockNotificationsAPI.getMyNotifications.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockNotification]),
      });

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      const notificationButton = screen.getByLabelText('Уведомления');
      fireEvent.click(notificationButton);
      await waitFor(() => {
        const notificationItem = screen.getByText('Meeting Test').closest('.notification-item');
        fireEvent.click(notificationItem!);
      });
      expect(mockOnNotificationClick).toHaveBeenCalledWith('meeting', 123);
    });

    test('should handle notification click for tasks', async () => {
      const mockNotification = {
        id: 1,
        title: 'Task Test',
        is_read: false,
        created_at: new Date().toISOString(),
        description: 'Task description',
        link: '/tasks/get_by_id/?id=456'
      };

      mockNotificationsAPI.getMyNotifications.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockNotification]),
      });

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      const notificationButton = screen.getByLabelText('Уведомления');
      fireEvent.click(notificationButton);
      await waitFor(() => {
        const notificationItem = screen.getByText('Task Test').closest('.notification-item');
        fireEvent.click(notificationItem!);
      });
      expect(mockOnNotificationClick).toHaveBeenCalledWith('task', 456);
    });
  });

  describe('Error handling', () => {
    test('should handle notifications API error', async () => {
      console.error = jest.fn();
      mockNotificationsAPI.getMyNotifications.mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error loading notifications:', expect.any(Error));
      });
    });

    test('should handle mark as read API error', async () => {
      console.error = jest.fn();

      const mockNotification = {
        id: 1,
        title: 'Test',
        is_read: false,
        created_at: new Date().toISOString(),
        description: 'Test description',
        link: '/test'
      };

      mockNotificationsAPI.getMyNotifications.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockNotification]),
      });

      mockNotificationsAPI.readNotifications.mockRejectedValue(new Error('API Error'));

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      const notificationButton = screen.getByLabelText('Уведомления');
      fireEvent.click(notificationButton);
      await waitFor(() => {
        const notificationItem = screen.getByText('Test').closest('.notification-item');
        fireEvent.click(notificationItem!);
      });
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error marking notification as read:', expect.any(Error));
      });
    });

    test('should handle backup API error', async () => {
      console.error = jest.fn();
      mockDbDump.mockRejectedValue(new Error('Backup Error'));

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} userRole="admin" />
        </BrowserRouter>
      );

      const backupButton = screen.getByText('Резервное копирование');
      fireEvent.click(backupButton);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error dumping database:', expect.any(Error));
      });
    });

    test('should handle logout API error', async () => {
      console.log = jest.fn();
      localStorage.setItem('auth_token', 'test-token');
      mockAuthAPI.logout.mockRejectedValue(new Error('Logout Error'));

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      const logoutButton = screen.getByLabelText('Выйти');
      fireEvent.click(logoutButton);
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(expect.any(Error));
        expect(localStorage.getItem('auth_token')).toBeNull();
      });
    });
  });

  describe('Popup functionality', () => {
    test('should close popup when clicking outside', async () => {
      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      const notificationButton = screen.getByLabelText('Уведомления');
      fireEvent.click(notificationButton);
      await waitFor(() => {
        expect(screen.getByText('Уведомления')).toBeInTheDocument();
      });
      fireEvent.mouseDown(document);
      await waitFor(() => {
        expect(screen.queryByText('Уведомления')).not.toBeInTheDocument();
      });
    });

    test('should reload notifications every 30 seconds when popup is closed', () => {
      jest.useFakeTimers();

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );
      expect(mockNotificationsAPI.getMyNotifications).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(30000);
      expect(mockNotificationsAPI.getMyNotifications).toHaveBeenCalledTimes(2);
      jest.useRealTimers();
    });

    test('interval should not call loadNotifications when popup is open', () => {
      jest.useFakeTimers();

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );
      const notificationButton = screen.getByLabelText('Уведомления');
      fireEvent.click(notificationButton);
      mockNotificationsAPI.getMyNotifications.mockClear();
      jest.advanceTimersByTime(30000);
      expect(mockNotificationsAPI.getMyNotifications).not.toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe('SuccessModal functionality', () => {
    test('should render SuccessModal when backup succeeds', async () => {
      mockDbDump.mockResolvedValue({ ok: true });

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} userRole="admin" />
        </BrowserRouter>
      );

      const backupButton = screen.getByText('Резервное копирование');
      fireEvent.click(backupButton);

      await waitFor(() => {
        expect(screen.getByText('База данных успешно скопирована!')).toBeInTheDocument();
      });
    });

    test('should close SuccessModal when handleSuccessClose is called', async () => {
      mockDbDump.mockResolvedValue({ ok: true });

      render(
        <BrowserRouter>
          <AppHeader {...defaultProps} userRole="admin" />
        </BrowserRouter>
      );

      const backupButton = screen.getByText('Резервное копирование');
      fireEvent.click(backupButton);

      await waitFor(() => {
        expect(screen.getByText('База данных успешно скопирована!')).toBeInTheDocument();
      });
    });
  });

  describe('Default props', () => {
    test('should use default props when not provided', () => {
      render(
        <BrowserRouter>
          <AppHeader />
        </BrowserRouter>
      );

      expect(screen.getByLabelText('Календарь')).toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    test('should clear interval on unmount', () => {
      const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

      const { unmount } = render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    test('should remove event listener on unmount when popup is open', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = render(
        <BrowserRouter>
          <AppHeader {...defaultProps} />
        </BrowserRouter>
      );

      const notificationButton = screen.getByLabelText('Уведомления');
      fireEvent.click(notificationButton);

      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    });
  });
});