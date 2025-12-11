jest.mock('@icons/Vector.svg', () => 'test-svg');
jest.mock('@icons/LinkIcon.svg', () => 'test-svg');
jest.mock('@icons/notificationIconActive.svg', () => 'test-svg');
jest.mock('@icons/logout.svg', () => 'test-svg');
jest.mock('@icons/releases-active.svg', () => 'test-svg');
jest.mock('@icons/releases-inactive.svg', () => 'test-svg');
jest.mock('@icons/colleague-active.svg', () => 'test-svg');
jest.mock('@icons/colleague-inactive.svg', () => 'test-svg');
jest.mock('@icons/plus.svg', () => 'test-svg');
jest.mock('@icons/filters.svg', () => 'test-svg');
jest.mock('@icons/SearchIcon.svg', () => 'test-svg');

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import SideBar from '@components/SideBar/SideBar';
import { Department, Employee, ProjectItem, ReleaseItem, Status, TaskItem } from '@types';
import { releasesAPI, projectsAPI, departmentsAPI } from '@utils/api';

jest.mock('@utils/api', () => ({
  releasesAPI: {
    updateRelease: jest.fn()
  },
  projectsAPI: {
    updateProject: jest.fn()
  },
  departmentsAPI: {
    updateDepartment: jest.fn()
  }
}));

jest.mock('@types', () => ({
  ...jest.requireActual('@types'),
  getAliasFromTaskStatus: jest.fn((status) => {
    const map: Record<string, string> = {
      'in_progress': 'in_progress',
      'completed': 'completed',
      'pending': 'pending',
      'to-execution': 'К выполнению',
      'on-work': 'В работе',
      'on-review': 'На проверке',
      'stopped': 'Отложены',
      'closed': 'Отменены'
    };
    return map[status] || status;
  }),
  getTaskStatusFromAlias: jest.fn((alias) => {
    const map: Record<string, string> = {
      'К выполнению': 'to-execution',
      'В работе': 'on-work',
      'На проверке': 'on-review',
      'Отложены': 'stopped',
      'Отменены': 'closed'
    };
    return map[alias] || 'primary';
  })
}));

jest.mock('@components/Preloader', () => ({
  __esModule: true,
  default: () => <div data-testid="preloader">Loading...</div>
}));

