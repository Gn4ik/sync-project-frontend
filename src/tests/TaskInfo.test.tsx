import { mockTasksAPI } from './mocks/apiMocks';
jest.mock('@icons/LinkIcon.svg', () => 'test-svg');

jest.mock('@utils/api', () => ({
  tasksAPI: mockTasksAPI,
}));

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TaskInfo from '../components/TaskInfo/TaskInfo';
import { Employee, Schedule, TaskItem, Status, ProjectItem, CalendarItem, Meeting } from '@types';

const mockSchedule: Schedule = {
  id: 1,
  sun_id: 1,
  mon_id: 1,
  tue_id: 1,
  wed_id: 1,
  thu_id: 1,
  fri_id: 1,
  sat_id: 1,
  sun: {
    starttime: '09:00',
    endtime: '18:00',
    launchbreak_start: '13:00',
    launchbreak_end: '14:00'
  },
  mon: {
    starttime: '09:00',
    endtime: '18:00',
    launchbreak_start: '13:00',
    launchbreak_end: '14:00'
  },
  tue: {
    starttime: '09:00',
    endtime: '18:00',
    launchbreak_start: '13:00',
    launchbreak_end: '14:00'
  },
  wed: {
    starttime: '09:00',
    endtime: '18:00',
    launchbreak_start: '13:00',
    launchbreak_end: '14:00'
  },
  thu: {
    starttime: '09:00',
    endtime: '18:00',
    launchbreak_start: '13:00',
    launchbreak_end: '14:00'
  },
  fri: {
    starttime: '09:00',
    endtime: '18:00',
    launchbreak_start: '13:00',
    launchbreak_end: '14:00'
  },
  sat: {
    starttime: '09:00',
    endtime: '18:00',
    launchbreak_start: '13:00',
    launchbreak_end: '14:00'
  }
};

jest.mock('@components/Preloader', () => {
  return function MockPreloader() {
    return <div data-testid="preloader">Loading...</div>;
  };
});

