import '@styles/styles.css'
import ringLogo from '@icons/Vector.svg'
import ringLogoActive from '@icons/notificationIconActive.svg';
import logout_logo from '@icons/logout.svg'
import { useEffect, useRef, useState } from 'react';
import Popup from '../Popup/Popup';
import './AppHeader.css'
import { useNavigate } from 'react-router-dom';
import { authAPI, notificationsAPI } from '@utils/api';
import { Notification } from '@components/types';

interface AppHeaderProps {
  userRole?: string | null;
  onCalendarClick?: () => void;
  isCalendarActive?: boolean;
  onNotificationClick?: (type: 'meeting' | 'task', id: number) => void;
}

const AppHeader = ({
  userRole = 'executor',
  onCalendarClick,
  isCalendarActive = false,
  onNotificationClick
}: AppHeaderProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getMyNotifications();
      if (response.ok) {
        const data = await response.json();
        const sortedNotifications = data.sort((a: Notification, b: Notification) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        setNotifications(sortedNotifications);

        const unread = data.filter((notification: Notification) => !notification.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await notificationsAPI.readNotifications(id);
      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id
              ? { ...notification, is_read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    const url = new URL(notification.link, window.location.origin);
    const path = url.pathname;
    const params = new URLSearchParams(url.search);

    if (path.includes('/meetings/get_by_id/')) {
      const meetingId = params.get('id');
      if (meetingId && onNotificationClick) {
        onNotificationClick('meeting', parseInt(meetingId));
      }
    } else if (path.includes('/tasks/get_by_id/')) {
      const taskId = params.get('id');
      if (taskId && onNotificationClick) {
        onNotificationClick('task', parseInt(taskId));
      }
    } else if (notification.link.startsWith('/')) {
      navigate(notification.link);
    } else {
      window.open(notification.link, '_blank');
    }

    closePopup();
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} мин. назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ч. назад`;
    } else if (diffDays === 1) {
      return 'Вчера';
    } else if (diffDays < 7) {
      return `${diffDays} дн. назад`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const toggleNotifications = async () => {
    const newState = !isPopupOpen;
    setIsPopupOpen(newState);
    setButtonActive(newState);

    if (newState) {
      await loadNotifications();
    }
  }

  const closePopup = () => {
    setIsPopupOpen(false);
    setButtonActive(false);
  }

  const logOut = async () => {

    localStorage.removeItem('auth_token');

    try {
      await authAPI.logout();
    } catch (error) {
      console.log(error);
    }
    navigate('/login');
    window.location.reload();
  }

  useEffect(() => {
    loadNotifications();
    const intervalId = setInterval(() => {
      if (!isPopupOpen) {
        loadNotifications();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [isPopupOpen]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        closePopup();
      }
    };

    if (isPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupOpen]);

  const showCalendarButton = userRole === 'manager' || userRole === 'executor';

  return (
    <div className="space-between">
      <span className='header-title gradient'>sync</span>
      <div className='header-buttons'>
        {showCalendarButton && (
          <button
            className='icon-button button'
            onClick={onCalendarClick}
            aria-label='Календарь'
          >
            {isCalendarActive ?
              <svg width="27" height="28" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.5674 -0.125C22.1195 -0.124865 22.5674 0.322769 22.5674 0.875V1.6709H25.5791C26.1314 1.6709 26.5791 2.11858 26.5791 2.6709V27.125C26.5791 27.6773 26.1314 28.125 25.5791 28.125H1.125C0.572751 28.125 0.125 27.6773 0.125 27.125V2.6709C0.125 2.11858 0.572751 1.6709 1.125 1.6709H4.13672V0.875C4.13672 0.322793 4.58462 -0.124827 5.13672 -0.125C5.68897 -0.125 6.13672 0.322686 6.13672 0.875V1.6709H12.3525V0.875C12.3525 0.322686 12.8003 -0.125 13.3525 -0.125C13.9046 -0.124755 14.3525 0.322837 14.3525 0.875V1.6709H20.5674V0.875C20.5674 0.322686 21.0151 -0.125 21.5674 -0.125ZM2.125 26.125H24.5791V10.7354H2.125V26.125ZM2.125 8.73535H24.5791V3.6709H22.5674V4.4668C22.5673 5.01899 22.1195 5.46666 21.5674 5.4668C21.0152 5.4668 20.5674 5.01907 20.5674 4.4668V3.6709H14.3525V4.4668C14.3525 5.01892 13.9046 5.46655 13.3525 5.4668C12.8003 5.4668 12.3526 5.01907 12.3525 4.4668V3.6709H6.13672V4.4668C6.13667 5.01907 5.68894 5.4668 5.13672 5.4668C4.58465 5.46662 4.13677 5.01896 4.13672 4.4668V3.6709H2.125V8.73535Z" fill="#0B57D0" stroke="#0B57D0" stroke-width="0.25" />
              </svg>
              :
              <svg width="27" height="28" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.5674 -0.125C22.1195 -0.124865 22.5674 0.322769 22.5674 0.875V1.6709H25.5791C26.1314 1.6709 26.5791 2.11858 26.5791 2.6709V27.125C26.5791 27.6773 26.1314 28.125 25.5791 28.125H1.125C0.572751 28.125 0.125 27.6773 0.125 27.125V2.6709C0.125 2.11858 0.572751 1.6709 1.125 1.6709H4.13672V0.875C4.13672 0.322793 4.58462 -0.124827 5.13672 -0.125C5.68897 -0.125 6.13672 0.322686 6.13672 0.875V1.6709H12.3525V0.875C12.3525 0.322686 12.8003 -0.125 13.3525 -0.125C13.9046 -0.124755 14.3525 0.322837 14.3525 0.875V1.6709H20.5674V0.875C20.5674 0.322686 21.0151 -0.125 21.5674 -0.125ZM2.125 26.125H24.5791V10.7354H2.125V26.125ZM2.125 8.73535H24.5791V3.6709H22.5674V4.4668C22.5673 5.01899 22.1195 5.46666 21.5674 5.4668C21.0152 5.4668 20.5674 5.01907 20.5674 4.4668V3.6709H14.3525V4.4668C14.3525 5.01892 13.9046 5.46655 13.3525 5.4668C12.8003 5.4668 12.3526 5.01907 12.3525 4.4668V3.6709H6.13672V4.4668C6.13667 5.01907 5.68894 5.4668 5.13672 5.4668C4.58465 5.46662 4.13677 5.01896 4.13672 4.4668V3.6709H2.125V8.73535Z" fill="#2D2D2D" stroke="#2D2D2D" stroke-width="0.25" />
              </svg>
            }
          </button>
        )}

        <div className="notifications-wrapper">
          <button ref={buttonRef} className='icon-button button' onClick={toggleNotifications} aria-label='Уведомления'>
            <img src={buttonActive ? ringLogoActive : ringLogo} />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <Popup
            isOpen={isPopupOpen}
            onClose={closePopup}
            triggerRef={buttonRef}
            position="right"
          >
            <div className="popup-content-header">
              <h3>Уведомления</h3>
              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.is_read ? 'notification-unread' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-header">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-time">
                          {formatNotificationDate(notification.created_at)}
                        </div>
                      </div>
                      <div className="notification-description">
                        {notification.description}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="notification-empty">
                    У вас нет уведомлений
                  </div>
                )}
              </div>
            </div>
          </Popup>
        </div>

        <button className='icon-button button' onClick={logOut} aria-label='Выйти'>
          <img src={logout_logo} />
        </button>
      </div>
    </div>
  );
}

export default AppHeader;