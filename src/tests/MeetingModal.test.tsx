import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MeetingModal } from '@components/MeetingModal/MeetingModal';
import { Employee } from '@types';

jest.mock('@components/Modal/Modal', () => ({
  Modal: ({
    isOpen,
    onClose,
    onSubmit,
    title,
    children,
    submitButtonText
  }: any) =>
    isOpen ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <button data-testid="modal-submit" onClick={onSubmit}>
          {submitButtonText}
        </button>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null
}));

jest.mock('@components/SuccessModal/SuccessModal', () => ({
  SuccessModal: ({ isOpen, handleSuccessClose, message }: any) =>
    isOpen ? (
      <div data-testid="success-modal">
        <div data-testid="success-message">{message()}</div>
        <button data-testid="success-close" onClick={handleSuccessClose}>
          Close Success
        </button>
      </div>
    ) : null
}));

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
    schedule: {} as any,
    employee_departments: [],
    vacations: []
  },
  {
    id: '2',
    role_id: 2,
    fname: 'Jane',
    lname: 'Smith',
    mname: 'Marie',
    position: 'Manager',
    email: 'jane@test.com',
    phone: '0987654321',
    employee_meetengs: null,
    schedule: {} as any,
    employee_departments: [],
    vacations: []
  },
  {
    id: '3',
    role_id: 3,
    fname: 'Bob',
    lname: 'Johnson',
    mname: '',
    position: 'Designer',
    email: 'bob@test.com',
    phone: '5555555555',
    employee_meetengs: null,
    schedule: {} as any,
    employee_departments: [],
    vacations: []
  }
];

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn().mockResolvedValue(true),
  onMeetingsUpdate: jest.fn(),
  mode: 'create' as const,
  employees: mockEmployees
};

const mockInitialData = {
  name: 'Test Meeting',
  employees: ['1', '2'],
  meetingDate: '2024-12-20',
  meetingTime: '14:30',
  description: 'Test meeting description',
  link: 'https://test-meeting.com'
};

