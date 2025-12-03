import { useEffect, useRef, useState } from 'react';
import './SideBar.css';
import NavButtons from '../NavButtons/NavButtons';
import TasksList from '../TasksList/TasksList';
import { Department, Employee, getAliasFromTaskStatus, ListNode, ProjectItem, ReleaseItem, Status, TaskItem } from '@types';
import EmployeesList from '../EmployeesList/EmployeesList';
import OfficesList from '../OfficesList/OfficesList';
import Preloader from '@components/Preloader';
import { ReleaseModal } from '@components/ReleaseModal/ReleaseModal';
import { ProjectModal } from '@components/ProjectModal/ProjectModal';
import { projectsAPI, releasesAPI } from '@utils/api';

interface SideBarProps {
  onTaskSelect: (task: TaskItem) => void;
  onEmployeeSelect: (employee: Employee) => void;
  userRole: string | null;
  userId: number;
  onTasksUpdate?: () => void;
  onProjectsUpdate?: () => void;
  onMeetengsUpdate: () => void;
  onEmployeesUpdate: () => void;
  releasesData: ReleaseItem[];
  projectsData: ProjectItem[];
  employeesData: Employee[];
  departmentsData: Department[];
  loading?: boolean;
  statuses: Status[];
}

const SideBar = ({
  onTaskSelect,
  onEmployeeSelect,
  userRole,
  userId,
  onTasksUpdate,
  onProjectsUpdate,
  onMeetengsUpdate,
  onEmployeesUpdate,
  releasesData,
  projectsData,
  employeesData,
  departmentsData,
  loading = false,
  statuses
}: SideBarProps) => {
  const [activeList, setActiveList] = useState<'tasks' | 'employees'>('tasks');
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean; type: 'release' | 'project' | null; data: any }>({
    isOpen: false,
    type: null,
    data: null
  });

  useEffect(() => {
    if (userRole === 'executor') setTaskFilter('my');
  }, [userRole])

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

  const handleModalSubmit = async (formData: any, type: string): Promise<boolean> => {
    console.log(formData)
    try {
      let response: Response;
      switch (type) {
        case 'release':
          response = await releasesAPI.updateRelease(formData);
          break;
        case 'project':
          response = await projectsAPI.updateProject(formData);
          break;
        default:
          console.log('error');
          return false;
      }
      if (response.ok) {
        setTimeout(() => {
          onTasksUpdate?.();
        }, 3000)
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
  }

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
        onProjectCreated={onProjectsUpdate}
        onTaskCreated={onTasksUpdate}
        onMeetingCreated={onMeetengsUpdate}
        onEmployeeCreated={onEmployeesUpdate}
        releases={releasesData}
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

      <ReleaseModal
        isOpen={infoModal.type === 'release' ? infoModal.isOpen : false}
        onClose={handleInfoModalClose}
        onSubmit={handleModalSubmit}
        initialData={infoModal.data}
        mode='edit'
        statuses={statuses}
      />

      <ProjectModal
        isOpen={infoModal.type === 'project' ? infoModal.isOpen : false}
        onClose={handleInfoModalClose}
        onSubmit={handleModalSubmit}
        releases={releasesData}
        statuses={statuses}
        userRole={userRole}
        initialData={infoModal.data}
        mode='edit'
      />
    </div>
  );
}

export default SideBar;