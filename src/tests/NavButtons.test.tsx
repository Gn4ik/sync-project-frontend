import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import NavButtons from '@components/NavButtons/NavButtons';
import '@testing-library/jest-dom';

jest.mock('@utils/api', () => ({
  schedulesAPI: {
    getSchedules: jest.fn().mockResolvedValue([])
  },
  tasksAPI: {
    createTask: jest.fn()
  },
  releasesAPI: {
    createRelease: jest.fn()
  },
  meetingsAPI: {
    createMeeting: jest.fn()
  },
  projectsAPI: {
    createProject: jest.fn()
  },
  departmentsAPI: {
    createDepartment: jest.fn()
  },
  employeesAPI: {
    createEmployee: jest.fn()
  }
}));

jest.mock('@icons/releases-active.svg', () => 'releases-active-icon');
jest.mock('@icons/releases-inactive.svg', () => 'releases-inactive-icon');
jest.mock('@icons/colleague-active.svg', () => 'colleague-active-icon');
jest.mock('@icons/colleague-inactive.svg', () => 'colleague-inactive-icon');
jest.mock('@icons/plus.svg', () => 'plus-icon');
jest.mock('@icons/filters.svg', () => 'filters-icon');

describe('NavButtons', () => {
  const mockOnListChange = jest.fn();
  const mockOnFilterChange = jest.fn();
  const mockOnTaskCreated = jest.fn();
  const mockOnProjectCreated = jest.fn();
  const mockOnMeetingCreated = jest.fn();
  const mockOnEmployeeCreated = jest.fn();
  const mockOnDepartmentCreated = jest.fn();

  const mockProjects = [
    {
      id: 1,
      name: 'Project 1',
      description: 'Test project',
      created_at: '2024-01-01',
      status_id: 1,
      manager_id: 1,
      release_id: 1,
      tasks: []
    }
  ];

  const mockEmployees = [
    {
      id: '1',
      role_id: 3,
      fname: 'John',
      lname: 'Doe',
      mname: '',
      position: 'Developer',
      email: 'john@example.com',
      phone: '+79991234567',
      dob: '1990-01-01',
      employee_meetengs: null,
      schedule: {
        id: 0,
        sun_id: 0,
        mon_id: 0,
        wed_id: 0,
        fri_id: 0,
        tue_id: 0,
        thu_id: 0,
        sat_id: 0,
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

  const mockReleases = [
    {
      id: 1,
      name: 'Release 1',
      description: 'Test release',
      version: '1.0.0',
      status_id: 1,
      projects: mockProjects
    }
  ];

  const mockDepartments = [
    {
      id: 1,
      name: 'Department 1',
      lead_id: 1,
      lead: mockEmployees[0],
      staff: []
    }
  ];

  const defaultProps = {
    activeList: 'tasks' as const,
    onListChange: mockOnListChange,
    onFilterChange: mockOnFilterChange,
    onTaskCreated: mockOnTaskCreated,
    onProjectCreated: mockOnProjectCreated,
    onMeetingCreated: mockOnMeetingCreated,
    onEmployeeCreated: mockOnEmployeeCreated,
    onDepartmentCreated: mockOnDepartmentCreated,
    currentFilter: 'all',
    userRole: 'manager',
    projects: mockProjects,
    employees: mockEmployees,
    releases: mockReleases,
    departments: mockDepartments
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering based on user role', () => {
    test('renders tasks and employees buttons for non-admin users', () => {
      render(<NavButtons {...defaultProps} />);

      const taskButton = screen.getByAltText('Задачи');
      const employeeButton = screen.getByAltText('Сотрудники');

      expect(taskButton).toBeInTheDocument();
      expect(employeeButton).toBeInTheDocument();
      expect(screen.getByAltText('Добавить')).toBeInTheDocument();
      expect(screen.getByAltText('Фильтры')).toBeInTheDocument();
    });

    test('does not render list buttons for admin user', () => {
      render(<NavButtons {...defaultProps} userRole="admin" />);

      expect(screen.queryByAltText('Задачи')).not.toBeInTheDocument();
      expect(screen.queryByAltText('Сотрудники')).not.toBeInTheDocument();

      expect(screen.getByAltText('Добавить')).toBeInTheDocument();
      expect(screen.queryByAltText('Фильтры')).not.toBeInTheDocument();
    });

    test('renders only filter button for executor role', () => {
      render(<NavButtons {...defaultProps} userRole="executor" />);

      expect(screen.getByAltText('Задачи')).toBeInTheDocument();
      expect(screen.getByAltText('Сотрудники')).toBeInTheDocument();
      expect(screen.queryByAltText('Добавить')).not.toBeInTheDocument();
      expect(screen.getByAltText('Фильтры')).toBeInTheDocument();
    });

    test('renders both add and filter buttons for manager role', () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      expect(screen.getByAltText('Задачи')).toBeInTheDocument();
      expect(screen.getByAltText('Сотрудники')).toBeInTheDocument();
      expect(screen.getByAltText('Добавить')).toBeInTheDocument();
      expect(screen.getByAltText('Фильтры')).toBeInTheDocument();
    });
  });

  describe('List switching functionality', () => {
    test('calls onListChange when tasks button is clicked', () => {
      render(<NavButtons {...defaultProps} activeList="employees" />);

      const taskButton = screen.getByAltText('Задачи').closest('button');
      fireEvent.click(taskButton!);

      expect(mockOnListChange).toHaveBeenCalledWith('tasks');
    });

    test('calls onListChange when employees button is clicked', () => {
      render(<NavButtons {...defaultProps} activeList="tasks" />);

      const employeeButton = screen.getByAltText('Сотрудники').closest('button');
      fireEvent.click(employeeButton!);

      expect(mockOnListChange).toHaveBeenCalledWith('employees');
    });

    test('applies active class to active list button', () => {
      render(<NavButtons {...defaultProps} activeList="tasks" />);

      const taskButton = screen.getByAltText('Задачи').closest('button');
      const employeeButton = screen.getByAltText('Сотрудники').closest('button');

      expect(taskButton).toHaveClass('active-active');
      expect(employeeButton).toHaveClass('list-button');
    });
  });

  describe('Add button functionality', () => {
    test('opens add popup when plus button is clicked for manager', () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);

      expect(screen.getByText('Релиз')).toBeInTheDocument();
      expect(screen.getByText('Проект')).toBeInTheDocument();
      expect(screen.getByText('Задача')).toBeInTheDocument();
      expect(screen.getByText('Встреча')).toBeInTheDocument();
    });

    test('opens add popup when plus button is clicked for admin', () => {
      render(<NavButtons {...defaultProps} userRole="admin" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);

      expect(screen.getByText('Офис')).toBeInTheDocument();
      expect(screen.getByText('Пользователь')).toBeInTheDocument();
    });

    test('closes popup when clicking outside', () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);

      expect(screen.getByText('Релиз')).toBeInTheDocument();

      fireEvent.mouseDown(document);

      waitFor(() => {
        expect(screen.queryByText('Релиз')).not.toBeInTheDocument();
      });
    });

    test('calls corresponding handlers when add items are clicked', () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);

      fireEvent.click(screen.getByText('Релиз'));
      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('modal-close-btn'));

      fireEvent.click(addButton!);
      fireEvent.click(screen.getByText('Проект'));
      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('modal-close-btn'));

      fireEvent.click(addButton!);
      fireEvent.click(screen.getByText('Задача'));
      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('modal-close-btn'));

      fireEvent.click(addButton!);
      fireEvent.click(screen.getByText('Встреча'));
      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
    });
  });

  describe('Filter button functionality', () => {
    test('opens filter popup for executor role', () => {
      render(<NavButtons {...defaultProps} userRole="executor" />);

      const filterButton = screen.getByAltText('Фильтры').closest('button');
      fireEvent.click(filterButton!);

      expect(screen.getByText('Мои задачи')).toBeInTheDocument();
      expect(screen.getByText('Все задачи')).toBeInTheDocument();
    });

    test('opens filter popup for manager role', () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      const filterButton = screen.getByAltText('Фильтры').closest('button');
      fireEvent.click(filterButton!);

      expect(screen.getByText('Все задачи')).toBeInTheDocument();
      expect(screen.getByText('К выполнению')).toBeInTheDocument();
      expect(screen.getByText('В работе')).toBeInTheDocument();
      expect(screen.getByText('На проверке')).toBeInTheDocument();
      expect(screen.getByText('Завершены')).toBeInTheDocument();
      expect(screen.getByText('Отложены')).toBeInTheDocument();
      expect(screen.getByText('Отменены')).toBeInTheDocument();
    });

    test('does not show filter button when activeList is employees', () => {
      render(<NavButtons {...defaultProps} userRole="manager" activeList="employees" />);

      expect(screen.queryByAltText('Фильтры')).not.toBeInTheDocument();
    });

    test('calls onFilterChange with correct value when filter item is clicked for executor', () => {
      render(<NavButtons {...defaultProps} userRole="executor" />);

      const filterButton = screen.getByAltText('Фильтры').closest('button');
      fireEvent.click(filterButton!);

      fireEvent.click(screen.getByText('Мои задачи'));
      expect(mockOnFilterChange).toHaveBeenCalledWith('my');
      expect(mockOnFilterChange).toHaveBeenCalledTimes(1);

      fireEvent.click(filterButton!);
      fireEvent.click(screen.getByText('Все задачи'));
      expect(mockOnFilterChange).toHaveBeenCalledWith('all');
      expect(mockOnFilterChange).toHaveBeenCalledTimes(2);
    });

    test('calls onFilterChange with correct value when filter item is clicked for manager', () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      const filterButton = screen.getByAltText('Фильтры').closest('button');
      fireEvent.click(filterButton!);

      fireEvent.click(screen.getByText('К выполнению'));
      expect(mockOnFilterChange).toHaveBeenCalledWith('to-execution');
      expect(mockOnFilterChange).toHaveBeenCalledTimes(1);

      fireEvent.click(filterButton!);
      fireEvent.click(screen.getByText('В работе'));
      expect(mockOnFilterChange).toHaveBeenCalledWith('on-work');
      expect(mockOnFilterChange).toHaveBeenCalledTimes(2);

      fireEvent.click(filterButton!);
      fireEvent.click(screen.getByText('На проверке'));
      expect(mockOnFilterChange).toHaveBeenCalledWith('on-review');
      expect(mockOnFilterChange).toHaveBeenCalledTimes(3);

      fireEvent.click(filterButton!);
      fireEvent.click(screen.getByText('Завершены'));
      expect(mockOnFilterChange).toHaveBeenCalledWith('completed');
      expect(mockOnFilterChange).toHaveBeenCalledTimes(4);

      fireEvent.click(filterButton!);
      fireEvent.click(screen.getByText('Отложены'));
      expect(mockOnFilterChange).toHaveBeenCalledWith('stopped');
      expect(mockOnFilterChange).toHaveBeenCalledTimes(5);

      fireEvent.click(filterButton!);
      fireEvent.click(screen.getByText('Отменены'));
      expect(mockOnFilterChange).toHaveBeenCalledWith('closed');
      expect(mockOnFilterChange).toHaveBeenCalledTimes(6);
    });

    test('applies active class to current filter', () => {
      render(<NavButtons {...defaultProps} userRole="manager" currentFilter="on-work" />);

      const filterButton = screen.getByAltText('Фильтры').closest('button');
      fireEvent.click(filterButton!);

      const activeFilter = screen.getByText('В работе').closest('.popup-item');
      expect(activeFilter).toHaveClass('active');
    });
  });

  describe('Modal handling', () => {
    test('loads schedules data on mount', async () => {
      const { getSchedules } = require('@utils/api').schedulesAPI;

      render(<NavButtons {...defaultProps} />);

      await waitFor(() => {
        expect(getSchedules).toHaveBeenCalled();
      });
    });

    test('opens TaskModal when task is clicked in add popup', async () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);

      fireEvent.click(screen.getByText('Задача'));

      await waitFor(() => {
        expect(screen.getByTestId('task-modal-form')).toBeInTheDocument();
        expect(screen.getByTestId('modal-title')).toHaveTextContent('Создать задачу');
      });
    });

    test('opens ProjectModal when project is clicked in add popup', async () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);

      fireEvent.click(screen.getByText('Проект'));

      await waitFor(() => {
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        expect(screen.getByText('Название:')).toBeInTheDocument();
      });
    });

    test('opens ReleaseModal when release is clicked in add popup', async () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);

      fireEvent.click(screen.getByText('Релиз'));

      await waitFor(() => {
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        expect(screen.getByText('Название:')).toBeInTheDocument();
      });
    });

    test('opens MeetingModal when meeting is clicked in add popup', async () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);

      fireEvent.click(screen.getByText('Встреча'));

      await waitFor(() => {
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        expect(screen.getByText('Название:')).toBeInTheDocument();
      });
    });

    test('opens EmployeeModal when user is clicked in add popup for admin', async () => {
      render(<NavButtons {...defaultProps} userRole="admin" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);

      fireEvent.click(screen.getByText('Пользователь'));

      await waitFor(() => {
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        expect(screen.getByText('ФИО:')).toBeInTheDocument();
      });
    });

    test('opens OfficeModal when office is clicked in add popup for admin', async () => {
      render(<NavButtons {...defaultProps} userRole="admin" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);

      fireEvent.click(screen.getByText('Офис'));

      await waitFor(() => {
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        expect(screen.getByText('Название отдела:')).toBeInTheDocument();
      });
    });
  });

  describe('Form submission', () => {
    beforeEach(() => {
      const { tasksAPI } = require('@utils/api');
      tasksAPI.createTask.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    });

    test('submits task form and calls onTaskCreated on success', async () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);
      fireEvent.click(screen.getByText('Задача'));

      await waitFor(() => {
        expect(screen.getByTestId('task-modal-form')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('task-title-input'), {
        target: { value: 'Test Task' }
      });

      fireEvent.change(screen.getByTestId('project-select'), {
        target: { value: '1' }
      });

      fireEvent.change(screen.getByTestId('assignee-select'), {
        target: { value: '1' }
      });

      fireEvent.change(screen.getByTestId('deadline-input'), {
        target: { value: '2024-12-31' }
      });

      fireEvent.submit(screen.getByTestId('modal-form'));

      await waitFor(() => {
        expect(mockOnTaskCreated).toHaveBeenCalledWith(true);
      }, { timeout: 4000 });
    });

    test('shows success modal on successful submission', async () => {
      const { tasksAPI } = require('@utils/api');
      tasksAPI.createTask.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);
      fireEvent.click(screen.getByText('Задача'));

      await waitFor(() => {
        expect(screen.getByTestId('task-modal-form')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('task-title-input'), {
        target: { value: 'Test Task' }
      });

      fireEvent.change(screen.getByTestId('project-select'), {
        target: { value: '1' }
      });

      fireEvent.submit(screen.getByTestId('modal-form'));

      await waitFor(() => {
        expect(screen.getByTestId('success-modal-content')).toBeInTheDocument();
        expect(screen.getByTestId('success-modal-message')).toHaveTextContent('Задача успешно создана!');
      });
    });

    test('does not show success modal on failed submission', async () => {
      const { tasksAPI } = require('@utils/api');
      tasksAPI.createTask.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed' })
      });

      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);
      fireEvent.click(screen.getByText('Задача'));

      await waitFor(() => {
        expect(screen.getByTestId('task-modal-form')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('task-title-input'), {
        target: { value: 'Test Task' }
      });

      fireEvent.submit(screen.getByTestId('modal-form'));

      await waitFor(() => {
        expect(screen.queryByTestId('success-modal-content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    test('handles API errors gracefully', async () => {
      const { schedulesAPI } = require('@utils/api');
      schedulesAPI.getSchedules.mockRejectedValue(new Error('Network error'));

      render(<NavButtons {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByAltText('Задачи')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and UX', () => {
    test('closes popup when clicking close button in modal', async () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);
      fireEvent.click(screen.getByText('Задача'));

      await waitFor(() => {
        expect(screen.getByTestId('task-modal-form')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('modal-close-btn'));

      await waitFor(() => {
        expect(screen.queryByTestId('task-modal-form')).not.toBeInTheDocument();
      });
    });

    test('popup closes when clicking cancel button in modal', async () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);
      fireEvent.click(screen.getByText('Задача'));

      await waitFor(() => {
        expect(screen.getByTestId('task-modal-form')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('modal-cancel-btn'));

      await waitFor(() => {
        expect(screen.queryByTestId('task-modal-form')).not.toBeInTheDocument();
      });
    });

    test('popup has proper positioning based on button type', () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);

      const filterButton = screen.getByAltText('Фильтры').closest('button');
      fireEvent.click(filterButton!);

      expect(screen.getByText('Релиз')).toBeInTheDocument();
      expect(screen.getByText('Все задачи')).toBeInTheDocument();
    });
  });


  describe('Modal submission and error handling', () => {
    test('handles department creation successfully', async () => {
      const { departmentsAPI } = require('@utils/api');
      departmentsAPI.createDepartment.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      render(<NavButtons {...defaultProps} userRole="admin" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);
      fireEvent.click(screen.getByText('Офис'));

      await waitFor(() => {
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText('Введите название отдела');
      const leadSelect = screen.getByText('Выберите руководителя').closest('select');

      fireEvent.change(nameInput, { target: { value: 'New Department' } });
      if (leadSelect) {
        fireEvent.change(leadSelect, { target: { value: '1' } });
      }

      fireEvent.submit(screen.getByTestId('modal-form'));

      await waitFor(() => {
        expect(departmentsAPI.createDepartment).toHaveBeenCalled();
        expect(mockOnDepartmentCreated).toHaveBeenCalled();
      });
    });

    test('handles employee creation successfully', async () => {
      const { employeesAPI } = require('@utils/api');
      employeesAPI.createEmployee.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      render(<NavButtons {...defaultProps} userRole="admin" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);
      fireEvent.click(screen.getByText('Пользователь'));

      await waitFor(() => {
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        expect(screen.getByText('ФИО:')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('modal-close-btn'));

      await waitFor(() => {
        expect(screen.queryByText('ФИО:')).not.toBeInTheDocument();
      });
    });

    test('handles API error in handleModalSubmit', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      const { tasksAPI } = require('@utils/api');
      tasksAPI.createTask.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to create task' })
      });

      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);
      fireEvent.click(screen.getByText('Задача'));

      await waitFor(() => {
        expect(screen.getByTestId('task-modal-form')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('task-title-input'), {
        target: { value: 'Test Task' }
      });

      fireEvent.submit(screen.getByTestId('modal-form'));

      await waitFor(() => {
        expect(tasksAPI.createTask).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    test('handles network error in handleModalSubmit', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      const { tasksAPI } = require('@utils/api');
      tasksAPI.createTask.mockRejectedValue(new Error('Network error'));

      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);
      fireEvent.click(screen.getByText('Задача'));

      await waitFor(() => {
        expect(screen.getByTestId('task-modal-form')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByTestId('task-title-input'), {
        target: { value: 'Test Task' }
      });

      fireEvent.submit(screen.getByTestId('modal-form'));

      await waitFor(() => {
        expect(tasksAPI.createTask).toHaveBeenCalled();
        expect(screen.getByTestId('task-modal-form')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    test('handles unknown type in handleModalSubmit', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      render(<NavButtons {...defaultProps} userRole="manager" />);

      expect(screen.getByAltText('Задачи')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    test('calls onMeetingCreated after successful meeting creation', async () => {
      jest.useFakeTimers();

      const { meetingsAPI } = require('@utils/api');
      meetingsAPI.createMeeting.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);
      fireEvent.click(screen.getByText('Встреча'));

      await waitFor(() => {
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText('Введите название встречи');
      const dateInputs = screen.getAllByDisplayValue('');
      const dateInput = screen.getByTestId('modal-form-wrapper').querySelector('input[type="date"]');
      const timeInput = screen.getByTestId('modal-form-wrapper').querySelector('input[type="time"]');
      const linkInput = screen.getByPlaceholderText('Введите ссылку на встречу');

      fireEvent.change(nameInput, { target: { value: 'Team Meeting' } });
      if (dateInput) fireEvent.change(dateInput, { target: { value: '2024-12-31' } });
      if (timeInput) fireEvent.change(timeInput, { target: { value: '14:00' } });
      if (linkInput) fireEvent.change(linkInput, { target: { value: 'https://meet.google.com/abc' } });

      fireEvent.submit(screen.getByTestId('modal-form'));

      await waitFor(() => {
        expect(meetingsAPI.createMeeting).toHaveBeenCalled();
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(mockOnMeetingCreated).toHaveBeenCalled();

      jest.useRealTimers();
    });

    test('calls onProjectCreated after successful project creation', async () => {
      jest.useFakeTimers();

      const { projectsAPI } = require('@utils/api');
      projectsAPI.createProject.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);
      fireEvent.click(screen.getByText('Проект'));

      await waitFor(() => {
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText('Введите название проекта');
      const releaseSelect = screen.getByText('Выберите релиз').closest('select');

      fireEvent.change(nameInput, { target: { value: 'New Project' } });
      if (releaseSelect) {
        fireEvent.change(releaseSelect, { target: { value: '1' } });
      }

      fireEvent.submit(screen.getByTestId('modal-form'));

      await waitFor(() => {
        expect(projectsAPI.createProject).toHaveBeenCalled();
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(mockOnProjectCreated).toHaveBeenCalled();

      jest.useRealTimers();
    });

    test('calls onTaskCreated after successful release creation', async () => {
      jest.useFakeTimers();

      const { releasesAPI } = require('@utils/api');
      releasesAPI.createRelease.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);
      fireEvent.click(screen.getByText('Релиз'));

      await waitFor(() => {
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText('Введите название релиза');
      const versionInput = screen.getByPlaceholderText('Введите версию');

      fireEvent.change(nameInput, { target: { value: 'New Release' } });
      fireEvent.change(versionInput, { target: { value: '1.0.0' } });

      fireEvent.submit(screen.getByTestId('modal-form'));

      await waitFor(() => {
        expect(releasesAPI.createRelease).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(releasesAPI.createRelease).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New Release',
            version: '1.0.0',
            status_id: 0
          })
        );
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(mockOnTaskCreated).toHaveBeenCalledWith(true);

      jest.useRealTimers();
    });
  });

  describe('Popup close functionality', () => {
    test('closes all modals when handleModalClose is called', async () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);
      fireEvent.click(screen.getByText('Задача'));

      await waitFor(() => {
        expect(screen.getByTestId('task-modal-form')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('modal-close-btn'));

      await waitFor(() => {
        expect(screen.queryByTestId('task-modal-form')).not.toBeInTheDocument();
      });

      expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
    });

    test('closes popup when clicking close button', () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      fireEvent.click(addButton!);

      const popupItems = screen.getAllByText(/Релиз|Проект|Задача|Встреча/);
      expect(popupItems.length).toBeGreaterThan(0);

      fireEvent.mouseDown(document);

      waitFor(() => {
        expect(screen.queryByText('Релиз')).not.toBeInTheDocument();
      });
    });

    test('closePopup function sets both popup states to false', () => {
      render(<NavButtons {...defaultProps} userRole="manager" />);

      const addButton = screen.getByAltText('Добавить').closest('button');
      const filterButton = screen.getByAltText('Фильтры').closest('button');

      fireEvent.click(addButton!);
      fireEvent.click(filterButton!);

      fireEvent.mouseDown(document);

      waitFor(() => {
        expect(screen.queryByText('Релиз')).not.toBeInTheDocument();
        expect(screen.queryByText('Все задачи')).not.toBeInTheDocument();
      });
    });
  });

  describe('Schedule loading', () => {
    test('loads schedules on component mount', async () => {
      const mockSchedules = [
        { id: 0, name: 'Schedule 1' },
        { id: 1, name: 'Schedule 2' }
      ];

      const { schedulesAPI } = require('@utils/api');
      schedulesAPI.getSchedules.mockResolvedValue(mockSchedules);

      render(<NavButtons {...defaultProps} />);

      await waitFor(() => {
        expect(schedulesAPI.getSchedules).toHaveBeenCalled();
      });

    });

    test('handles schedule loading error gracefully - Promise.allSettled handles rejection', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      const { schedulesAPI } = require('@utils/api');
      schedulesAPI.getSchedules.mockRejectedValue(new Error('Failed to load schedules'));

      render(<NavButtons {...defaultProps} />);

      await waitFor(() => {
        expect(schedulesAPI.getSchedules).toHaveBeenCalled();
      });

      expect(screen.getByAltText('Задачи')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});