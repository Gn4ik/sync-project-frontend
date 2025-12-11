import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmployeeModal } from '@components/EmployeeModal/EmployeeModal';
import { Employee, Department, Schedule } from '@types';

const mockDepartments: Department[] = [
  { id: 1, name: 'Development', lead_id: 1, lead: {} as Employee, staff: [] },
  { id: 2, name: 'Marketing', lead_id: 2, lead: {} as Employee, staff: [] }
];

const mockSchedules: Schedule[] = [
  {
    id: 0,
    sun_id: 0, mon_id: 1, tue_id: 1, wed_id: 1, thu_id: 1, fri_id: 1, sat_id: 0,
    mon: {} as any, tue: {} as any, wed: {} as any, thu: {} as any,
    fri: {} as any, sat: {} as any, sun: {} as any
  }
];

const mockOnClose = jest.fn();
const mockOnSubmit = jest.fn().mockResolvedValue(true);

const mockAlert = jest.fn();
global.alert = mockAlert;

jest.useFakeTimers();

async function fillValidDefaultData() {
  fireEvent.change(screen.getByPlaceholderText('Введите ФИО сотрудника'), {
    target: { value: 'Пупкин Васька Игнатович' }
  });

  fireEvent.change(screen.getByPlaceholderText('Введите должность'), {
    target: { value: 'Developer' }
  });

  fireEvent.change(screen.getByPlaceholderText('user@example.com'), {
    target: { value: 'test@syncproj.ru' }
  });

  fireEvent.change(screen.getByPlaceholderText('+79051534857'), {
    target: { value: '+79999999999' }
  });

  fireEvent.change(screen.getByLabelText('Дата рождения:'), {
    target: { value: '1990-01-01' }
  });

  fireEvent.change(screen.getByLabelText('Расписание:'), {
    target: { value: '0' }
  });

  fireEvent.change(screen.getByPlaceholderText('Введите пароль'), {
    target: { value: 'Abcdef1!' }
  });

  const checkbox = screen.getAllByRole('checkbox')[0];
  fireEvent.click(checkbox);

  fireEvent.change(
    screen.getByPlaceholderText('Введите офис (например: Каб. 417)'),
    { target: { value: 'Каб. 123' } }
  );
}

