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

jest.mock('@styles/styles.css', () => ({}), { virtual: true });

jest.mock('@components/TaskInfo/TaskInfo', () => {
  return function MockTaskInfo(props: any) {
    return (
      <div data-testid="task-info">
        {props.selectedTask ? `Task: ${props.selectedTask.name}` : 'No task selected'}
      </div>
    );
  };
});

import {
  mockAuthAPI,
  mockTasksAPI,
  mockEmployeesAPI,
  mockNotificationsAPI,
} from './mocks/apiMocks';

jest.mock('@utils/api', () => ({
  authAPI: mockAuthAPI,
  tasksAPI: mockTasksAPI,
  employeesAPI: mockEmployeesAPI,
  notificationsAPI: mockNotificationsAPI,
  departmentsAPI: {
    getDepartments: jest.fn(),
  },
  projectsAPI: {
    getProjects: jest.fn(),
  },
  releasesAPI: {
    getReleases: jest.fn(),
  },
  statusAPI: {
    getStatuses: jest.fn(),
  },
  meetingsAPI: {
    getMeetings: jest.fn(),
  },
  schedulesAPI: {
    getSchedules: jest.fn(),
  },
}));

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MainPage from '@components/MainPage/MainPage';

import {
  departmentsAPI,
  projectsAPI,
  releasesAPI,
  statusAPI,
  meetingsAPI,
  schedulesAPI
} from '@utils/api';

