import { useEffect, useRef, useState } from "react";
import Popup from "../Popup/Popup";
import releasesActiveIcon from '@icons/releases-active.svg';
import releasesInactiveIcon from '@icons/releases-inactive.svg';
import employeeActiveIcon from '@icons/colleague-active.svg';
import employeeInactiveIcon from '@icons/colleague-inactive.svg';
import plusIcon from '@icons/plus.svg';
import filtersIcon from '@icons/filters.svg';
import './NavButtons.css';
import UserModal from "../UserModal/UserModal";
import { Employee, ProjectItem } from "@components/types";
import { TaskModal } from "@components/TaskModal/TaskModal";
import { ProjectModal } from "@components/ProjectModal/ProjectModal";
import { OfficeModal } from "@components/OfficeModal/OfficeModal";
import { MeetingModal } from "@components/MeetingModal/MeetingModal";
import { ReleaseModal } from "@components/ReleaseModal/ReleaseModal";
import { tasksAPI } from "@utils/api";

interface NavButtonsProps {
  activeList: 'tasks' | 'employees';
  onListChange: (list: 'tasks' | 'employees') => void;
  onFilterChange: (filter: string) => void;
  onTaskCreated?: () => void;
  currentFilter: string;
  userRole: 'executor' | 'manager' | 'admin' | null;
  projects: ProjectItem[];
  employees: Employee[];
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

const NavButtons = ({
  userRole,
  activeList,
  onListChange,
  onFilterChange,
  onTaskCreated,
  currentFilter,
  projects,
  employees
}: NavButtonsProps) => {
  const [popupAddOpen, setIsPopupAddOpen] = useState(false);
  const [popupFiltersOpen, setIsPopupFiltersOpen] = useState(false);
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

  const handleModalSubmit = async (formData: any) => {
    console.log(formData);
    try {
      const response = await tasksAPI.createTask(formData);
      if (response.ok) {
        console.log()
      } else {
        console.error('Ошибка при создании задачи');
        console.log(response.json());
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    }
    onTaskCreated?.()
    setActiveModal(null);
  };

  const addTask = () => {
    setIsPopupAddOpen(true);
  };

  const switchFilters = () => {
    setIsPopupFiltersOpen(true);
  };

  const closePopup = () => {
    setIsPopupAddOpen(false);
    setIsPopupFiltersOpen(false);
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

    if (popupAddOpen || popupFiltersOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popupAddOpen, popupFiltersOpen]);

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
              className={`list-button ${activeList === 'employees' ? 'active' : ''}`}
              onClick={() => onListChange('employees')}
            >
              <img
                src={activeList === 'employees' ? employeeActiveIcon : employeeInactiveIcon}
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
                isOpen={popupAddOpen}
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
                  isOpen={popupAddOpen}
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
                  isOpen={popupFiltersOpen}
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

      <TaskModal
        isOpen={activeModal === 'task'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        onDelete={() => { }}
        employees={employees}
        projects={projects}
      />

      <ProjectModal
        isOpen={activeModal === 'project'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />

      <ReleaseModal
        isOpen={activeModal === 'release'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />

      <MeetingModal
        isOpen={activeModal === 'meeting'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        employees={employees}
        projects={projects}
      />

      <UserModal
        isOpen={activeModal === 'executor'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />

      <OfficeModal
        isOpen={activeModal === 'office'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />
    </>
  );
}

export default NavButtons;