jest.mock('@components/TasksList/TasksList', () => ({
  __esModule: true,
  default: ({ items, onItemClick, onInfoClick }: any) => (
    <div data-testid="tasks-list">
      <div data-testid="task-list-items">
        {items.map((release: any) => (
          <div key={release.id}>
            <div
              data-testid={`release-${release.id}`}
              onClick={() => onInfoClick?.({
                id: `release-${release.id}`,
                title: release.name,
                type: 'release',
                data: release
              })}
            >
              Release: {release.name}
            </div>
            {release.projects.map((project: any) => (
              <div key={project.id}>
                <div
                  data-testid={`project-${project.id}`}
                  onClick={() => onInfoClick?.({
                    id: `project-${project.id}`,
                    title: project.name,
                    type: 'project',
                    data: project
                  })}
                >
                  Project: {project.name}
                </div>
                {project.tasks.map((task: any) => (
                  <button
                    key={task.id}
                    data-testid={`task-${task.id}`}
                    onClick={() => onItemClick?.(task)}
                  >
                    Task: {task.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}));

jest.mock('@components/EmployeesList/EmployeesList', () => ({
  __esModule: true,
  default: ({ items, onItemClick, activeEmployeeId }: any) => (
    <div data-testid="employees-list">
      {items.map((employee: any) => (
        <button
          key={employee.id}
          data-testid={`employee-${employee.id}`}
          data-active={activeEmployeeId === employee.id}
          onClick={() => onItemClick?.(employee)}
        >
          {employee.fname} {employee.lname}
        </button>
      ))}
    </div>
  )
}));

jest.mock('@components/OfficesList/OfficesList', () => ({
  __esModule: true,
  default: ({ items, onEmployeeSelect, onDepartmentUpdate }: any) => (
    <div data-testid="offices-list">
      {items.map((dept: any) => (
        <div key={dept.id}>
          <div data-testid={`department-${dept.id}`}>
            Department: {dept.name}
            <button
              data-testid={`department-info-${dept.id}`}
              onClick={() => onDepartmentUpdate?.({ id: dept.id, name: dept.name }, 'department')}
            >
              ℹ
            </button>
          </div>
          <button
            data-testid={`select-employee-${dept.id}`}
            onClick={() => onEmployeeSelect?.(dept.lead)}
          >
            Select Head
          </button>
        </div>
      ))}
    </div>
  )
}));

jest.mock('@components/NavButtons/NavButtons', () => ({
  __esModule: true,
  default: ({
    activeList,
    onListChange,
    onFilterChange,
    currentFilter,
    userRole,
    onTaskCreated
  }: any) => (
    <div data-testid="nav-buttons">
      <div data-testid="nav-buttons-role">Role: {userRole}</div>
      <button
        data-testid="tasks-list-button"
        onClick={() => onListChange?.('tasks')}
        data-active={activeList === 'tasks'}
      >
        Tasks
      </button>
      <button
        data-testid="employees-list-button"
        onClick={() => onListChange?.('employees')}
        data-active={activeList === 'employees'}
      >
        Employees
      </button>
      <button
        data-testid="my-filter-button"
        onClick={() => onFilterChange?.('my')}
      >
        My Tasks
      </button>
      <button
        data-testid="all-filter-button"
        onClick={() => onFilterChange?.('all')}
      >
        All Tasks
      </button>
      <button
        data-testid="create-task-button"
        onClick={() => onTaskCreated?.(true)}
      >
        Create Task
      </button>
    </div>
  )
}));

jest.mock('@components/ReleaseModal/ReleaseModal', () => ({
  ReleaseModal: ({ isOpen, onClose, onSubmit, initialData }: any) =>
    isOpen ? (
      <div data-testid="release-modal">
        <div>Release Modal: {initialData?.title}</div>
        <button
          data-testid="submit-release-modal"
          onClick={() => onSubmit?.({ id: 1 }, 'release').then(() => onClose?.())}
        >
          Submit Release
        </button>
        <button
          data-testid="close-release-modal"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    ) : null
}));

jest.mock('@components/ProjectModal/ProjectModal', () => ({
  ProjectModal: ({ isOpen, onClose, onSubmit, initialData }: any) =>
    isOpen ? (
      <div data-testid="project-modal">
        <div>Project Modal: {initialData?.title}</div>
        <button
          data-testid="submit-project-modal"
          onClick={() => onSubmit?.({ id: 1 }, 'project').then(() => onClose?.())}
        >
          Submit Project
        </button>
        <button
          data-testid="close-project-modal"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    ) : null
}));

const mockStatuses: Status[] = [
  { id: 1, alias: 'В работе' },
  { id: 2, alias: 'Завершены' },
  { id: 3, alias: 'На проверке' }
];

const mockTasks: TaskItem[] = [
  {
    id: 1001,
    name: 'Task 1',
    created_at: '2024-01-01T00:00:00Z',
    end_date: '2024-12-31T00:00:00Z',
    description: 'Test task 1',
    project_id: 101,
    executor_id: 1,
    creator_id: 2,
    start_date: '2024-01-01T00:00:00Z',
    status_id: 1,
    task_comments: [],
    task_files: [],
    status: { alias: 'in_progress', id: 1 },
    isExpanded: false,
    isActive: false,
    canEdit: false
  },
  {
    id: 1002,
    name: 'Task 2',
    created_at: '2024-01-02T00:00:00Z',
    end_date: '2024-12-31T00:00:00Z',
    description: 'Test task 2',
    project_id: 101,
    executor_id: 2,
    creator_id: 1,
    start_date: '2024-01-02T00:00:00Z',
    status_id: 2,
    task_comments: [],
    task_files: [],
    status: { alias: 'completed', id: 2 },
    isExpanded: false,
    isActive: false,
    canEdit: false
  }
];

const mockProjects: ProjectItem[] = [
  {
    id: 101,
    name: 'Project 1',
    description: 'Test project 1',
    manager_id: 1,
    release_id: 1,
    status_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    tasks: mockTasks,
    isExpanded: false,
    isActive: false
  }
];

const mockReleases: ReleaseItem[] = [
  {
    id: 1,
    name: 'Release 1',
    description: 'Test release 1',
    version: '1.0.0',
    status_id: 1,
    projects: mockProjects,
    isExpanded: false,
    isActive: false
  }
];

const mockEmployees: Employee[] = [
  {
    id: '1',
    role_id: 1,
    fname: 'John',
    lname: 'Doe',
    mname: '',
    position: 'Developer',
    email: 'john@test.com',
    phone: '1234567890',
    employee_meetengs: null,
    schedule: {
      sun_id: 1,
      mon_id: 1,
      wed_id: 1,
      fri_id: 1,
      id: 1,
      tue_id: 1,
      thu_id: 1,
      sat_id: 1,
      fri: { endtime: '18:00', starttime: '09:00', launchbreak_end: '13:00', launchbreak_start: '12:00' },
      tue: { endtime: '18:00', starttime: '09:00', launchbreak_end: '13:00', launchbreak_start: '12:00' },
      sat: { endtime: '18:00', starttime: '09:00', launchbreak_end: '13:00', launchbreak_start: '12:00' },
      wed: { endtime: '18:00', starttime: '09:00', launchbreak_end: '13:00', launchbreak_start: '12:00' },
      sun: { endtime: '18:00', starttime: '09:00', launchbreak_end: '13:00', launchbreak_start: '12:00' },
      thu: { endtime: '18:00', starttime: '09:00', launchbreak_end: '13:00', launchbreak_start: '12:00' },
      mon: { endtime: '18:00', starttime: '09:00', launchbreak_end: '13:00', launchbreak_start: '12:00' }
    },
    employee_departments: [],
    vacations: []
  },
  {
    id: '2',
    role_id: 2,
    fname: 'Jane',
    lname: 'Smith',
    mname: '',
    position: 'Manager',
    email: 'jane@test.com',
    phone: '0987654321',
    employee_meetengs: null,
    schedule: {
      sun_id: 2,
      mon_id: 2,
      wed_id: 2,
      fri_id: 2,
      id: 2,
      tue_id: 2,
      thu_id: 2,
      sat_id: 2,
      fri: { endtime: '18:00', starttime: '09:00', launchbreak_end: '13:00', launchbreak_start: '12:00' },
      tue: { endtime: '18:00', starttime: '09:00', launchbreak_end: '13:00', launchbreak_start: '12:00' },
      sat: { endtime: '18:00', starttime: '09:00', launchbreak_end: '13:00', launchbreak_start: '12:00' },
      wed: { endtime: '18:00', starttime: '09:00', launchbreak_end: '13:00', launchbreak_start: '12:00' },
      sun: { endtime: '18:00', starttime: '09:00', launchbreak_end: '13:00', launchbreak_start: '12:00' },
      thu: { endtime: '18:00', starttime: '09:00', launchbreak_end: '13:00', launchbreak_start: '12:00' },
      mon: { endtime: '18:00', starttime: '09:00', launchbreak_end: '13:00', launchbreak_start: '12:00' }
    },
    employee_departments: [],
    vacations: []
  }
];

const mockDepartments: Department[] = [
  {
    id: 1,
    name: 'Development',
    lead_id: 1,
    lead: mockEmployees[0],
    staff: [
      {
        department_id: 1,
        employee_id: 1,
        office: 'Development',
        employee: mockEmployees[0]
      }
    ]
  }
];

const mockProjectsData: ProjectItem[] = [
  {
    id: 101,
    name: 'Project 1',
    description: 'Test project 1',
    manager_id: 1,
    release_id: 1,
    status_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    tasks: [],
    isExpanded: false,
    isActive: false
  }
];

const defaultProps = {
  onTaskSelect: jest.fn(),
  onEmployeeSelect: jest.fn(),
  userRole: 'executor' as const,
  userId: 1,
  onTasksUpdate: jest.fn(),
  onProjectsUpdate: jest.fn(),
  onMeetengsUpdate: jest.fn(),
  onEmployeesUpdate: jest.fn(),
  onDepartmentsUpdate: jest.fn(),
  releasesData: mockReleases,
  projectsData: mockProjectsData,
  employeesData: mockEmployees,
  departmentsData: mockDepartments,
  loading: false,
  statuses: mockStatuses
};

describe('SideBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('enable Preloader', () => {
    render(<SideBar {...defaultProps} loading={true} />);
    expect(screen.getByTestId('preloader')).toBeInTheDocument();
  });

  test('enable NavButtons with correct role', () => {
    render(<SideBar {...defaultProps} />);
    expect(screen.getByTestId('nav-buttons')).toBeInTheDocument();
    expect(screen.getByTestId('tasks-list-button')).toBeInTheDocument();
    expect(screen.getByTestId('employees-list-button')).toBeInTheDocument();
  });

  test('enable TaskList default for executor', () => {
    render(<SideBar {...defaultProps} />);
    expect(screen.getByTestId('tasks-list')).toBeInTheDocument();
    expect(screen.getByTestId('release-1')).toBeInTheDocument();
    expect(screen.getByText('Release: Release 1')).toBeInTheDocument();
  });

  test('switch on EmployeeList', () => {
    render(<SideBar {...defaultProps} />);

    const employeesButton = screen.getByTestId('employees-list-button');
    fireEvent.click(employeesButton);
    expect(employeesButton.dataset.active).toBe('true');
  });

  test('render OfficesList for admin', () => {
    render(<SideBar {...defaultProps} userRole="admin" />);
    expect(screen.getByTestId('offices-list')).toBeInTheDocument();
    expect(screen.getByTestId('department-1')).toBeInTheDocument();
    expect(screen.getByText('Department: Development')).toBeInTheDocument();
  });

  test('processes a click on a task', () => {
    render(<SideBar {...defaultProps} />);

    const taskButton = screen.getByTestId('task-1001');
    fireEvent.click(taskButton);

    expect(defaultProps.onTaskSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1001,
        name: 'Task 1'
      })
    );
  });

  test('processes a click on an employee', () => {
    render(
      <SideBar
        {...defaultProps}
        userRole="executor"
      />
    );

    const employeesButton = screen.getByTestId('employees-list-button');
    fireEvent.click(employeesButton);

    const employeeButton = screen.getByTestId('employee-1');
    fireEvent.click(employeeButton);

    expect(defaultProps.onEmployeeSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        fname: 'John',
        lname: 'Doe'
      })
    );
  });

  test('opens the ReleaseModal when clicking on a release', async () => {
    render(<SideBar {...defaultProps} userRole="manager" />);

    const releaseElement = screen.getByTestId('release-1');
    fireEvent.click(releaseElement);

    await waitFor(() => {
      expect(screen.getByTestId('release-modal')).toBeInTheDocument();
    });
  });

  test('opens ProjectModal when clicking on a project', async () => {
    render(<SideBar {...defaultProps} userRole="manager" />);

    const projectElement = screen.getByTestId('project-101');
    fireEvent.click(projectElement);

    await waitFor(() => {
      expect(screen.getByTestId('project-modal')).toBeInTheDocument();
    });
  });

  test('calls the API when the form is submitted in ReleaseModal', async () => {
    (releasesAPI.updateRelease as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({})
    });

    render(<SideBar {...defaultProps} userRole="manager" />);

    const releaseElement = screen.getByTestId('release-1');
    fireEvent.click(releaseElement);

    await waitFor(() => {
      expect(screen.getByTestId('release-modal')).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId('submit-release-modal');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(releasesAPI.updateRelease).toHaveBeenCalled();
    });
  });

  test('calls the API when the form is submitted in ProjectModal', async () => {
    (projectsAPI.updateProject as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({})
    });

    render(<SideBar {...defaultProps} userRole="manager" />);

    const projectElement = screen.getByTestId('project-101');
    fireEvent.click(projectElement);

    await waitFor(() => {
      expect(screen.getByTestId('project-modal')).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId('submit-project-modal');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(projectsAPI.updateProject).toHaveBeenCalled();
    });
  });

  test('calls onTasksUpdate after a successful release update', async () => {
    (releasesAPI.updateRelease as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({})
    });

    render(<SideBar {...defaultProps} userRole="manager" />);

    const releaseElement = screen.getByTestId('release-1');
    fireEvent.click(releaseElement);

    await waitFor(() => {
      expect(screen.getByTestId('release-modal')).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId('submit-release-modal');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(defaultProps.onTasksUpdate).toHaveBeenCalledWith(true);
    }, { timeout: 4000 });
  });

  test('calls onDepartmentsUpdate after a department has been successfully updated', async () => {
    (departmentsAPI.updateDepartment as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({})
    });

    render(<SideBar {...defaultProps} userRole="admin" />);

    const departmentInfoButton = screen.getByTestId('department-info-1');
    fireEvent.click(departmentInfoButton);

    await waitFor(() => {
      expect(defaultProps.onDepartmentsUpdate).toHaveBeenCalled();
    }, { timeout: 4000 });
  });

  test('close Modals', async () => {
    render(<SideBar {...defaultProps} userRole="manager" />);

    const releaseElement = screen.getByTestId('release-1');
    fireEvent.click(releaseElement);

    await waitFor(() => {
      expect(screen.getByTestId('release-modal')).toBeInTheDocument();
    });

    const closeButton = screen.getByTestId('close-release-modal');
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByTestId('release-modal')).not.toBeInTheDocument();
    });
  });

  test('filters only user tasks for executor', () => {
    render(<SideBar {...defaultProps} userRole="executor" userId={1} />);

    expect(screen.getByTestId('task-1001')).toBeInTheDocument();
  });

  test('handles an error during an update', async () => {
    (releasesAPI.updateRelease as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'Update failed' })
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    render(<SideBar {...defaultProps} userRole="manager" />);

    const releaseElement = screen.getByTestId('release-1');
    fireEvent.click(releaseElement);

    await waitFor(() => {
      expect(screen.getByTestId('release-modal')).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId('submit-release-modal');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Ошибка при создании release');
    });

    consoleSpy.mockRestore();
  });
});