import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import OfficesList from '@components/OfficesList/OfficesList';
import { Department, Employee } from '@types';

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

jest.mock('@components/OfficeModal/OfficeModal', () => ({
  OfficeModal: ({ isOpen, onClose, onSubmit, initialData }: any) =>
    isOpen ? (
      <div data-testid="office-modal">
        <div>Editing: {initialData?.name}</div>
        <button
          data-testid="submit-office-modal"
          onClick={() => onSubmit?.({ id: initialData?.id, name: 'Updated Name' }, 'department')}
        >
          Save Changes
        </button>
        <button
          data-testid="close-office-modal"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    ) : null
}));

jest.mock('@icons/SearchIcon.svg', () => 'search-icon.svg');

const mockEmployees: Employee[] = [
  {
    id: '1',
    role_id: 1,
    fname: 'John',
    lname: 'Doe',
    mname: '',
    position: 'Team Lead',
    email: 'john@test.com',
    phone: '1234567890',
    employee_meetengs: null,
    schedule: {} as any,
    employee_departments: []
  },
  {
    id: '2',
    role_id: 2,
    fname: 'Jane',
    lname: 'Smith',
    mname: '',
    position: 'Developer',
    email: 'jane@test.com',
    phone: '0987654321',
    employee_meetengs: null,
    schedule: {} as any,
    employee_departments: []
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
    employee_departments: []
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
      },
      {
        department_id: 1,
        employee_id: 2,
        office: 'Development',
        employee: mockEmployees[1]
      }
    ]
  },
  {
    id: 2,
    name: 'Design',
    lead_id: 3,
    lead: mockEmployees[2],
    staff: [
      {
        department_id: 2,
        employee_id: 3,
        office: 'Design',
        employee: mockEmployees[2]
      }
    ]
  }
];

const defaultProps = {
  items: mockDepartments,
  employees: mockEmployees,
  onEmployeeSelect: jest.fn(),
  onDepartmentUpdate: jest.fn().mockResolvedValue(true)
};