describe('MeetingModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders create meeting modal', () => {
    render(<MeetingModal {...defaultProps} />);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Создать встречу');
    expect(screen.getByPlaceholderText('Введите название встречи')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Поиск сотрудников...')).toBeInTheDocument();
  });

  test('renders edit meeting modal', () => {
    render(
      <MeetingModal
        {...defaultProps}
        mode="edit"
        initialData={mockInitialData}
      />
    );

    expect(screen.getByTestId('modal-title')).toHaveTextContent('Редактировать встречу');
    expect(screen.getByDisplayValue('Test Meeting')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-12-20')).toBeInTheDocument();
    expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://test-meeting.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test meeting description')).toBeInTheDocument();
  });

  test('closes modal', () => {
    render(<MeetingModal {...defaultProps} />);

    const closeButton = screen.getByTestId('modal-close');
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('updates form fields', () => {
    render(<MeetingModal {...defaultProps} />);

    const nameInput = screen.getByPlaceholderText('Введите название встречи');
    fireEvent.change(nameInput, { target: { value: 'Новая встреча' } });
    expect(nameInput).toHaveValue('Новая встреча');

    const dateInputs = screen.getAllByDisplayValue('');
    const dateInput = dateInputs.find(input => input.getAttribute('type') === 'date');
    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
      expect(dateInput).toHaveValue('2024-12-25');
    }

    const timeInputs = screen.getAllByDisplayValue('');
    const timeInput = timeInputs.find(input => input.getAttribute('type') === 'time');
    if (timeInput) {
      fireEvent.change(timeInput, { target: { value: '15:00' } });
      expect(timeInput).toHaveValue('15:00');
    }

    const linkInput = screen.getByPlaceholderText('Введите ссылку на встречу');
    fireEvent.change(linkInput, { target: { value: 'https://new-meeting.com' } });
    expect(linkInput).toHaveValue('https://new-meeting.com');

    const descriptionInput = screen.getByPlaceholderText('Введите описание');
    fireEvent.change(descriptionInput, { target: { value: 'Новое описание' } });
    expect(descriptionInput).toHaveValue('Новое описание');
  });

  test('shows employee dropdown on participants input focus', () => {
    render(<MeetingModal {...defaultProps} />);

    const participantsInput = screen.getByPlaceholderText('Поиск сотрудников...');
    fireEvent.focus(participantsInput);

    expect(participantsInput).toBeInTheDocument();
    fireEvent.change(participantsInput, { target: { value: 'John' } });
    expect(participantsInput).toHaveValue('John');
  });

  test('filters employees by search query', () => {
    render(<MeetingModal {...defaultProps} />);

    const participantsInput = screen.getByPlaceholderText('Поиск сотрудников...');
    fireEvent.change(participantsInput, { target: { value: 'John' } });
    expect(participantsInput).toHaveValue('John');
  });

  test('adds and removes participants', () => {
    render(<MeetingModal {...defaultProps} />);

    const participantsInput = screen.getByPlaceholderText('Поиск сотрудников...');
    fireEvent.change(participantsInput, { target: { value: 'Test' } });
    expect(participantsInput).toHaveValue('Test');
  });

  test('submits form with correct data', async () => {
    render(<MeetingModal {...defaultProps} />);

    const nameInput = screen.getByPlaceholderText('Введите название встречи');
    fireEvent.change(nameInput, { target: { value: 'Team Meeting' } });

    const dateInputs = screen.getAllByDisplayValue('');
    const dateInput = dateInputs.find(input => input.getAttribute('type') === 'date');
    const timeInput = dateInputs.find(input => input.getAttribute('type') === 'time');

    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: '2024-12-20' } });
    }

    if (timeInput) {
      fireEvent.change(timeInput, { target: { value: '14:30' } });
    }

    const linkInput = screen.getByPlaceholderText('Введите ссылку на встречу');
    fireEvent.change(linkInput, { target: { value: 'https://meeting.com' } });

    const descriptionInput = screen.getByPlaceholderText('Введите описание');
    fireEvent.change(descriptionInput, { target: { value: 'Team sync meeting' } });

    const submitButton = screen.getByTestId('modal-submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalled();
      const call = defaultProps.onSubmit.mock.calls[0];
      expect(call[0]).toMatchObject({
        name: 'Team Meeting',
        description: 'Team sync meeting',
        link: 'https://meeting.com'
      });
      expect(call[0].date).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:00/);
      expect(call[1]).toBe('meeting');
    });
  });

  test('shows success modal after successful meeting creation', async () => {
    render(<MeetingModal {...defaultProps} />);

    const nameInput = screen.getByPlaceholderText('Введите название встречи');
    fireEvent.change(nameInput, { target: { value: 'Test Meeting' } });

    const dateInputs = screen.getAllByDisplayValue('');
    const dateInput = dateInputs.find(input => input.getAttribute('type') === 'date');
    const timeInput = dateInputs.find(input => input.getAttribute('type') === 'time');

    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: '2024-12-20' } });
    }

    if (timeInput) {
      fireEvent.change(timeInput, { target: { value: '14:30' } });
    }

    const linkInput = screen.getByPlaceholderText('Введите ссылку на встречу');
    fireEvent.change(linkInput, { target: { value: 'https://test.com' } });

    const descriptionInput = screen.getByPlaceholderText('Введите описание');
    fireEvent.change(descriptionInput, { target: { value: 'Test' } });

    const submitButton = screen.getByTestId('modal-submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('success-modal')).toBeInTheDocument();
      expect(screen.getByTestId('success-message')).toHaveTextContent('Встреча успешно создана!');
    });

    expect(defaultProps.onMeetingsUpdate).toHaveBeenCalled();
  });

  test('closes success modal after 5 seconds', async () => {
    render(<MeetingModal {...defaultProps} />);

    const nameInput = screen.getByPlaceholderText('Введите название встречи');
    fireEvent.change(nameInput, { target: { value: 'Test Meeting' } });

    const dateInputs = screen.getAllByDisplayValue('');
    const dateInput = dateInputs.find(input => input.getAttribute('type') === 'date');
    const timeInput = dateInputs.find(input => input.getAttribute('type') === 'time');

    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: '2024-12-20' } });
    }

    if (timeInput) {
      fireEvent.change(timeInput, { target: { value: '14:30' } });
    }

    const linkInput = screen.getByPlaceholderText('Введите ссылку на встречу');
    fireEvent.change(linkInput, { target: { value: 'https://test.com' } });

    const descriptionInput = screen.getByPlaceholderText('Введите описание');
    fireEvent.change(descriptionInput, { target: { value: 'Test' } });

    const submitButton = screen.getByTestId('modal-submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('success-modal')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(5000);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('closes success modal manually', async () => {
    render(<MeetingModal {...defaultProps} />);

    const nameInput = screen.getByPlaceholderText('Введите название встречи');
    fireEvent.change(nameInput, { target: { value: 'Test Meeting' } });

    const dateInputs = screen.getAllByDisplayValue('');
    const dateInput = dateInputs.find(input => input.getAttribute('type') === 'date');
    const timeInput = dateInputs.find(input => input.getAttribute('type') === 'time');

    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: '2024-12-20' } });
    }

    if (timeInput) {
      fireEvent.change(timeInput, { target: { value: '14:30' } });
    }

    const linkInput = screen.getByPlaceholderText('Введите ссылку на встречу');
    fireEvent.change(linkInput, { target: { value: 'https://test.com' } });

    const descriptionInput = screen.getByPlaceholderText('Введите описание');
    fireEvent.change(descriptionInput, { target: { value: 'Test' } });

    const submitButton = screen.getByTestId('modal-submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('success-modal')).toBeInTheDocument();
    });

    const closeButton = screen.getByTestId('success-close');
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('shows success modal with different message for edit mode', async () => {
    render(
      <MeetingModal
        {...defaultProps}
        mode="edit"
        initialData={mockInitialData}
      />
    );

    const submitButton = screen.getByTestId('modal-submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toHaveTextContent('Встреча успешно обновлена!');
    });
  });

  test('clears form when opened in create mode', () => {
    const { rerender } = render(
      <MeetingModal
        {...defaultProps}
        isOpen={false}
      />
    );

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

    rerender(<MeetingModal {...defaultProps} isOpen={true} />);

    expect(screen.getByPlaceholderText('Введите название встречи')).toHaveValue('');
    expect(screen.getByPlaceholderText('Поиск сотрудников...')).toHaveValue('');
    expect(screen.getByPlaceholderText('Введите ссылку на встречу')).toHaveValue('');
    expect(screen.getByPlaceholderText('Введите описание')).toHaveValue('');

    const emptyInputs = screen.getAllByDisplayValue('');
    const dateInput = emptyInputs.find(input => input.getAttribute('type') === 'date');
    const timeInput = emptyInputs.find(input => input.getAttribute('type') === 'time');

    if (dateInput) {
      expect(dateInput).toHaveValue('');
    }

    if (timeInput) {
      expect(timeInput).toHaveValue('');
    }
  });

  test('populates form when opened in edit mode', () => {
    render(
      <MeetingModal
        {...defaultProps}
        mode="edit"
        initialData={mockInitialData}
      />
    );

    expect(screen.getByDisplayValue('Test Meeting')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-12-20')).toBeInTheDocument();
    expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://test-meeting.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test meeting description')).toBeInTheDocument();
  });

  test('handles form submission error', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(false);

    render(
      <MeetingModal
        {...defaultProps}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByPlaceholderText('Введите название встречи');
    fireEvent.change(nameInput, { target: { value: 'Test Meeting' } });

    const dateInputs = screen.getAllByDisplayValue('');
    const dateInput = dateInputs.find(input => input.getAttribute('type') === 'date');
    const timeInput = dateInputs.find(input => input.getAttribute('type') === 'time');

    if (dateInput) {
      fireEvent.change(dateInput, { target: { value: '2024-12-20' } });
    }

    if (timeInput) {
      fireEvent.change(timeInput, { target: { value: '14:30' } });
    }

    const linkInput = screen.getByPlaceholderText('Введите ссылку на встречу');
    fireEvent.change(linkInput, { target: { value: 'https://test.com' } });

    const descriptionInput = screen.getByPlaceholderText('Введите описание');
    fireEvent.change(descriptionInput, { target: { value: 'Test' } });

    const submitButton = screen.getByTestId('modal-submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('success-modal')).not.toBeInTheDocument();
    expect(defaultProps.onMeetingsUpdate).not.toHaveBeenCalled();
  });

  test('filters employees by middle name', () => {
    render(<MeetingModal {...defaultProps} />);

    const participantsInput = screen.getByPlaceholderText('Поиск сотрудников...');
    fireEvent.change(participantsInput, { target: { value: 'Marie' } });
    expect(participantsInput).toHaveValue('Marie');
  });

  test('filters employees by position', () => {
    render(<MeetingModal {...defaultProps} />);

    const participantsInput = screen.getByPlaceholderText('Поиск сотрудников...');
    fireEvent.change(participantsInput, { target: { value: 'Manager' } });
    expect(participantsInput).toHaveValue('Manager');
  });

  test('resets form when closed and reopened', () => {
    const { rerender } = render(
      <MeetingModal
        {...defaultProps}
        isOpen={true}
      />
    );

    const nameInput = screen.getByPlaceholderText('Введите название встречи');
    fireEvent.change(nameInput, { target: { value: 'Test Value' } });
    expect(nameInput).toHaveValue('Test Value');

    rerender(
      <MeetingModal
        {...defaultProps}
        isOpen={false}
      />
    );

    rerender(
      <MeetingModal
        {...defaultProps}
        isOpen={true}
      />
    );

    expect(screen.getByPlaceholderText('Введите название встречи')).toHaveValue('');
  });

  test('checks all required fields', () => {
    render(<MeetingModal {...defaultProps} />);

    expect(screen.getByPlaceholderText('Введите название встречи')).toBeRequired();
    expect(screen.getByPlaceholderText('Поиск сотрудников...')).toBeRequired();
    expect(screen.getByPlaceholderText('Введите ссылку на встречу')).toBeRequired();
    expect(screen.getByPlaceholderText('Введите описание')).toBeRequired();

    const dateInputs = screen.getAllByDisplayValue('');
    const dateInput = dateInputs.find(input => input.getAttribute('type') === 'date');
    const timeInput = dateInputs.find(input => input.getAttribute('type') === 'time');

    if (dateInput) {
      expect(dateInput).toBeRequired();
    }

    if (timeInput) {
      expect(timeInput).toBeRequired();
    }
  });
});