describe('TaskInfo Component', () => {
  const mockAuthor: Employee = {
    id: '1',
    fname: 'Иван',
    lname: 'Иванов',
    mname: '',
    position: 'Разработчик',
    role_id: 3,
    employee_meetengs: null,
    schedule: mockSchedule,
    employee_departments: [],
  };

  const mockSelectedTask: TaskItem = {
    id: 1,
    name: 'Тестовая задача',
    description: 'Описание тестовой задачи',
    created_at: '2024-01-15T10:00:00Z',
    start_date: '2024-01-15T10:00:00Z',
    end_date: '2024-01-31T18:00:00Z',
    status_id: 1,
    status: { alias: 'В работе', id: 1 },
    executor_id: 1,
    creator_id: 2,
    project_id: 1,
    task_comments: [
      {
        id: 1,
        author_id: 1,
        text: 'Тестовый комментарий',
        created_at: '2024-01-15T11:00:00Z',
        task_id: 1,
        author: mockAuthor,
      },
    ],
    task_files: [
      {
        task_id: 1,
        file_id: 1,
        file: {
          id: 1,
          name: 'test_document.pdf',
          extension: '.pdf',
          source: 'test',
        },
      },
    ],
  };

  const mockStatuses: Status[] = [
    { id: 1, alias: 'К выполнению' },
    { id: 2, alias: 'В работе' },
    { id: 3, alias: 'На проверке' },
    { id: 4, alias: 'Завершен' },
  ];

  const mockEmployees: Employee[] = [
    {
      id: '1',
      fname: 'Иван',
      lname: 'Иванов',
      mname: '',
      position: 'Разработчик',
      role_id: 3,
      employee_meetengs: null,
      schedule: mockSchedule,
      employee_departments: [],
    },
    {
      id: '2',
      fname: 'Петр',
      lname: 'Петров',
      mname: '',
      position: 'Тестировщик',
      role_id: 3,
      employee_meetengs: null,
      schedule: mockSchedule,
      employee_departments: [],
    },
  ];

  const mockProjects: ProjectItem[] = [
    {
      id: 1,
      name: 'Проект 1',
      description: '',
      created_at: '',
      status_id: 1,
      manager_id: 1,
      release_id: 1,
      tasks: [],
    },
    {
      id: 2,
      name: 'Проект 2',
      description: '',
      created_at: '',
      status_id: 1,
      manager_id: 1,
      release_id: 1,
      tasks: [],
    },
  ];

  const mockEmployeeCalendar: CalendarItem[] = [
    {
      day: '2024-01-15',
      is_vacation: false,
      is_weekend: false,
    },
  ];

  const mockMeetings: Meeting[] = [
    {
      id: 1,
      name: 'Встреча 1',
      date: '2024-01-15T14:00:00Z',
      link: 'http://test.com',
      description: '',
      creator_id: 1,
      employee_meetings: [],
    },
  ];

  const defaultProps = {
    selectedTask: mockSelectedTask,
    userRole: 'executor' as 'executor' | 'manager' | 'admin' | null,
    userId: 1,
    statuses: mockStatuses,
    employees: mockEmployees,
    projects: mockProjects,
    employeeCalendar: mockEmployeeCalendar,
    meetings: mockMeetings,
    onStatusChange: jest.fn(),
    onTaskUpdate: jest.fn(),
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('auth_token', 'test-token');
    jest.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic rendering', () => {
    test('should render task information through TaskInfoUI', () => {
      render(<TaskInfo {...defaultProps} />);

      expect(screen.getByTestId('task-info-ui')).toBeInTheDocument();
      expect(screen.getByTestId('task-title')).toHaveTextContent('Тестовая задача');
      expect(screen.getByTestId('task-status')).toHaveTextContent('В работе');
      expect(screen.getByTestId('calendar')).toBeInTheDocument();
    });

    test('should show loading state when loading prop is true', () => {
      render(<TaskInfo {...defaultProps} loading={true} />);

      expect(screen.getByTestId('preloader')).toBeInTheDocument();
      expect(screen.queryByTestId('task-info-ui')).not.toBeInTheDocument();
    });

    test('should handle null selected task', () => {
      render(<TaskInfo {...defaultProps} selectedTask={null} />);
      expect(screen.getByTestId('task-info-ui')).toBeInTheDocument();
      expect(screen.getByText('Выберите задачу для просмотра информации')).toBeInTheDocument();
    });
  });

  describe('UI interactions', () => {
    test('should handle status dropdown toggle', () => {
      render(<TaskInfo {...defaultProps} />);

      const toggleButton = screen.getByTestId('toggle-dropdown-btn');

      expect(screen.queryByTestId('status-dropdown')).not.toBeInTheDocument();

      fireEvent.click(toggleButton);
      expect(screen.getByTestId('status-dropdown')).toBeInTheDocument();
      expect(screen.getAllByTestId('status-change-btn')).toHaveLength(4);

      fireEvent.click(toggleButton);
      expect(screen.queryByTestId('status-dropdown')).not.toBeInTheDocument();
    });

    test('should handle status change', () => {
      const mockOnStatusChange = jest.fn();
      render(
        <TaskInfo
          {...defaultProps}
          onStatusChange={mockOnStatusChange}
        />
      );

      const toggleButton = screen.getByTestId('toggle-dropdown-btn');
      fireEvent.click(toggleButton);

      const statusButtons = screen.getAllByTestId('status-change-btn');
      const statusToChange = statusButtons[2];
      fireEvent.click(statusToChange);

      expect(mockOnStatusChange).toHaveBeenCalledWith(1, 3);
      expect(screen.queryByTestId('status-dropdown')).not.toBeInTheDocument();
    });

    test('should handle manager popup toggle for manager role', () => {
      render(<TaskInfo {...defaultProps} userRole="manager" />);

      const toggleButton = screen.getByTestId('manager-edit-button');

      expect(screen.queryByTestId('popup-content')).not.toBeInTheDocument();

      fireEvent.click(toggleButton);
      expect(screen.getByTestId('popup-content')).toBeInTheDocument();
      expect(screen.getByTestId('edit-task-btn')).toBeInTheDocument();
      expect(screen.getByTestId('delete-task-btn')).toBeInTheDocument();

      fireEvent.click(toggleButton);
      expect(screen.queryByTestId('popup-content')).not.toBeInTheDocument();
    });

    test('should handle textarea input and submit', async () => {
      localStorage.setItem('auth_token', 'test-token-123');
      mockTasksAPI.commentTask.mockResolvedValue({ ok: true });

      const mockOnTaskUpdate = jest.fn();
      render(
        <TaskInfo
          {...defaultProps}
          onTaskUpdate={mockOnTaskUpdate}
        />
      );

      const textarea = screen.getByTestId('comment-textarea');
      const submitButton = screen.getByTestId('comment-submit-btn');

      expect(submitButton).toBeDisabled();

      await act(async () => {
        fireEvent.input(textarea, { target: { value: 'Новый комментарий' } });
      });

      expect(textarea).toHaveValue('Новый комментарий');
      expect(submitButton).not.toBeDisabled();

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockTasksAPI.commentTask).toHaveBeenCalledWith(1, 'Новый комментарий');
        expect(mockOnTaskUpdate).toHaveBeenCalledWith('comment');
      });
    });

    test('should handle click outside dropdown', () => {
      render(<TaskInfo {...defaultProps} />);

      const toggleButton = screen.getByTestId('toggle-dropdown-btn');
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('status-dropdown')).toBeInTheDocument();

      const event = new MouseEvent('mousedown', { bubbles: true });
      act(() => {
        document.dispatchEvent(event);
      });

      expect(screen.queryByTestId('status-dropdown')).not.toBeInTheDocument();
    });
  });

  describe('Manager actions', () => {
    test('should manager edit button disable for executor role', () => {
      render(<TaskInfo {...defaultProps} userRole="executor" />);
      expect(screen.queryByTestId('manager-edit-button')).not.toBeInTheDocument();
    });

    test('should open edit modal when manager clicks edit', async () => {
      render(<TaskInfo {...defaultProps} userRole="manager" />);

      fireEvent.click(screen.getByTestId("manager-edit-button"));

      const editButton = screen.getByTestId('edit-task-btn');
      fireEvent.click(editButton);

      expect(screen.getByText('Редактировать задачу')).toBeInTheDocument();
      expect(console.log).toHaveBeenCalledWith('Редактировать задачу:', 1);
    });

    test('should open delete modal when manager clicks delete', async () => {
      render(<TaskInfo {...defaultProps} userRole="manager" />);

      fireEvent.click(screen.getByTestId("manager-edit-button"));

      const deleteButton = screen.getByTestId('delete-task-btn');
      fireEvent.click(deleteButton);

      expect(screen.getByText('Удаление задачи')).toBeInTheDocument();
      expect(console.log).toHaveBeenCalledWith('Удалить задачу:', 1);
    });

    test('should allow status change for task executor', () => {
      render(<TaskInfo {...defaultProps} userRole="executor" userId={1} />);

      const toggleButton = screen.getByTestId('toggle-dropdown-btn');
      fireEvent.click(toggleButton);

      expect(screen.getByTestId('status-dropdown')).toBeInTheDocument();
    });

    test('should not allow status change for non-executor', () => {
      render(<TaskInfo {...defaultProps} userRole="executor" userId={999} />);

      const toggleButton = screen.getByTestId('toggle-dropdown-btn');
      fireEvent.click(toggleButton);

      expect(screen.queryByTestId('status-dropdown')).not.toBeInTheDocument();
      expect(screen.queryByTestId('status-change-btn')).not.toBeInTheDocument();
    });
  });

  describe('API interactions - success cases', () => {
    test('should handle successful comment submission', async () => {
      mockTasksAPI.commentTask.mockClear();
      mockTasksAPI.commentTask.mockResolvedValue({ ok: true });

      const mockOnTaskUpdate = jest.fn();
      render(
        <TaskInfo
          {...defaultProps}
          onTaskUpdate={mockOnTaskUpdate}
        />
      );

      const textarea = screen.getByTestId('comment-textarea');
      const submitButton = screen.getByTestId('comment-submit-btn');

      expect(submitButton).toBeDisabled();

      await act(async () => {
        fireEvent.input(textarea, { target: { value: 'Тестовый комментарий' } });
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(submitButton).not.toBeDisabled();

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockTasksAPI.commentTask).toHaveBeenCalledWith(1, 'Тестовый комментарий');
        expect(mockOnTaskUpdate).toHaveBeenCalledWith('comment');
      }, { timeout: 2000 });
    });

    test('should handle successful task edit', async () => {
      mockTasksAPI.updateTask.mockResolvedValue({ ok: true });
      mockTasksAPI.getTasksById.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ...mockSelectedTask, name: 'Обновленная задача' })
      });

      const mockOnTaskUpdate = jest.fn();
      render(
        <TaskInfo
          {...defaultProps}
          userRole="manager"
          onTaskUpdate={mockOnTaskUpdate}
        />
      );

      fireEvent.click(screen.getByTestId("manager-edit-button"));
      fireEvent.click(screen.getByTestId('edit-task-btn'));

      const saveButton = screen.getByText('Сохранить');
      await act(async () => {
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(mockTasksAPI.updateTask).toHaveBeenCalled();
        expect(mockOnTaskUpdate).toHaveBeenCalledWith('edit');
      });
    });

    test('should handle successful task deletion', async () => {
      mockTasksAPI.deleteTask.mockResolvedValue({ ok: true });

      const mockOnTaskUpdate = jest.fn();
      render(
        <TaskInfo
          {...defaultProps}
          userRole="manager"
          onTaskUpdate={mockOnTaskUpdate}
        />
      );

      fireEvent.click(screen.getByTestId("manager-edit-button"));
      fireEvent.click(screen.getByTestId('delete-task-btn'));

      const confirmButton = screen.getByText('Удалить');
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockTasksAPI.deleteTask).toHaveBeenCalledWith(1);
        expect(mockOnTaskUpdate).toHaveBeenCalledWith('delete');
      });
    });

    test('should handle successful file download', async () => {
      const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      };

      mockTasksAPI.getTaskFiles.mockResolvedValue(mockResponse);

      const originalCreateObjectURL = global.URL.createObjectURL;
      const mockCreateObjectURL = jest.fn(() => 'blob:test-url');
      global.URL.createObjectURL = mockCreateObjectURL;

      const mockClick = jest.fn();
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn().mockImplementation((tagName) => {
        if (tagName === 'a') {
          const link = originalCreateElement.call(document, tagName);
          link.click = mockClick;
          return link;
        }
        return originalCreateElement.call(document, tagName);
      });

      render(<TaskInfo {...defaultProps} />);

      const downloadButton = screen.getByTestId('file-download-btn');

      await act(async () => {
        fireEvent.click(downloadButton);
      });

      await waitFor(() => {
        expect(mockTasksAPI.getTaskFiles).toHaveBeenCalledWith(1);
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });

      global.URL.createObjectURL = originalCreateObjectURL;
      document.createElement = originalCreateElement;
    });
  });

  describe('Error handling', () => {
    test('should handle comment submission error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      mockTasksAPI.commentTask.mockRejectedValue(new Error('Network error'));

      const mockOnTaskUpdate = jest.fn();
      const { debug } = render(
        <TaskInfo
          {...defaultProps}
          onTaskUpdate={mockOnTaskUpdate}
        />
      );

      const textarea = screen.getByTestId('comment-textarea');
      const submitButton = screen.getByTestId('comment-submit-btn');

      await act(async () => {
        fireEvent.input(textarea, { target: { value: 'Тестовый комментарий' } });
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(submitButton).not.toBeDisabled();

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Ошибка сети:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    test('should handle edit task error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      mockTasksAPI.updateTask.mockRejectedValue(new Error('Network error'));

      const mockOnTaskUpdate = jest.fn();
      render(
        <TaskInfo
          {...defaultProps}
          userRole="manager"
          onTaskUpdate={mockOnTaskUpdate}
        />
      );

      fireEvent.click(screen.getByTestId("manager-edit-button"));
      fireEvent.click(screen.getByTestId('edit-task-btn'));

      const saveButton = screen.getByText('Сохранить');
      await act(async () => {
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Ошибка сети:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });

    test('should handle delete task error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      mockTasksAPI.deleteTask.mockRejectedValue(new Error('Network error'));

      const mockOnTaskUpdate = jest.fn();
      render(
        <TaskInfo
          {...defaultProps}
          userRole="manager"
          onTaskUpdate={mockOnTaskUpdate}
        />
      );

      fireEvent.click(screen.getByTestId("manager-edit-button"));
      fireEvent.click(screen.getByTestId('delete-task-btn'));

      const confirmButton = screen.getByText('Удалить');
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Ошибка сети:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });

    test('should handle file download error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      mockTasksAPI.getTaskFiles.mockRejectedValue(new Error('Download failed'));

      render(<TaskInfo {...defaultProps} />);

      const downloadButton = screen.getByTestId('file-download-btn');

      await act(async () => {
        fireEvent.click(downloadButton);
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error downloading file:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });

    test('should handle missing auth token', async () => {
      localStorage.removeItem('auth_token');

      const mockOnTaskUpdate = jest.fn();
      render(
        <TaskInfo
          {...defaultProps}
          onTaskUpdate={mockOnTaskUpdate}
        />
      );

      const textarea = screen.getByTestId('comment-textarea');
      const submitButton = screen.getByTestId('comment-submit-btn');

      await act(async () => {
        fireEvent.input(textarea, { target: { value: 'Тестовый комментарий' } });
        fireEvent.click(submitButton);
      });

      expect(mockTasksAPI.commentTask).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    test('should handle task without comments', () => {
      const taskWithoutComments: TaskItem = {
        ...mockSelectedTask,
        task_comments: [],
      };

      render(<TaskInfo {...defaultProps} selectedTask={taskWithoutComments} />);
      expect(screen.getByTestId('task-info-ui')).toBeInTheDocument();
      expect(screen.getByTestId('comment-textarea')).toBeInTheDocument();
    });

    test('should handle task without files', () => {
      const taskWithoutFiles: TaskItem = {
        ...mockSelectedTask,
        task_files: [],
      };

      render(<TaskInfo {...defaultProps} selectedTask={taskWithoutFiles} />);
      expect(screen.getByTestId('task-info-ui')).toBeInTheDocument();
      expect(screen.queryByTestId('file-download-btn')).not.toBeInTheDocument();
    });

    test('should handle invalid date string', () => {
      const taskWithInvalidDate: TaskItem = {
        ...mockSelectedTask,
        created_at: 'invalid-date',
        end_date: 'invalid-date',
      };

      render(<TaskInfo {...defaultProps} selectedTask={taskWithInvalidDate} />);
      expect(screen.getByTestId('task-info-ui')).toBeInTheDocument();
      const invalidDateElements = screen.getAllByText('NaN undefined NaN');
      expect(invalidDateElements).toHaveLength(2);

    });

    test('should handle empty statuses array', () => {
      render(<TaskInfo {...defaultProps} statuses={[]} />);
      expect(screen.getByTestId('task-info-ui')).toBeInTheDocument();
      const toggleButton = screen.getByTestId('toggle-dropdown-btn');
      fireEvent.click(toggleButton);

      expect(screen.queryByTestId('status-change-btn')).not.toBeInTheDocument();
    });

    test('should handle manager role with different user IDs', () => {
      render(<TaskInfo {...defaultProps} userRole="manager" userId={999} />);

      const toggleButton = screen.getByTestId('toggle-dropdown-btn');
      fireEvent.click(toggleButton);

      expect(screen.getByTestId('status-dropdown')).toBeInTheDocument();
      expect(screen.getAllByTestId('status-change-btn')).toHaveLength(4);
    });

    test('should handle task with bullet points in description', () => {
      const taskWithBullets: TaskItem = {
        ...mockSelectedTask,
        description: '- Пункт 1\n- Пункт 2\nОбычный текст'
      };

      render(<TaskInfo {...defaultProps} selectedTask={taskWithBullets} />);
      expect(screen.getByTestId('task-info-ui')).toBeInTheDocument();

      expect(screen.getByText('Пункт 1')).toBeInTheDocument();
      expect(screen.getByText('Пункт 2')).toBeInTheDocument();
      expect(screen.getByText('Обычный текст')).toBeInTheDocument();
    });
  });

  describe('Modal interactions', () => {
    test('should close edit modal', async () => {
      render(<TaskInfo {...defaultProps} userRole="manager" />);

      fireEvent.click(screen.getByTestId("manager-edit-button"));
      fireEvent.click(screen.getByTestId('edit-task-btn'));

      expect(screen.getByText('Редактировать задачу')).toBeInTheDocument();

      const cancelButton = screen.getByText('Отменить');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Редактировать задачу')).not.toBeInTheDocument();
      });
    });

    test('should close delete modal', async () => {
      render(<TaskInfo {...defaultProps} userRole="manager" />);

      fireEvent.click(screen.getByTestId("manager-edit-button"));
      fireEvent.click(screen.getByTestId('delete-task-btn'));
      expect(screen.getByText('Удаление задачи')).toBeInTheDocument();

      const cancelButton = screen.getByText('Отменить');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Удаление задачи')).not.toBeInTheDocument();
      });
    });
  });
});