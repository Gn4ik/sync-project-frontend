import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmployeeInfo from '@components/EmployeeInfo/EmployeeInfo';
import { Employee, Department, Schedule } from '@types';

jest.mock('@utils/api', () => ({
  schedulesAPI: {
    getSchedules: jest.fn()
  },
  employeesAPI: {
    updateEmployee: jest.fn(),
    getEmployeeById: jest.fn()
  }
}));

const mockDepartments: Department[] = [
  {
    id: 1,
    name: 'Development',
    lead_id: 1,
    lead: {} as Employee,
    staff: [
      {
        department_id: 1,
        employee_id: 1,
        office: 'Office 1',
        employee: {} as Employee
      }
    ]
  }
];

const mockSchedule: Schedule = {
  id: 1,
  mon_id: 1,
  tue_id: 1,
  wed_id: 1,
  thu_id: 1,
  fri_id: 1,
  sat_id: 0,
  sun_id: 0,
  mon: {
    starttime: '09:00:00',
    endtime: '18:00:00',
    launchbreak_start: '13:00:00',
    launchbreak_end: '14:00:00'
  },
  tue: {
    starttime: '09:00:00',
    endtime: '18:00:00',
    launchbreak_start: '13:00:00',
    launchbreak_end: '14:00:00'
  },
  wed: {
    starttime: '09:00:00',
    endtime: '18:00:00',
    launchbreak_start: '13:00:00',
    launchbreak_end: '14:00:00'
  },
  thu: {
    starttime: '09:00:00',
    endtime: '18:00:00',
    launchbreak_start: '13:00:00',
    launchbreak_end: '14:00:00'
  },
  fri: {
    starttime: '09:00:00',
    endtime: '18:00:00',
    launchbreak_start: '13:00:00',
    launchbreak_end: '14:00:00'
  },
  sat: {
    starttime: '00:00:00',
    endtime: '00:00:00',
    launchbreak_start: '00:00:00',
    launchbreak_end: '00:00:00'
  },
  sun: {
    starttime: '00:00:00',
    endtime: '00:00:00',
    launchbreak_start: '00:00:00',
    launchbreak_end: '00:00:00'
  }
};

const mockEmployee: Employee = {
  id: '1',
  fname: 'John',
  lname: 'Doe',
  mname: 'Smith',
  position: 'Developer',
  role_id: 1,
  email: 'john@example.com',
  phone: '+1234567890',
  dob: '1990-01-01',
  schedule: mockSchedule,
  employee_departments: [],
  employee_meetengs: null,
  vacations: [
    {
      id: 1,
      start_day: '2024-12-20',
      end_day: '2024-12-31',
      employee_id: 1
    }
  ]
};

describe('EmployeeInfo Component', () => {
  const mockOnEmployeeEdit = jest.fn();
  const mockOnEmployeeUpdate = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:00:00'));
    localStorage.setItem('auth_token', 'test-token');
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('render info about employee', () => {
    render(
      <EmployeeInfo
        selectedEmployee={mockEmployee}
        userRole="executor"
        departments={mockDepartments}
        onEmployeeEdit={mockOnEmployeeEdit}
        onEmployeeUpdate={mockOnEmployeeUpdate}
      />
    );

    expect(screen.getByText('Doe John Smith')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
  });

  test('render employee status', () => {
    render(
      <EmployeeInfo
        selectedEmployee={mockEmployee}
        userRole="executor"
        departments={mockDepartments}
      />
    );

    expect(screen.getByText(/Статус:/)).toBeInTheDocument();
  });

  test('render employee schedule', () => {
    render(
      <EmployeeInfo
        selectedEmployee={mockEmployee}
        userRole="executor"
        departments={mockDepartments}
      />
    );

    expect(screen.getByText('Расписание')).toBeInTheDocument();
    expect(screen.getByText('Понедельник')).toBeInTheDocument();
  });

  test('enable edit button for admin', () => {
    render(
      <EmployeeInfo
        selectedEmployee={mockEmployee}
        userRole="admin"
        departments={mockDepartments}
      />
    );

    const adminButton = screen.getByRole('button', { name: '' });
    expect(adminButton).toBeInTheDocument();
  });

  test('disable edit button for manager or executor', () => {
    render(
      <EmployeeInfo
        selectedEmployee={mockEmployee}
        userRole="executor"
        departments={mockDepartments}
      />
    );

    const adminButton = screen.queryByRole('button', { name: '' });
    expect(adminButton).not.toBeInTheDocument();
  });

  test('open popup for edit employee', () => {
    render(
      <EmployeeInfo
        selectedEmployee={mockEmployee}
        userRole="admin"
        departments={mockDepartments}
      />
    );

    const adminButton = screen.getByRole('button', { name: '' });
    fireEvent.click(adminButton);

    expect(screen.getByText('Изменить')).toBeInTheDocument();
  });

  test('render department and office of employee', () => {
    render(
      <EmployeeInfo
        selectedEmployee={mockEmployee}
        userRole="executor"
        departments={mockDepartments}
      />
    );

    expect(screen.getByText(/Офис:/)).toBeInTheDocument();
  });

  test('dob formatter', () => {
    render(
      <EmployeeInfo
        selectedEmployee={mockEmployee}
        userRole="user"
        departments={mockDepartments}
      />
    );

    expect(screen.getByText('1 января 1990')).toBeInTheDocument();
  });

  test('processes an employee on vacation', () => {
    jest.setSystemTime(new Date('2024-12-25T10:00:00'));

    render(
      <EmployeeInfo
        selectedEmployee={mockEmployee}
        userRole="user"
        departments={mockDepartments}
      />
    );

    expect(screen.getByText('В отпуске')).toBeInTheDocument();
  });

  test('handles employee absence', () => {
    render(
      <EmployeeInfo
        selectedEmployee={null}
        userRole="user"
        departments={mockDepartments}
      />
    );

    expect(screen.getByText('Выберите сотрудника для просмотра информации')).toBeInTheDocument();
  });

  test('update status every minute', async () => {
    render(
      <EmployeeInfo
        selectedEmployee={mockEmployee}
        userRole="user"
        departments={mockDepartments}
      />
    );

    const initialStatus = screen.getByText('На работе');
    expect(initialStatus).toBeInTheDocument();

    jest.advanceTimersByTime(60000);

    await waitFor(() => {
      expect(screen.getByText('На работе')).toBeInTheDocument();
    });
  });
});