describe('OfficesList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('render a list of departments', () => {
    render(<OfficesList {...defaultProps} />);

    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Поиск офисов и сотрудников')).toBeInTheDocument();
  });

  test('expands and collapses a section on click', () => {
    render(<OfficesList {...defaultProps} />);

    expect(screen.queryByTestId('employee-1')).not.toBeInTheDocument();

    const firstDepartment = screen.getByText('Development').closest('.office-header');
    if (firstDepartment) {
      fireEvent.click(firstDepartment);
    }

    expect(screen.getByTestId('employee-1')).toBeInTheDocument();
    expect(screen.getByTestId('employee-2')).toBeInTheDocument();

    if (firstDepartment) {
      fireEvent.click(firstDepartment);
    }

    expect(screen.queryByTestId('employee-1')).not.toBeInTheDocument();
  });

  test('displays the information button only when the compartment is open', () => {
    render(<OfficesList {...defaultProps} />);

    const infoButtons = screen.queryAllByText('ℹ');
    expect(infoButtons).toHaveLength(0);

    const departmentHeader = screen.getByText('Development').closest('.office-header');
    if (departmentHeader) {
      fireEvent.click(departmentHeader);
    }

    const infoButton = screen.getByText('ℹ');
    expect(infoButton).toBeInTheDocument();
  });

  test('opens a modal window when you click on the information button', async () => {
    render(<OfficesList {...defaultProps} />);

    const departmentHeader = screen.getByText('Development').closest('.office-header');
    if (departmentHeader) {
      fireEvent.click(departmentHeader);
    }

    const infoButton = screen.getByText('ℹ');
    fireEvent.click(infoButton);

    await waitFor(() => {
      expect(screen.getByTestId('office-modal')).toBeInTheDocument();
      expect(screen.getByText('Editing: Development')).toBeInTheDocument();
    });
  });

  test('closes the modal', async () => {
    render(<OfficesList {...defaultProps} />);

    const departmentHeader = screen.getByText('Development').closest('.office-header');
    if (departmentHeader) {
      fireEvent.click(departmentHeader);
    }

    const infoButton = screen.getByText('ℹ');
    fireEvent.click(infoButton);

    await waitFor(() => {
      expect(screen.getByTestId('office-modal')).toBeInTheDocument();
    });

    const closeButton = screen.getByTestId('close-office-modal');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('office-modal')).not.toBeInTheDocument();
    });
  });

  test('calls onDepartmentUpdate when saving changes', async () => {
    render(<OfficesList {...defaultProps} />);

    const departmentHeader = screen.getByText('Development').closest('.office-header');
    if (departmentHeader) {
      fireEvent.click(departmentHeader);
    }

    const infoButton = screen.getByText('ℹ');
    fireEvent.click(infoButton);

    await waitFor(() => {
      expect(screen.getByTestId('office-modal')).toBeInTheDocument();
    });

    const saveButton = screen.getByTestId('submit-office-modal');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(defaultProps.onDepartmentUpdate).toHaveBeenCalledWith(
        { id: 1, name: 'Updated Name' },
        'department'
      );
    });
  });

  test('processes a click on an employee', () => {
    render(<OfficesList {...defaultProps} />);

    const departmentHeader = screen.getByText('Development').closest('.office-header');
    if (departmentHeader) {
      fireEvent.click(departmentHeader);
    }

    const employeeButton = screen.getByTestId('employee-1');
    fireEvent.click(employeeButton);

    expect(defaultProps.onEmployeeSelect).toHaveBeenCalledWith(mockEmployees[0]);
  });

  test('filters departments by search query', () => {
    render(<OfficesList {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Поиск офисов и сотрудников');
    fireEvent.change(searchInput, { target: { value: 'Develop' } });

    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.queryByText('Design')).not.toBeInTheDocument();
  });

  test('filters departments by employee name', () => {
    render(<OfficesList {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Поиск офисов и сотрудников');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.queryByText('Design')).not.toBeInTheDocument();
  });

  test('filters departments by employee position', () => {
    render(<OfficesList {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Поиск офисов и сотрудников');
    fireEvent.change(searchInput, { target: { value: 'Designer' } });

    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.queryByText('Development')).not.toBeInTheDocument();
  });

  test('displays the message "Ничего не найдено" when there are no results', () => {
    render(<OfficesList {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Поиск офисов и сотрудников');
    fireEvent.change(searchInput, { target: { value: 'Несуществующий отдел' } });

    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
  });

  test('clears the search when you click the clear button', () => {
    render(<OfficesList {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Поиск офисов и сотрудников');
    fireEvent.change(searchInput, { target: { value: 'Develop' } });

    expect(searchInput).toHaveValue('Develop');

    const clearButton = screen.getByText('×');
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
  });

  test('displays a tooltip with the managers name when hovering over the information button', async () => {
    render(<OfficesList {...defaultProps} />);

    const departmentHeader = screen.getByText('Development').closest('.office-header');
    if (departmentHeader) {
      fireEvent.click(departmentHeader);
    }

    const infoButton = screen.getByText('ℹ');
    fireEvent.mouseEnter(infoButton);

    await waitFor(() => {
      expect(screen.getByText(/Руководитель:/)).toBeInTheDocument();
      expect(screen.getByText(/Doe John/)).toBeInTheDocument();
    });

    fireEvent.mouseLeave(infoButton);

    await waitFor(() => {
      expect(screen.queryByText(/Руководитель:/)).not.toBeInTheDocument();
    });
  });

  test('correctly handles departments without employees', () => {
    const emptyDepartment: Department[] = [
      {
        id: 3,
        name: 'Empty Department',
        lead_id: 0,
        lead: {} as Employee,
        staff: []
      }
    ];

    render(<OfficesList {...defaultProps} items={emptyDepartment} />);

    expect(screen.getByText('Empty Department')).toBeInTheDocument();

    const departmentHeader = screen.getByText('Empty Department').closest('.office-header');
    if (departmentHeader) {
      fireEvent.click(departmentHeader);
    }

    expect(screen.getByTestId('employees-list')).toBeInTheDocument();
  });

  test('correctly processes departments with invalid employee data', () => {
    const invalidDepartment: Department[] = [
      {
        id: 4,
        name: 'Invalid Department',
        lead_id: 0,
        lead: {} as Employee,
        staff: [
          null as any,
          {
            department_id: 4,
            employee_id: 999,
            office: 'Invalid',
            employee: null as any
          }
        ]
      }
    ];

    render(<OfficesList {...defaultProps} items={invalidDepartment} />);

    expect(screen.getByText('Invalid Department')).toBeInTheDocument();

    const departmentHeader = screen.getByText('Invalid Department').closest('.office-header');
    if (departmentHeader) {
      fireEvent.click(departmentHeader);
    }

    expect(screen.getByTestId('employees-list')).toBeInTheDocument();
  });

  test('does not call the handler when clicking on information if the department is not expanded', () => {
    render(<OfficesList {...defaultProps} />);

    const infoButtons = screen.queryAllByText('ℹ');
    expect(infoButtons).toHaveLength(0);

    expect(screen.queryByTestId('office-modal')).not.toBeInTheDocument();
  });

  test('updates the list when the items props change', () => {
    const { rerender } = render(<OfficesList {...defaultProps} />);

    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();

    const newDepartments: Department[] = [
      {
        id: 5,
        name: 'New Department',
        lead_id: 1,
        lead: mockEmployees[0],
        staff: []
      }
    ];

    rerender(<OfficesList {...defaultProps} items={newDepartments} />);

    expect(screen.getByText('New Department')).toBeInTheDocument();
    expect(screen.queryByText('Development')).not.toBeInTheDocument();
    expect(screen.queryByText('Design')).not.toBeInTheDocument();
  });
});