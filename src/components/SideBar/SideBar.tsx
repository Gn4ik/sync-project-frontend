import { useEffect, useRef, useState } from 'react';
import './SideBar.css';
import NavButtons from '../NavButtons/NavButtons';
import TasksList from '../TasksList/TasksList';
import { Colleague, ListNode, Office, ProjectItem, ReleaseItem, TaskItem } from '@types';
import ColleaguesList from '../ColleaguesList/ColleaguesList';
import InfoModal from '../InfoModal/InfoModal';
import OfficesList from '../OfficesList/OfficesList';
import Preloader from '@components/Preloader';

const URL = process.env.HOST;

interface SideBarProps {
  onTaskSelect: (task: TaskItem) => void;
  onColleagueSelect: (colleague: Colleague) => void;
  userRole: 'executor' | 'manager' | 'admin' | null;
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

  const [loading, setLoading] = useState({
    tasks: false,
    colleagues: false,
    offices: false,
    statuses: false
  });

  const hasLoaded = useRef({
    tasks: false,
    colleagues: false,
    offices: false,
    statuses: false
  });

  const getAuthToken = () => localStorage.getItem('auth_token');

  const fetchData = async (endpoint: string) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No auth token');
    }

    const response = await fetch(`${URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '0',
        "SyncAuthToken": token,
      }
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${endpoint}`);
    }

    return response.json();
  };

  const loadReleasesData = async () => {
    if (hasLoaded.current.tasks) {
      return releasesData;
    }

    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      const releases = await fetchData('/releases/all/');
      console.log('Releases loaded:', releases);
      setReleasesData(releases);
      hasLoaded.current.tasks = true;
      return releases;
    } catch (error) {
      console.error('Releases loading failed:', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  const loadEmployees = async () => {
    if (hasLoaded.current.colleagues) {
      return employeesData;
    }

    try {
      setLoading(prev => ({ ...prev, colleagues: true }));
      const employees = await fetchData('/employees/all/');
      console.log('Employees loaded:', employees);
      setEmployeesData(employees);
      hasLoaded.current.colleagues = true;
      return employees;
    } catch (error) {
      console.error('Employees loading failed:', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, colleagues: false }));
    }
  };

  const loadStatuses = async () => {
    if (hasLoaded.current.statuses) {
      return statusesData;
    }

    try {
      setLoading(prev => ({ ...prev, statuses: true }));
      const statuses = await fetchData('/statuses/all/');
      console.log('Statuses loaded:', statuses);
      setStatusesData(statuses);
      hasLoaded.current.statuses = true;
      return statuses;
    } catch (error) {
      console.error('Statuses loading failed:', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, statuses: false }));
    }
  };

  const loadDepartments = async () => {
    if (hasLoaded.current.offices) {
      return departmentsData;
    }

    try {
      setLoading(prev => ({ ...prev, offices: true }));
      const departments = await fetchData('/departments/all/');
      console.log('Departments loaded:', departments);
      setDepartmentsData(departments);
      hasLoaded.current.offices = true;
      return departments;
    } catch (error) {
      console.error('Departments loading failed:', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, offices: false }));
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        loadStatuses(),
        loadReleasesData()
      ]);
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const loadDataForActiveList = async () => {
      if (userRole === 'admin') {
        await loadDepartments();
      } else if (activeList === 'colleagues' && !hasLoaded.current.colleagues) {
        await loadEmployees();
      }
    };

    loadDataForActiveList();
  }, [activeList, userRole]);

  const handleListChange = (list: 'tasks' | 'colleagues') => {
    setActiveList(list);
  };

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

  const getCurrentLoadingState = () => {
    if (userRole === 'admin') {
      return loading.offices;
    } else if (activeList === 'tasks') {
      return loading.tasks;
    } else {
      return loading.colleagues;
    }
  };

  if (getCurrentLoadingState()) {
    return <div className="sidebar-container"><Preloader /></div>;
  }

  return (
    <div className="sidebar-container">
      <NavButtons
        activeList={activeList}
        onListChange={handleListChange}
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