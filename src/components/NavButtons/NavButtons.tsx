import { useEffect, useRef, useState } from "react";
import Popup from "../Popup/Popup";
import releasesActiveIcon from '@icons/releases-active.svg';
import releasesInactiveIcon from '@icons/releases-inactive.svg';
import employeeActiveIcon from '@icons/colleague-active.svg';
import employeeInactiveIcon from '@icons/colleague-inactive.svg';
import plusIcon from '@icons/plus.svg';
import filtersIcon from '@icons/filters.svg';
import './NavButtons.css';
import { Department, Employee, ProjectItem, ReleaseItem, Schedule } from "@components/types";
import { TaskModal } from "@components/TaskModal/TaskModal";
import { ProjectModal } from "@components/ProjectModal/ProjectModal";
import { OfficeModal } from "@components/OfficeModal/OfficeModal";
import { MeetingModal } from "@components/MeetingModal/MeetingModal";
import { ReleaseModal } from "@components/ReleaseModal/ReleaseModal";
import { departmentsAPI, employeesAPI, meetingsAPI, projectsAPI, releasesAPI, schedulesAPI, tasksAPI } from "@utils/api";
import { EmployeeModal } from "@components/EmployeeModal/EmployeeModal";

interface NavButtonsProps {
  activeList: 'tasks' | 'employees';
  onListChange: (list: 'tasks' | 'employees') => void;
  onFilterChange: (filter: string) => void;
  onTaskCreated?: (setUpdate: boolean) => void;
  onProjectCreated?: () => void;
  onMeetingCreated: () => void;
  onEmployeeCreated: () => void;
  onDepartmentCreated: () => void;
  currentFilter: string;
  userRole: string | null;
  projects: ProjectItem[];
  employees: Employee[];
  releases: ReleaseItem[];
  departments: Department[];
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
  onProjectCreated,
  onMeetingCreated,
  onEmployeeCreated,
  onDepartmentCreated,
  currentFilter,
  projects,
  employees,
  releases,
  departments
}: NavButtonsProps) => {
  const [popupAddOpen, setIsPopupAddOpen] = useState(false);
  const [popupFiltersOpen, setIsPopupFiltersOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonAddRef = useRef<HTMLButtonElement>(null);
  const buttonFilterRef = useRef<HTMLButtonElement>(null);
  const [activeModal, setActiveModal] = useState<'release' | 'project' | 'task' | 'meeting' | 'executor' | 'office' | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

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

  useEffect(() => {
    const loadDataForEmployeeModal = async () => {
      try {
        const [
          schedules
        ] = await Promise.allSettled([
          schedulesAPI.getSchedules()
        ]);

        setSchedules(schedules.status === 'fulfilled' ? schedules.value : []);

      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
    loadDataForEmployeeModal();
  }, [])

  const handleModalSubmit = async (formData: any, type: string) => {
    try {
      let response: Response;
      switch (type) {
        case 'task':
          response = await tasksAPI.createTask(formData);
          break;
        case 'release':
          response = await releasesAPI.createRelease(formData);
          break;
        case 'meeting':
          response = await meetingsAPI.createMeeting(formData);
          break;
        case 'project':
          response = await projectsAPI.createProject(formData);
          break;
        case 'department':
          response = await departmentsAPI.createDepartment(formData);
          break;
        case 'employee':
          response = await employeesAPI.createEmployee(formData);
          break;
        default:
          console.error(`Неизвестный тип: ${type}`);
          return false;
      }
      if (response.ok) {
        switch (type) {
          case 'task':
            setTimeout(() => {
              onTaskCreated?.(true);
            }, 3000);
            break;
          case 'release':
            setTimeout(() => {
              onTaskCreated?.(true);
            }, 3000);
            break;
          case 'meeting':
            setTimeout(() => {
              onMeetingCreated?.();
            }, 3000)
            break;
          case 'project':
            setTimeout(() => {
              onProjectCreated?.();
            }, 3000)
            break;
          case 'department':
            onDepartmentCreated?.();
            break;
          case 'employee':
            onEmployeeCreated?.();
            break;
        }
        return true;
      } else {
        console.error(`Ошибка при создании ${type}`);
        console.log(response.json());
        return false;
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      return false;
    }
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
        releases={releases}
      />

      <ReleaseModal
        isOpen={activeModal === 'release'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />

      <MeetingModal
        isOpen={activeModal === 'meeting'}
        onMeetingsUpdate={onMeetingCreated}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        employees={employees}
      />

      <EmployeeModal
        isOpen={activeModal === 'executor'}
        mode="create"
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        schedules={schedules}
        departments={departments}
      />

      <OfficeModal
        isOpen={activeModal === 'office'}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        employees={employees}
      />
    </>
  );
}

export default NavButtons;