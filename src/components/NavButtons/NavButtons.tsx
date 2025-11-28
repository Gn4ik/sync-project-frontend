import { useEffect, useRef, useState } from "react";
import Popup from "../Popup/Popup";
import releasesActiveIcon from '@icons/releases-active.svg';
import releasesInactiveIcon from '@icons/releases-inactive.svg';
import colleagueActiveIcon from '@icons/colleague-active.svg';
import colleagueInactiveIcon from '@icons/colleague-inactive.svg';
import plusIcon from '@icons/plus.svg';
import filtersIcon from '@icons/filters.svg';
import './NavButtons.css';
import Modal from "../Modal/Modal";
import UserModal from "../UserModal/UserModal";
import { Colleague, ProjectItem } from "@components/types";

interface NavButtonsProps {
  activeList: 'tasks' | 'colleagues';
  onListChange: (list: 'tasks' | 'colleagues') => void;
  onFilterChange: (filter: string) => void;
  currentFilter: string;
  userRole: 'executor' | 'manager' | 'admin' | null;
  projects: ProjectItem[];
  colleagues: Colleague[];
}

const managerStatusFilters = [
  { key: 'all', label: 'Все задачи' },
  { key: 'to-execution', label: 'К выполнению' },
  { key: 'on-work', label: 'В работе' },
  { key: 'on-review', label: 'На проверке' },
  { key: 'completed', label: 'Завершены' },
  { key: 'stopped', label: 'Отложены' },
  { key: 'closed', label: 'Отменены' },
];

const NavButtons = ({ userRole, activeList, onListChange, onFilterChange, currentFilter, projects, colleagues }: NavButtonsProps) => {
  const [popup1Open, setIsPopup1Open] = useState(false);
  const [popup2Open, setIsPopup2Open] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonAddRef = useRef<HTMLButtonElement>(null);
  const buttonFilterRef = useRef<HTMLButtonElement>(null);
  const [activeModal, setActiveModal] = useState<'release' | 'project' | 'task' | 'meeting' | 'executor' | 'office' | null>(null);

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

  const handleMeetingClick = () => {
    setActiveModal('meeting');
    closePopup();
  };

  const handleUserClick = () => {
    setActiveModal('executor');
    closePopup();
  };

  const handleOfficeClick = () => {
    setActiveModal('office');
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
  };

  const switchFilters = () => {
    setIsPopup2Open(true);
  };

  const closePopup = () => {
    setIsPopup1Open(false);
    setIsPopup2Open(false);
  };

  const handleMyTasksClick = () => {
    onFilterChange('my');
    closePopup();
  };

  const handleAllTasksClick = () => {
    onFilterChange('all');
    closePopup();
  };

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

  const showAddButton = userRole === 'manager' || userRole === 'admin';
  const showFilterButton = userRole === 'executor' || userRole === 'manager';
  const showListButtons = userRole !== 'admin';

  return (
    <>
      <div className='task-list-buttons'>
        {showListButtons && (
          <div className='list-buttons'>
            <button
              className={`list-button ${activeList === 'tasks' ? 'active-active' : ''}`}
              onClick={() => onListChange('tasks')}
            >
              <img
                src={activeList === 'tasks' ? releasesActiveIcon : releasesInactiveIcon}
                alt="Задачи"
              />
            </button>
            <button
              className={`list-button ${activeList === 'colleagues' ? 'active' : ''}`}
              onClick={() => onListChange('colleagues')}
            >
              <img
                src={activeList === 'colleagues' ? colleagueActiveIcon : colleagueInactiveIcon}
                alt="Сотрудники"
              />
            </button>
          </div>
        )}

        {userRole === 'admin' && (
          <div className='list-buttons'>
            <div className='popup-wrapper'>
              <button className='list-button' onClick={addTask} ref={buttonAddRef}>
                <img src={plusIcon} alt="Добавить" />
              </button>
              <Popup
                isOpen={popup1Open}
                onClose={closePopup}
                position='left'
                triggerRef={buttonAddRef}
              >
                <div className='popup-content'>
                  <div className="popup-list">
                    <div className="popup-item" onClick={handleOfficeClick}>Офис</div>
                    <div className="popup-item" onClick={handleUserClick}>Пользователь</div>
                  </div>
                </div>
              </Popup>
            </div>
          </div>
        )}

        {userRole !== 'admin' && activeList === 'tasks' && (
          <div className='list-buttons'>
            {showAddButton && (
              <div className='popup-wrapper'>
                <button className='list-button' onClick={addTask} ref={buttonAddRef}>
                  <img src={plusIcon} alt="Добавить" />
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
                      <div className="popup-item" onClick={handleMeetingClick}>Встреча</div>
                    </div>
                  </div>
                </Popup>
              </div>
            )}

            {showFilterButton && (
              <div className='popup-wrapper'>
                <button className='list-button' onClick={switchFilters} ref={buttonFilterRef}>
                  <img src={filtersIcon} alt="Фильтры" />
                </button>

                <Popup
                  isOpen={popup2Open}
                  onClose={closePopup}
                  position='left'
                  triggerRef={buttonFilterRef}
                >
                  <div className='popup-content'>
                    <div className='popup-list'>
                      {userRole === 'executor' && (
                        <>
                          <div
                            className={`popup-item ${currentFilter === 'my' ? 'active' : ''}`}
                            onClick={handleMyTasksClick}
                          >
                            Мои задачи
                          </div>
                          <div
                            className={`popup-item ${currentFilter === 'all' ? 'active' : ''}`}
                            onClick={handleAllTasksClick}
                          >
                            Все задачи
                          </div>
                        </>
                      )}

                      {userRole === 'manager' && (
                        <>
                          {managerStatusFilters.map(status => (
                            <div
                              key={status.key}
                              className={`popup-item ${currentFilter === status.key ? 'active' : ''}`}
                              onClick={() => {
                                onFilterChange(status.key);
                                closePopup();
                              }}
                            >
                              {status.label}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </Popup>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={activeModal === 'task'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        type="task"
        projects={projects}
        colleagues={colleagues}
      />

      <Modal
        isOpen={activeModal === 'project'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        type="project"
        projects={projects}
        colleagues={colleagues}
      />

      <Modal
        isOpen={activeModal === 'release'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        type="release"
        projects={projects}
        colleagues={colleagues}
      />

      <Modal
        isOpen={activeModal === 'meeting'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        type="meeting"
        projects={projects}
        colleagues={colleagues}
      />

      <UserModal
        isOpen={activeModal === 'executor'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />

      <Modal
        isOpen={activeModal === 'office'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        type='office'
        projects={projects}
        colleagues={colleagues}
      />
    </>
  );
}

export default NavButtons;