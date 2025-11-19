import { useEffect, useRef, useState } from "react";
import Popup from "../Popup/Popup";
import releasesActiveIcon from '../../icons/releases-active.svg';
import releasesInactiveIcon from '../../icons/releases-inactive.svg';
import colleagueActiveIcon from '../../icons/colleague-active.svg';
import colleagueInactiveIcon from '../../icons/colleague-inactive.svg';
import plusIcon from '../../icons/plus.svg';
import filtersIcon from '../../icons/filters.svg';
import './NavButtons.css';
import Modal from "../Modal/Modal";

interface NavButtonsProps {
  activeList: 'tasks' | 'colleagues';
  onListChange: (list: 'tasks' | 'colleagues') => void;
}

const NavButtons = ({ activeList, onListChange }: NavButtonsProps) => {
  const [popup1Open, setIsPopup1Open] = useState(false);
  const [popup2Open, setIsPopup2Open] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonAddRef = useRef<HTMLButtonElement>(null);
  const buttonFilterRef = useRef<HTMLButtonElement>(null);
  const [activeModal, setActiveModal] = useState<'release' | 'project' | 'task' | null>(null);

  const handleReleaseClick = () => {
    setActiveModal('release');
    closePopup();
  };

  const handleProjectClick = () => {
    setActiveModal('project');
    closePopup();
  };

  const handleTaskClick = () => {
    setActiveModal('task');
    closePopup();
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  const handleModalSubmit = (formData: any) => {
    console.log('Создан:', activeModal, formData);
    setActiveModal(null);
  };

  const addTask = () => {
    setIsPopup1Open(true);
  }

  const switchFilters = () => {
    setIsPopup2Open(true);
  }

  const closePopup = () => {
    setIsPopup1Open(false);
    setIsPopup2Open(false);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) &&
        (buttonAddRef.current && !buttonAddRef.current.contains(event.target as Node) ||
          buttonFilterRef.current && !buttonFilterRef.current.contains(event.target as Node))) {
        closePopup();
      }
    };

    if (popup1Open || popup2Open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popup1Open, popup2Open]);

  return (
    <>

      <div className='task-list-buttons'>
        <div className='list-buttons'>
          <button
            className={`list-button ${activeList === 'tasks' ? 'active-active' : ''}`}
            onClick={() => onListChange('tasks')}
          >
            <img src={activeList === 'tasks' ? releasesActiveIcon : releasesInactiveIcon} />
          </button>
          <button
            className={`list-button ${activeList === 'colleagues' ? 'active' : ''}`}
            onClick={() => onListChange('colleagues')}
          >
            <img src={activeList === 'colleagues' ? colleagueActiveIcon : colleagueInactiveIcon} />
          </button>
        </div>
        <div className='list-buttons'>
          {activeList === 'tasks' &&
            (
              <div className='popup-wrapper'>
                <button className='list-button' onClick={addTask} ref={buttonAddRef}>
                  <img src={plusIcon} />
                </button>
                <Popup
                  isOpen={popup1Open}
                  onClose={closePopup}
                  position='right'
                  triggerRef={buttonAddRef}
                >
                  <div className='popup-content'>
                    <div className="popup-list">
                      <div className="popup-item" onClick={handleReleaseClick}>Релиз</div>
                      <div className="popup-item" onClick={handleProjectClick}>Проект</div>
                      <div className="popup-item" onClick={handleTaskClick}>Задача</div>
                    </div>
                  </div>
                </Popup>
              </div>
            )
          }
          <div className='popup-wrapper'>
            <button className='list-button' onClick={switchFilters} ref={buttonFilterRef}>
              <img src={filtersIcon} />
            </button>
            <Popup
              isOpen={popup2Open}
              onClose={closePopup}
              position='left'
              triggerRef={buttonFilterRef}
            >
              <div className='popup-content'>
                <div className="popup-list">
                  <div className="popup-item">Мои задачи</div>
                  <div className="popup-item">Все задачи</div>
                </div>
              </div>
            </Popup>
          </div>
        </div>
      </div>

      <Modal
        isOpen={activeModal === 'task'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        type="task"
      />

      <Modal
        isOpen={activeModal === 'project'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        type="project"
      />

      <Modal
        isOpen={activeModal === 'release'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        type="release"
      />
    </>
  );
}

export default NavButtons;