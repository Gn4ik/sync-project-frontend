import React from 'react';
jest.mock('@icons/SearchIcon.svg', () => 'test-svg');
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmployeesList from '@components/EmployeesList/EmployeesList';
import { Employee } from '@types';

const mockEmployees: Employee[] = [
  {
    id: '1',
    fname: 'John',
    lname: 'Doe',
    mname: 'Smith',
    position: 'Frontend Developer',
    role_id: 1,
    email: 'john@example.com',
    phone: '+1234567890',
    dob: '1990-01-01',
    schedule: {} as any,
    employee_departments: [],
    employee_meetengs: null
  },
  {
    id: '2',
    fname: 'Jane',
    lname: 'Smith',
    mname: '',
    position: 'Backend Developer',
    role_id: 2,
    email: 'jane@example.com',
    phone: '+0987654321',
    dob: '1992-05-15',
    schedule: {} as any,
    employee_departments: [],
    employee_meetengs: null
  }
];

describe('EmployeesList Component', () => {
  const mockOnItemClick = jest.fn();
  const mockOnActiveEmployeeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders a list of employees', () => {
    render(
      <EmployeesList
        items={mockEmployees}
        onItemClick={mockOnItemClick}
        activeEmployeeId={null}
        onActiveEmployeeChange={mockOnActiveEmployeeChange}
      />
    );

    expect(screen.getByText('Doe John Smith')).toBeInTheDocument();
    expect(screen.getByText('Smith Jane')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Backend Developer')).toBeInTheDocument();
  });

  test('filters employees by search query', () => {
    render(
      <EmployeesList
        items={mockEmployees}
        onItemClick={mockOnItemClick}
        activeEmployeeId={null}
        onActiveEmployeeChange={mockOnActiveEmployeeChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Поиск сотрудников');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(screen.getByText('Doe John Smith')).toBeInTheDocument();
    expect(screen.queryByText('Smith Jane')).not.toBeInTheDocument();
  });

  test('the search works across different fields', () => {
    render(
      <EmployeesList
        items={mockEmployees}
        onItemClick={mockOnItemClick}
        activeEmployeeId={null}
        onActiveEmployeeChange={mockOnActiveEmployeeChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Поиск сотрудников');

    fireEvent.change(searchInput, { target: { value: 'John' } });
    expect(screen.getByText('Doe John Smith')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Doe' } });
    expect(screen.getByText('Doe John Smith')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Frontend' } });
    expect(screen.getByText('Doe John Smith')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'john@example.com' } });
    expect(screen.getByText('Doe John Smith')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '+1234567890' } });
    expect(screen.getByText('Doe John Smith')).toBeInTheDocument();
  });

  test('displays the active employee', () => {
    render(
      <EmployeesList
        items={mockEmployees}
        onItemClick={mockOnItemClick}
        activeEmployeeId="1"
        onActiveEmployeeChange={mockOnActiveEmployeeChange}
      />
    );

    const activeItem = screen.getByText('Doe John Smith').closest('.employee-item');
    expect(activeItem).toHaveClass('active');
  });

  test('calls the click handler for an employee', () => {
    render(
      <EmployeesList
        items={mockEmployees}
        onItemClick={mockOnItemClick}
        activeEmployeeId={null}
        onActiveEmployeeChange={mockOnActiveEmployeeChange}
      />
    );

    const employeeItem = screen.getByText('Doe John Smith');
    fireEvent.click(employeeItem.closest('.employee-item')!);

    expect(mockOnItemClick).toHaveBeenCalledWith(mockEmployees[0]);
    expect(mockOnActiveEmployeeChange).toHaveBeenCalledWith('1');
  });

  test('clears the search query', () => {
    render(
      <EmployeesList
        items={mockEmployees}
        onItemClick={mockOnItemClick}
        activeEmployeeId={null}
        onActiveEmployeeChange={mockOnActiveEmployeeChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Поиск сотрудников');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(searchInput).toHaveValue('John');

    const clearButton = screen.getByText('×');
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
    expect(screen.getByText('Smith Jane')).toBeInTheDocument();
  });

  test('displays an avatar or placeholder', () => {
    const employeesWithAvatar = [
      {
        ...mockEmployees[0],
        avatar: 'https://example.com/avatar.jpg'
      },
      {
        ...mockEmployees[1],
        avatar: undefined
      }
    ];

    render(
      <EmployeesList
        items={employeesWithAvatar}
        onItemClick={mockOnItemClick}
        activeEmployeeId={null}
        onActiveEmployeeChange={mockOnActiveEmployeeChange}
      />
    );

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);

    const placeholder = screen.getByText('J');
    expect(placeholder).toBeInTheDocument();
  });

  test('displays a message when there are no results', () => {
    render(
      <EmployeesList
        items={mockEmployees}
        onItemClick={mockOnItemClick}
        activeEmployeeId={null}
        onActiveEmployeeChange={mockOnActiveEmployeeChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Поиск сотрудников');
    fireEvent.change(searchInput, { target: { value: 'NonExistentName' } });

    expect(screen.getByText('Сотрудники не найдены')).toBeInTheDocument();
  });

  test('case-insensitive search', () => {
    render(
      <EmployeesList
        items={mockEmployees}
        onItemClick={mockOnItemClick}
        activeEmployeeId={null}
        onActiveEmployeeChange={mockOnActiveEmployeeChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Поиск сотрудников');
    fireEvent.change(searchInput, { target: { value: 'JOHN' } });

    expect(screen.getByText('Doe John Smith')).toBeInTheDocument();
  });

  test('handles searches with spaces', () => {
    render(
      <EmployeesList
        items={mockEmployees}
        onItemClick={mockOnItemClick}
        activeEmployeeId={null}
        onActiveEmployeeChange={mockOnActiveEmployeeChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Поиск сотрудников');
    fireEvent.change(searchInput, { target: { value: '  John  ' } });

    expect(screen.getByText('Doe John Smith')).toBeInTheDocument();
  });

  test('processes an empty list of employees', () => {
    render(
      <EmployeesList
        items={[]}
        onItemClick={mockOnItemClick}
        activeEmployeeId={null}
        onActiveEmployeeChange={mockOnActiveEmployeeChange}
      />
    );

    expect(screen.queryByText('Doe John Smith')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Поиск сотрудников')).toBeInTheDocument();
  });
});