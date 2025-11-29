import { useEffect, useRef, useState } from 'react';
import './SideBar.css';
import NavButtons from '../NavButtons/NavButtons';
import TasksList from '../TasksList/TasksList';
import { Department, Employee, getAliasFromTaskStatus, ListNode, ProjectItem, ReleaseItem, TaskItem } from '@types';
import EmployeesList from '../EmployeesList/EmployeesList';
import InfoModal from '../InfoModal/InfoModal';
import OfficesList from '../OfficesList/OfficesList';
import Preloader from '@components/Preloader';
import { statusAPI } from '@utils/api';

interface SideBarProps {
  onTaskSelect: (task: TaskItem) => void;
  onEmployeeSelect: (employee: Employee) => void;
  userRole: 'executor' | 'manager' | 'admin' | null;
  userId: number;
  onStatusesLoaded?: (statuses: Array<{ id: number; alias: string }>) => void;
  onReleasesLoaded?: (releases: ReleaseItem[]) => void;
  releasesData: ReleaseItem[];
  projectsData: ProjectItem[];
  employeesData: Employee[];
  departmentsData: Department[];
  loading?: boolean;
}

const SideBar = ({
  onTaskSelect,
  onEmployeeSelect,
  userRole,
  userId,
  onStatusesLoaded,
  onReleasesLoaded,
  releasesData,
  projectsData,
  employeesData,
  departmentsData,
  loading = false
}: SideBarProps) => {
  const [activeList, setActiveList] = useState<'tasks' | 'employees'>('tasks');
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [statusesData, setStatusesData] = useState<Array<{ id: number; alias: string }>>([]);
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean; type: 'release' | 'project' | null; data: any }>({
    isOpen: false,
    type: null,
    data: null
  });

  const getAuthToken = () => localStorage.getItem('auth_token');

  const loadStatuses = async () => {
    try {
      const statuses = await statusAPI.getStatuses();
      console.log('Statuses loaded:', statuses);
      setStatusesData(statuses);
      onStatusesLoaded?.(statuses);
      return statuses;
    } catch (error) {
      console.error('Statuses loading failed:', error);
      return null;
    }
  };
  useEffect(() => {
    loadStatuses()
  }, []);

  useEffect(() => {
    // const loadDataForActiveList = async () => {
    //   if (userRole === 'admin') {
    //     await loadDepartments();
    //   } else if (activeList === 'employees' && !hasLoaded.current.employees) {
    //     await loadEmployees();
    //   }
    // };

    // loadDataForActiveList();
  }, [activeList, userRole]);

  const handleListChange = (list: 'tasks' | 'employees') => {
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
                task.status.alias === getAliasFromTaskStatus(taskFilter)
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

  const handleEmployeeClick = (employee: Employee) => {
    setActiveEmployeeId(employee.id);
    onEmployeeSelect(employee);
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
        projects={projectsData}
        employees={employeesData}
      />

      {userRole === 'admin' ? (
        <OfficesList
          items={departmentsData}
          employees={employeesData}
          onEmployeeSelect={handleEmployeeClick}
        />
      ) : activeList === 'tasks' ? (
        <TasksList
          items={filteredTasks}
          onItemClick={handleTaskClick}
          onInfoClick={handleInfoClick}
        />
      ) : (
        <EmployeesList
          items={employeesData}
          onItemClick={handleEmployeeClick}
          activeEmployeeId={activeEmployeeId}
          onActiveEmployeeChange={setActiveEmployeeId}
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