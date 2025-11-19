import '@styles/styles.css'
import ringLogo from '../../icons/Vector.svg'
import ringLogoActive from '../../icons/notificationIconActive.svg';
import logout_logo from '../../icons/logout.svg'
import { useEffect, useRef, useState } from 'react';
import Popup from '../Popup/Popup';
import './AppHeader.css'

const AppHeader = () => {

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleNotifications = () => {
    const newState = !isPopupOpen;
    setIsPopupOpen(newState);
    setButtonActive(newState);
  }

  const closePopup = () => {
    setIsPopupOpen(false);
    setButtonActive(false);
  }

  const logOut = () => {
  }

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

  return (
    <div className="space-between">
      <span className='header-title gradient'>sync</span>
      <div className='header-buttons'>
        <div className="notifications-wrapper">
          <button ref={buttonRef} className='icon-button button' onClick={toggleNotifications} aria-label='Уведомления'>
            <img src={buttonActive ? ringLogoActive : ringLogo} />
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
                <div className="notification-item">Новое уведомление 1</div>
                <div className="notification-item">Новое уведомление 2</div>
                <div className="notification-item">Новое уведомление 3</div>
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