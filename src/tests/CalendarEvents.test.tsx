import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CalendarEvents from '@components/CalendarEvents/CalendarEvents';
import { CalendarItem, Meeting } from '@types';

const mockCurrentUser = 1;
const mockEmployeeCalendar: CalendarItem[] = [
  {
    day: '2024-01-01',
    is_vacation: false,
    is_weekend: false,
    task_deadlines: [['Task 1', 'http://task1.com']],
    timesheet: [['10:00:00', 'Дедлайн задачи "Task 2"', 'http://task2.com']],
    active_tasks: [['Task 3', 'http://task3.com']]
  },
  {
    day: '2024-01-02',
    is_vacation: false,
    is_weekend: false,
    task_deadlines: [['Task 4', 'http://task4.com']]
  }
];

const mockMeetings: Meeting[] = [
  {
    id: 1,
    name: 'Team Meeting',
    description: 'Weekly sync',
    date: '2024-01-01T14:00:00',
    creator_id: 1,
    link: 'https://meet.google.com/abc',
    employee_meetings: [
      { employee_id: 1, meeting_id: 1, meeting: {} as Meeting }
    ]
  }
];

describe('CalendarEvents Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('render of component', () => {
    render(
      <CalendarEvents
        currentUser={mockCurrentUser}
        employeeCalendar={mockEmployeeCalendar}
        meetings={mockMeetings}
      />
    );

    expect(screen.getByText('Сегодня')).toBeInTheDocument();
  });

  test('should groups events by dates', async () => {
    render(
      <CalendarEvents
        currentUser={mockCurrentUser}
        employeeCalendar={mockEmployeeCalendar}
        meetings={mockMeetings}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Дедлайн задачи "Task 1"/)).toBeInTheDocument();
      expect(screen.getByText(/Team Meeting/)).toBeInTheDocument();
    });
  });

  test('displays meetings with links', async () => {
    render(
      <CalendarEvents
        currentUser={mockCurrentUser}
        employeeCalendar={mockEmployeeCalendar}
        meetings={mockMeetings}
      />
    );

    await waitFor(() => {
      const link = screen.getByText('https://meet.google.com/abc');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', 'https://meet.google.com/abc');
    });
  });

  test('filters events only for the next 2 weeks', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 20);

    const futureMeeting: Meeting = {
      id: 2,
      name: 'Future Meeting',
      description: 'Far future',
      date: futureDate.toISOString(),
      creator_id: 1,
      link: '',
      employee_meetings: [
        { employee_id: 1, meeting_id: 2, meeting: {} as Meeting }
      ]
    };

    render(
      <CalendarEvents
        currentUser={mockCurrentUser}
        employeeCalendar={[]}
        meetings={[futureMeeting]}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Future Meeting')).not.toBeInTheDocument();
    });
  });

  test('displays "Нет событий" when there are no events', async () => {
    render(
      <CalendarEvents
        currentUser={mockCurrentUser}
        employeeCalendar={[]}
        meetings={[]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('На ближайшие две недели событий нет')).toBeInTheDocument();
    });
  });

  test('highlights a meeting if the highlightedMeetingId is present', async () => {
    const { container } = render(
      <CalendarEvents
        currentUser={mockCurrentUser}
        employeeCalendar={mockEmployeeCalendar}
        meetings={mockMeetings}
        highlightedMeetingId={1}
      />
    );

    await waitFor(() => {
      const highlightedElement = container.querySelector('.event-highlighted');
      expect(highlightedElement).toBeInTheDocument();
    });
  });

  test('removes duplicate tasks by name', async () => {
    const calendarWithDuplicates: CalendarItem[] = [
      {
        day: '2024-01-01',
        is_vacation: false,
        is_weekend: false,
        task_deadlines: [['Duplicate Task', 'http://duplicate.com']],
        timesheet: [['10:00:00', 'Дедлайн задачи "Duplicate Task"', 'http://duplicate.com']],
        active_tasks: [['Duplicate Task', 'http://duplicate.com']]
      }
    ];

    render(
      <CalendarEvents
        currentUser={mockCurrentUser}
        employeeCalendar={calendarWithDuplicates}
        meetings={[]}
      />
    );

    await waitFor(() => {
      const taskElements = screen.getAllByText(/Duplicate Task/);
      expect(taskElements.length).toBe(1);
    });
  });

  test('sorts events by time', async () => {
    const meetings: Meeting[] = [
      {
        id: 1,
        name: 'Morning Meeting',
        description: '',
        date: '2024-01-01T09:00:00',
        creator_id: 1,
        link: '',
        employee_meetings: [{ employee_id: 1, meeting_id: 1, meeting: {} as Meeting }]
      },
      {
        id: 2,
        name: 'Afternoon Meeting',
        description: '',
        date: '2024-01-01T14:00:00',
        creator_id: 1,
        link: '',
        employee_meetings: [{ employee_id: 1, meeting_id: 2, meeting: {} as Meeting }]
      }
    ];

    render(
      <CalendarEvents
        currentUser={mockCurrentUser}
        employeeCalendar={[]}
        meetings={meetings}
      />
    );

    await waitFor(() => {
      const meetingElements = screen.getAllByText(/Meeting/);
      expect(meetingElements[0]).toHaveTextContent(/Morning/);
      expect(meetingElements[1]).toHaveTextContent(/Afternoon/);
    });
  });
});