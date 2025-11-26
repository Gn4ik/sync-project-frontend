import { useEffect, useRef, useState } from 'react';
import './SideBar.css';
import NavButtons from '../NavButtons/NavButtons';
import TasksList from '../TasksList/TasksList';
import { Colleague, ListNode, Office, ProjectItem, ReleaseItem, TaskItem } from '../types/types';
import ColleaguesList from '../ColleaguesList/ColleaguesList';
import InfoModal from '../InfoModal/InfoModal';
import OfficesList from '../OfficesList/OfficesList';

const URL = process.env.HOST;

interface SideBarProps {
  onTaskSelect: (task: TaskItem) => void;
  onColleagueSelect: (colleague: Colleague) => void;
  userRole: 'user' | 'manager' | 'admin' | null;
  userId: number;
}

const SideBar = ({ onTaskSelect, onColleagueSelect, userRole, userId }: SideBarProps) => {
  const [activeList, setActiveList] = useState<'tasks' | 'colleagues'>('tasks');
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [statusesData, setStatusesData] = useState<Array<{ id: number; alias: string }>>([]);
  const [activeColleagueId, setActiveColleagueId] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean; type: 'release' | 'project' | null; data: any }>({
    isOpen: false,
    type: null,
    data: null
  });

  const [releasesData, setReleasesData] = useState<ReleaseItem[]>([]);
  const [employeesData, setEmployeesData] = useState<Colleague[]>([]);
  const [departmentsData, setDepartmentsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReleasesData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${URL}/releases/all/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '0',
          "SyncAuthToken": token,
        }
      });

      if (!response.ok) {
        throw new Error('Releases request failed');
      }

      const releases: ReleaseItem[] = await response.json();
      console.log(releases)
      setReleasesData(releases);
      return releases;

    } catch (error) {
      console.error('Releases loading failed:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return;
      }

      const response = await fetch(`${URL}/employees/all/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '0',
          "SyncAuthToken": token,
        }
      });
      

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const employees = await response.json();
      
      console.log(employees)
      setEmployeesData(employees);
      return employees;

    } catch (error) {
      console.error('Employees loading failed:', error);
      return null;
    }
  };

  const loadStatuses = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return;
      }

      const response = await fetch(`${URL}/statuses/all/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '0',
          "SyncAuthToken": token,
        }
      });

      if (!response.ok) {
        throw new Error('Statuses request failed');
      }

      const statuses = await response.json();

      console.log(statuses);
      setStatusesData(statuses);
      return statuses;

    } catch (error) {
      console.error('Statuses loading failed:', error);
      return null;
    }
  };

  const loadDepartments = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return;
      }

      const response = await fetch(`${URL}/departments/all/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '0',
          "SyncAuthToken": token,
        }
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const departments = await response.json();
      console.log(departments);
      setDepartmentsData(departments);
      return departments;

    } catch (error) {
      console.error('Departments loading failed:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        loadReleasesData(),
        loadEmployees(),
        loadDepartments(),
        loadStatuses()
      ]);
    };

    loadAllData();
  }, []);

  const getFilteredTasks = (data: ReleaseItem[]): ReleaseItem[] => {
    if (!data || data.length === 0) return [];

    if (taskFilter === 'all') return data;

    if (taskFilter === 'my') {
      const filterMy = (items: ReleaseItem[]): ReleaseItem[] =>
        items
          .map(release => {
            const filteredProjects = release.projects
              ?.map(project => {
                const filteredTasks = project.tasks?.filter(task =>
                  task.executor_id === userId
                );

                if (filteredTasks && filteredTasks.length > 0) {
                  return {
                    ...project,
                    tasks: filteredTasks
                  };
                }
                return null;
              })
              .filter(Boolean) as ProjectItem[];

            if (filteredProjects && filteredProjects.length > 0) {
              return {
                ...release,
                projects: filteredProjects
              };
            }
            return null;
          })
          .filter(Boolean) as ReleaseItem[];

      return filterMy(data);
    }

    const filterByStatus = (items: ReleaseItem[]): ReleaseItem[] =>
      items
        .map(release => {
          const filteredProjects = release.projects
            ?.map(project => {
              const filteredTasks = project.tasks?.filter(task =>
                task.status_id.toString() === taskFilter
              );

              if (filteredTasks && filteredTasks.length > 0) {
                return {
                  ...project,
                  tasks: filteredTasks
                };
              }
              return null;
            })
            .filter(Boolean) as ProjectItem[];

          if (filteredProjects && filteredProjects.length > 0) {
            return {
              ...release,
              projects: filteredProjects
            };
          }
          return null;
        })
        .filter(Boolean) as ReleaseItem[];

    return filterByStatus(data);
  };

  const filteredTasks = getFilteredTasks(releasesData);

  const handleTaskClick = (task: TaskItem) => {
    onTaskSelect(task);
  };

  const handleColleagueClick = (colleague: Colleague) => {
    setActiveColleagueId(colleague.id);
    onColleagueSelect(colleague);
  };

  const handleFilterChange = (filter: string) => {
    setTaskFilter(filter);
  };

  const handleInfoClick = (item: ListNode) => {
    if (item.type === 'release' || item.type === 'project') {
      setInfoModal({
        isOpen: true,
        type: item.type,
        data: item
      });
    }
  };

  const handleInfoModalClose = () => {
    setInfoModal({
      isOpen: false,
      type: null,
      data: null
    });
  };

  if (loading) {
    return <div className="sidebar-container">Loading...</div>;
  }

  return (
    <div className="sidebar-container">
      <NavButtons
        activeList={activeList}
        onListChange={setActiveList}
        onFilterChange={handleFilterChange}
        currentFilter={taskFilter}
        userRole={userRole}
      />

      {userRole === 'admin' ? (
        <OfficesList
          items={departmentsData}
          onColleagueSelect={handleColleagueClick}
        />
      ) : activeList === 'tasks' ? (
        <TasksList
          items={filteredTasks}
          onItemClick={handleTaskClick}
          onInfoClick={handleInfoClick}
        />
      ) : (
        <ColleaguesList
          items={employeesData}
          onItemClick={handleColleagueClick}
          activeColleagueId={activeColleagueId}
          onActiveColleagueChange={setActiveColleagueId}
        />
      )}

      <InfoModal
        isOpen={infoModal.isOpen}
        onClose={handleInfoModalClose}
        type={infoModal.type}
        data={infoModal.data}
      />
    </div>
  );
}

export default SideBar;