describe('EmployeeModal validation', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = mockAlert;
  });

  test('validates empty full name', async () => {
    render(
      <EmployeeModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="create"
        departments={mockDepartments}
        schedules={mockSchedules}
      />
    );

    await fillValidDefaultData();

    fireEvent.change(screen.getByTestId('fullName'), { target: { value: '' } });
    fireEvent.submit(screen.getByTestId('modal-form'));

    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith(
        'Введите ФИО через пробел'
      )
    );
  });

  test('validates incorrect email domain', async () => {
    render(
      <EmployeeModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="create"
        departments={mockDepartments}
        schedules={mockSchedules}
      />
    );

    await fillValidDefaultData();

    fireEvent.change(screen.getByPlaceholderText('user@example.com'), {
      target: { value: 'wrong@gmail.com' }
    });

    fireEvent.click(screen.getByTestId('modal-submit-btn'));

    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith(
        'Email должен оканчиваться на @syncproj.ru'
      )
    );
  });

  test('validates incorrect phone format', async () => {
    render(
      <EmployeeModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="create"
        departments={mockDepartments}
        schedules={mockSchedules}
      />
    );

    await fillValidDefaultData();

    fireEvent.change(screen.getByPlaceholderText('+79051534857'), {
      target: { value: '+712345' }
    });

    fireEvent.click(screen.getByTestId('modal-submit-btn'));

    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith(
        'Телефон должен быть формата +7XXXXXXXXXX и содержать 10 цифр после 7'
      )
    );
  });

  test('validates age under 18', async () => {
    render(
      <EmployeeModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="create"
        departments={mockDepartments}
        schedules={mockSchedules}
      />
    );

    await fillValidDefaultData();

    fireEvent.change(screen.getByLabelText('Дата рождения:'), {
      target: { value: '2010-01-01' }
    });

    fireEvent.click(screen.getByTestId('modal-submit-btn'));

    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith(
        'Сотруднику должно быть не менее 18 лет'
      )
    );
  });

  test('validates weak password', async () => {
    render(
      <EmployeeModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="create"
        departments={mockDepartments}
        schedules={mockSchedules}
      />
    );

    await fillValidDefaultData();

    fireEvent.change(screen.getByPlaceholderText('Введите пароль'), {
      target: { value: 'abc' }
    });

    fireEvent.click(screen.getByTestId('modal-submit-btn'));

    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith(
        'Пароль должен быть не менее 8 символов, содержать верхний и нижний регистр, число и спецсимвол'
      )
    );
  });

  test('validates empty password in create mode', async () => {
    render(
      <EmployeeModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="create"
        departments={mockDepartments}
        schedules={mockSchedules}
      />
    );

    await fillValidDefaultData();
    const passwordInput = screen.getByPlaceholderText('Введите пароль');
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.submit(screen.getByTestId('modal-form'));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Пожалуйста, введите пароль');
    });
  });

  test('validates empty departments', async () => {
    render(
      <EmployeeModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="create"
        departments={mockDepartments}
        schedules={mockSchedules}
      />
    );

    await fillValidDefaultData();

    fireEvent.click(screen.getByLabelText('Development'));
    fireEvent.click(screen.getByTestId('modal-submit-btn'));

    await waitFor(() =>
      expect(mockAlert).toHaveBeenCalledWith('Выберите хотя бы один отдел')
    );
  });

  test('submits valid form successfully', async () => {
    mockOnSubmit.mockResolvedValue(true);

    render(
      <EmployeeModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="create"
        departments={mockDepartments}
        schedules={mockSchedules}
      />
    );

    await fillValidDefaultData();

    fireEvent.click(screen.getByTestId('modal-submit-btn'));

    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalled());
  });

  test('handles edit mode with initial data', async () => {
    const initialData: Employee = {
      id: '1',
      lname: 'Иванов',
      fname: 'Иван',
      mname: 'Иванович',
      dob: '1990-01-01T00:00:00.000Z',
      schedule: { id: 0 } as Schedule,
      position: 'Developer',
      role_id: 3,
      phone: '+79999999999',
      email: 'ivanov@syncproj.ru',
      employee_departments: [],
      employee_meetengs: null
    };

    render(
      <EmployeeModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="edit"
        initialData={initialData}
        departments={mockDepartments}
        schedules={mockSchedules}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('fullName')).toHaveValue('Иванов Иван Иванович');
    });
    expect(screen.getByDisplayValue('Developer')).toBeInTheDocument();

    expect(screen.queryByPlaceholderText('Введите пароль')).not.toBeInTheDocument();
  });

  test('handles select all departments functionality', async () => {
    render(
      <EmployeeModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="create"
        departments={mockDepartments}
        schedules={mockSchedules}
      />
    );

    const selectAllButton = screen.getByText('Выбрать все');
    fireEvent.click(selectAllButton);

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked();
    });

    await waitFor(() => {
      expect(screen.getByTestId('office-input-1')).toBeInTheDocument();
      expect(screen.getByTestId('office-input-2')).toBeInTheDocument();
    });

    const deselectAllButton = screen.getByText('Снять все');
    fireEvent.click(deselectAllButton);

    checkboxes.forEach(checkbox => {
      expect(checkbox).not.toBeChecked();
    });
  });

  test('handles department toggle and office input', async () => {
    render(
      <EmployeeModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="create"
        departments={mockDepartments}
        schedules={mockSchedules}
      />
    );

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.getByTestId('office-input-1')).toBeInTheDocument();
    });

    const officeInput = screen.getByTestId('office-input-1');
    fireEvent.change(officeInput, { target: { value: 'Каб. 404' } });
    expect(officeInput).toHaveValue('Каб. 404');

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.queryByTestId('office-input-1')).not.toBeInTheDocument();
    });
  });

  test('handles form field changes', async () => {
    render(
      <EmployeeModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="create"
        departments={mockDepartments}
        schedules={mockSchedules}
      />
    );

    const fullNameInput = screen.getByTestId('fullName');
    fireEvent.change(fullNameInput, { target: { value: 'Тестов Тест Тестович' } });
    expect(fullNameInput).toHaveValue('Тестов Тест Тестович');

    const positionInput = screen.getByPlaceholderText('Введите должность');
    fireEvent.change(positionInput, { target: { value: 'Senior Developer' } });
    expect(positionInput).toHaveValue('Senior Developer');

    const emailInput = screen.getByPlaceholderText('user@example.com');
    fireEvent.change(emailInput, { target: { value: 'new@syncproj.ru' } });
    expect(emailInput).toHaveValue('new@syncproj.ru');

    const phoneInput = screen.getByPlaceholderText('+79051534857');
    fireEvent.change(phoneInput, { target: { value: '+79001112233' } });
    expect(phoneInput).toHaveValue('+79001112233');

    const birthDateInput = screen.getByLabelText('Дата рождения:');
    fireEvent.change(birthDateInput, { target: { value: '1985-05-15' } });
    expect(birthDateInput).toHaveValue('1985-05-15');

    const roleSelect = screen.getByLabelText('Роль:');
    fireEvent.change(roleSelect, { target: { value: 'admin' } });
    expect(roleSelect).toHaveValue('admin');

    const passwordInput = screen.getByPlaceholderText('Введите пароль');
    fireEvent.change(passwordInput, { target: { value: 'NewPass123!' } });
    expect(passwordInput).toHaveValue('NewPass123!');
  });

  test('handles modal close', async () => {
    render(
      <EmployeeModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="create"
        departments={mockDepartments}
        schedules={mockSchedules}
      />
    );

    const closeButton = screen.getByTestId('modal-close-btn');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();

    jest.clearAllMocks();
    const cancelButton = screen.getByTestId('modal-cancel-btn');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('handles successful submission and success modal', async () => {
    mockOnSubmit.mockResolvedValue(true);

    render(
      <EmployeeModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="create"
        departments={mockDepartments}
        schedules={mockSchedules}
      />
    );

    await fillValidDefaultData();

    fireEvent.click(screen.getByTestId('modal-submit-btn'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
    act(() => {
      jest.advanceTimersByTime(5000);
    });
  });

  test('handles failed submission', async () => {
    mockOnSubmit.mockResolvedValue(false);

    render(
      <EmployeeModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="create"
        departments={mockDepartments}
        schedules={mockSchedules}
      />
    );

    await fillValidDefaultData();

    fireEvent.click(screen.getByTestId('modal-submit-btn'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

  });

  test('handles component unmounting', async () => {
    const { unmount } = render(
      <EmployeeModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        mode="create"
        departments={mockDepartments}
        schedules={mockSchedules}
      />
    );

    unmount();
    expect(() => unmount()).not.toThrow();
  });
});