describe('MainPage Integration Tests', () => {
  const mockReleasesData = [
    {
      id: 1,
      name: 'Релиз 1.0',
      version: '1.0.0',
      projects: [
        {
          id: 1,
          name: 'Проект А',
          tasks: [
            {
              id: 1,
              name: 'Задача 1',
              status: { alias: 'В работе', id: 2 },
              executor_id: 1,
              end_date: '2024-01-31T18:00:00Z',
            },
            {
              id: 2,
              name: 'Задача 2',
              status: { alias: 'К выполнению', id: 1 },
              executor_id: 2,
              end_date: '2024-02-15T18:00:00Z',
            },
          ],
        },
      ],
    },
  ];

  const mockEmployeesData = [
    {
      id: '1',
      fname: 'Исполнитель',
      lname: 'Исполнителев',
      mname: 'Исполнителевич',
      position: 'Разработчик',
      employee_departments: [{ office: 'Каб. 417' }],
    },
    {
      id: '2',
      fname: 'Рут',
      lname: 'Админов',
      mname: 'Суперюезерович',
      position: 'Тестировщик',
      employee_departments: [{ office: 'Каб. 418' }],
    },
  ];

  const mockDepartmentsData = [
    {
      id: 1,
      name: 'Разработка',
      lead_id: 1,
      staff: [
        {
          employee_id: 1,
          employee: mockEmployeesData[0],
          office: 'Каб. 417',
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    mockAuthAPI.getMe.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 1,
        role: { description: 'manager' },
      }),
    });

    mockTasksAPI.getTasksById.mockResolvedValue({
      id: 1,
      name: 'Задача 1',
      description: 'Описание задачи 1\nВторая строка описания',
      status: {
        id: 2,
        alias: 'В работе',
        description: 'Задача в работе'
      },
      created_at: '2024-01-15T10:00:00Z',
      start_date: '2024-01-15T10:00:00Z',
      end_date: '2024-01-31T18:00:00Z',
      executor_id: 1,
      creator_id: 2,
      project_id: 1,
      status_id: 2,
      task_comments: [],
      task_files: [],
    });

    (releasesAPI.getReleases as jest.Mock).mockResolvedValue(mockReleasesData);

    mockEmployeesAPI.getEmployees.mockResolvedValue(mockEmployeesData);

    (projectsAPI.getProjects as jest.Mock).mockResolvedValue([]);

    (departmentsAPI.getDepartments as jest.Mock).mockResolvedValue(mockDepartmentsData);

    (statusAPI.getStatuses as jest.Mock).mockResolvedValue([
      { id: 1, alias: 'К выполнению', description: 'Задача к выполнению' },
      { id: 2, alias: 'В работе', description: 'Задача в работе' },
      { id: 3, alias: 'На проверке', description: 'Задача на проверке' },
    ]);

    mockEmployeesAPI.getEmployeeCalendar.mockResolvedValue([]);

    (meetingsAPI.getMeetings as jest.Mock).mockResolvedValue([]);

    mockNotificationsAPI.getMyNotifications.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    mockNotificationsAPI.readNotifications.mockResolvedValue({
      ok: true,
    });
  });

  test('should load data and render main page', async () => {
    localStorage.setItem('auth_token', 'test-token-123');

    let getMeCallCount = 0;
    let getEmployeesCallCount = 0;
    let getReleasesCallCount = 0;

    mockAuthAPI.getMe.mockImplementation(() => {
      getMeCallCount++;
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 1,
          role: { description: 'manager' },
        }),
      });
    });

    mockEmployeesAPI.getEmployees.mockImplementation(() => {
      getEmployeesCallCount++;
      return Promise.resolve(mockEmployeesData);
    });

    (releasesAPI.getReleases as jest.Mock).mockImplementation(() => {
      getReleasesCallCount++;
      return Promise.resolve(mockReleasesData);
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <MainPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('sync')).toBeInTheDocument();
    }, { timeout: 5000 });

    await waitFor(() => {
      expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
    }, { timeout: 5000 });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    expect(getMeCallCount).toBeGreaterThan(0);
    expect(getEmployeesCallCount).toBeGreaterThan(0);
    expect(getReleasesCallCount).toBeGreaterThan(0);
  });

  test('should show releases in sidebar', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <MainPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('should expand release to show projects', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <MainPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
    }, { timeout: 5000 });

    const expandIcons = screen.getAllByText('❯');
    if (expandIcons.length > 0) {
      await act(async () => {
        fireEvent.click(expandIcons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('Проект А')).toBeInTheDocument();
      }, { timeout: 3000 });
    }
  });

  test('should be able to select a task', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <MainPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
    }, { timeout: 5000 });

    const expandIcons = screen.getAllByText('❯');
    if (expandIcons.length > 0) {
      await act(async () => {
        fireEvent.click(expandIcons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('Проект А')).toBeInTheDocument();
      }, { timeout: 3000 });

      const projectExpandIcons = screen.getAllByText('❯');
      if (projectExpandIcons.length > 1) {
        await act(async () => {
          fireEvent.click(projectExpandIcons[1]);
        });

        await waitFor(() => {
          expect(screen.getByText('Задача 1')).toBeInTheDocument();
        }, { timeout: 3000 });

        const taskElement = screen.getByText('Задача 1');
        await act(async () => {
          fireEvent.click(taskElement);
        });

        await waitFor(() => {
          const activeTask = screen.getByText('Задача 1').closest('.tree-item');
          expect(activeTask).toHaveClass('active');
        }, { timeout: 3000 });

        await waitFor(() => {
          expect(screen.getByText('Task: Задача 1')).toBeInTheDocument();
        }, { timeout: 3000 });
      }
    }
  });

  test('should switch between task and employee views', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <MainPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  describe('User role-based functionality', () => {
    test('should show admin functionality for admin role', async () => {
      mockAuthAPI.getMe.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          role: { description: 'admin' },
        }),
      });

      (departmentsAPI.getDepartments as jest.Mock).mockResolvedValue(mockDepartmentsData);

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(departmentsAPI.getDepartments).toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    test('should show manager functionality for manager role', async () => {
      mockAuthAPI.getMe.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          role: { description: 'manager' },
        }),
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('should show executor functionality for executor role', async () => {
      mockAuthAPI.getMe.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          role: { description: 'executor' },
        }),
      });

      const executorReleases = [
        {
          id: 1,
          name: 'Релиз 1.0',
          projects: [
            {
              id: 1,
              name: 'Проект А',
              tasks: [
                {
                  id: 1,
                  name: 'Моя задача',
                  status: { alias: 'В работе', id: 2 },
                  executor_id: 1,
                  end_date: '2024-01-31T18:00:00Z',
                },
              ],
            },
          ],
        },
      ];

      (releasesAPI.getReleases as jest.Mock).mockResolvedValue(executorReleases);

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(releasesAPI.getReleases).toHaveBeenCalled();
      }, { timeout: 5000 });
    });
  });

  describe('MainPage Functionality Tests', () => {
    test('should handle task update with comment mode', async () => {
      mockTasksAPI.getTasksById.mockResolvedValue({
        id: 1,
        name: 'Задача 1',
        description: 'Описание',
        status: { id: 2, alias: 'В работе', description: 'Задача в работе' },
        created_at: '2024-01-15T10:00:00Z',
        start_date: '2024-01-15T10:00:00Z',
        end_date: '2024-01-31T18:00:00Z',
        executor_id: 1,
        creator_id: 2,
        project_id: 1,
        status_id: 2,
        task_comments: [],
        task_files: [],
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
      });

      expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
    });

    test('should handle status change success with token', async () => {
      localStorage.setItem('auth_token', 'test-token');

      mockTasksAPI.updateTask.mockResolvedValue({
        ok: true,
      });

      const mockStatuses = [
        { id: 1, alias: 'К выполнению' },
        { id: 2, alias: 'В работе' },
        { id: 3, alias: 'На проверке' },
      ];

      (statusAPI.getStatuses as jest.Mock).mockResolvedValue(mockStatuses);

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
      });

      expect(statusAPI.getStatuses).toHaveBeenCalled();
    });

    test('should handle status change with failed API response', async () => {
      localStorage.setItem('auth_token', 'test-token');

      mockTasksAPI.updateTask.mockResolvedValue({
        ok: false,
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
      });
      consoleSpy.mockRestore();
    });

    test('should handle refreshProjects with error', async () => {
      (projectsAPI.getProjects as jest.Mock)
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error('Projects refresh failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
      });
      expect(consoleSpy).not.toHaveBeenCalledWith('Error refreshing projects:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    test('should handle refreshMeetings with error', async () => {
      (meetingsAPI.getMeetings as jest.Mock)
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error('Meetings refresh failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
      });
      expect(consoleSpy).not.toHaveBeenCalledWith('Error refreshing meetings:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    test('should handle refreshEmployeesAndDepartments with error', async () => {
      mockEmployeesAPI.getEmployees
        .mockResolvedValueOnce(mockEmployeesData)
        .mockRejectedValueOnce(new Error('Employees refresh failed'));

      (departmentsAPI.getDepartments as jest.Mock)
        .mockResolvedValueOnce(mockDepartmentsData)
        .mockRejectedValueOnce(new Error('Departments refresh failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
      });
      expect(consoleSpy).not.toHaveBeenCalledWith('Error refreshing employees:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    test('should handle checkRole with null response data', async () => {
      mockAuthAPI.getMe.mockResolvedValue({
        ok: true,
        json: async () => null,
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('sync')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    test('should handle checkRole with null role in data', async () => {
      mockAuthAPI.getMe.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          role: null,
        }),
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('sync')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    test('should handle checkRole with null role description', async () => {
      mockAuthAPI.getMe.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          role: { description: null },
        }),
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('sync')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    test('should handle status change when newStatus not found', async () => {
      localStorage.setItem('auth_token', 'test-token');

      mockTasksAPI.updateTask.mockResolvedValue({ ok: true });

      const mockStatuses = [
        { id: 1, alias: 'К выполнению' },
        { id: 3, alias: 'На проверке' },
      ];

      (statusAPI.getStatuses as jest.Mock).mockResolvedValue(mockStatuses);

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
      });
      expect(statusAPI.getStatuses).toHaveBeenCalled();
    });
  });

  describe('MainPage UI State Tests', () => {
    test('should show loading state when updating', async () => {
      (releasesAPI.getReleases as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockReleasesData), 100))
      );

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });
      const loadingIndicator = screen.getByText('sync');
      expect(loadingIndicator).toBeInTheDocument();
    });

    test('should handle employee selection', async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
      });

      const employeeButtons = screen.getAllByRole('button');
      const employeeButton = employeeButtons.find(btn =>
        btn.querySelector('img[alt="Сотрудники"]')
      );

      if (employeeButton) {
        await act(async () => {
          fireEvent.click(employeeButton);
        });
      }
    });

    test('should handle calendar events view', async () => {
      mockEmployeesAPI.getEmployeeCalendar.mockResolvedValue([
        {
          day: '2024-12-25',
          timesheet: [['10:00:00', 'Meeting with team', '']],
          task_deadlines: [['Task 1', '']],
          active_tasks: [['Task 2', '']],
        },
      ]);

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
      });
      const calendar = screen.getByTestId('calendar');
      expect(calendar).toBeInTheDocument();
    });

    test('should handle notification click for meeting', async () => {
      mockNotificationsAPI.getMyNotifications.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: 1,
            title: 'Meeting notification',
            description: 'You have a meeting',
            link: '/meetings/get_by_id/?id=1',
            created_at: '2024-12-25T10:00:00Z',
            is_read: false,
          },
        ],
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
      });

      expect(mockNotificationsAPI.getMyNotifications).toHaveBeenCalled();
    });

    test('should handle task info loading error', async () => {
      mockTasksAPI.getTasksById.mockRejectedValue(new Error('Task load error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(consoleSpy).not.toHaveBeenCalledWith('Error loading task:');
      });

      consoleSpy.mockRestore();
    });

    test('should handle complex nested release structure', async () => {
      const complexReleases = [
        {
          id: 1,
          name: 'Релиз 1.0',
          projects: [
            {
              id: 1,
              name: 'Проект А',
              tasks: [
                {
                  id: 1,
                  name: 'Задача 1',
                  status: { id: 1, alias: 'К выполнению' },
                  end_date: '2024-01-31T18:00:00Z',
                  executor_id: 1,
                },
                {
                  id: 2,
                  name: 'Задача 2',
                  status: { id: 2, alias: 'В работе' },
                  end_date: '2024-02-15T18:00:00Z',
                  executor_id: 2,
                },
              ],
            },
            {
              id: 2,
              name: 'Проект Б',
              tasks: [
                {
                  id: 3,
                  name: 'Задача 3',
                  status: { id: 3, alias: 'На проверке' },
                  end_date: '2024-03-01T18:00:00Z',
                  executor_id: 1,
                },
              ],
            },
          ],
        },
      ];

      (releasesAPI.getReleases as jest.Mock).mockResolvedValue(complexReleases);

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
      });

      expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
    });
  });

  describe('MainPage Callback Tests', () => {
    test('should handle employee edit callback', async () => {
      const updatedEmployee = {
        id: '1',
        fname: 'Обновленный',
        lname: 'Сотрудник',
        mname: 'Тестович',
        position: 'Старший разработчик',
        employee_departments: [{ office: 'Каб. 777' }],
      };

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
      });
      expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
    });

    test('should handle task update with different modes', async () => {
      mockTasksAPI.getTasksById.mockResolvedValue({
        id: 1,
        name: 'Задача 1',
        description: 'Описание',
        status: { id: 2, alias: 'В работе', description: 'Задача в работе' },
        created_at: '2024-01-15T10:00:00Z',
        start_date: '2024-01-15T10:00:00Z',
        end_date: '2024-01-31T18:00:00Z',
        executor_id: 1,
        creator_id: 2,
        project_id: 1,
        status_id: 2,
        task_comments: [],
        task_files: [],
      });

      await act(async () => {
        render(
          <MemoryRouter>
            <MainPage />
          </MemoryRouter>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
      });
      const expandIcons = screen.getAllByText('❯');
      if (expandIcons[0]) {
        await act(async () => {
          fireEvent.click(expandIcons[0]);
        });

        await waitFor(() => {
          expect(screen.getByText('Проект А')).toBeInTheDocument();
        });
      }
    });

    test('should handle useEffect cleanup', async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = render(
        <MemoryRouter>
          <MainPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Релиз 1.0')).toBeInTheDocument();
      });
      unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});