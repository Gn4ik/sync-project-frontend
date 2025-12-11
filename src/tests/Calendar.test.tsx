import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Calendar from '@components/Calendar/Calendar';
import { TaskItem } from '@components/types';

describe('Calendar Component', () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const defaultProps = {
    currentUserId: 1,
    employeeCalendar: [],
    meetings: [],
  };

  test('should render calendar with current month and year', () => {
    render(<Calendar {...defaultProps} />);

    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    expect(screen.getByText(`${months[currentMonth]} ${currentYear}`)).toBeInTheDocument();
  });

  test('should render all days of the week', () => {
    render(<Calendar {...defaultProps} />);

    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    weekDays.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  test('should navigate to previous month', () => {
    render(<Calendar {...defaultProps} />);

    const prevButton = screen.getByLabelText('Предыдущий месяц');
    fireEvent.click(prevButton);

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    expect(screen.getByText(`${months[prevMonth]} ${prevYear}`)).toBeInTheDocument();
  });

  test('should navigate to next month', () => {
    render(<Calendar {...defaultProps} />);

    const nextButton = screen.getByLabelText('Следующий месяц');
    fireEvent.click(nextButton);

    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    expect(screen.getByText(`${months[nextMonth]} ${nextYear}`)).toBeInTheDocument();
  });

  test('should highlight today', () => {
    render(<Calendar {...defaultProps} />);

    const today = currentDate.getDate();
    const todayElement = screen.getByText(today.toString()).closest('.calendar-day');
    expect(todayElement).toHaveClass('today');
  });

  describe('Events rendering', () => {
    const mockEvents = [
      {
        id: '1',
        title: 'Тестовая встреча',
        date: new Date(),
        type: 'meeting' as const,
        time: '14:00',
      },
      {
        id: '2',
        title: 'Дедлайн задачи',
        date: new Date(),
        type: 'deadline' as const,
      },
    ];

    test('should show events on correct days', () => {
      render(<Calendar {...defaultProps} events={mockEvents} />);

      const today = currentDate.getDate();
      const dayElement = screen.getByText(today.toString()).closest('.calendar-day');
      expect(dayElement).toHaveClass('has-events');
    });

    test('should show tooltip on hover for days with events', () => {
      render(<Calendar {...defaultProps} events={mockEvents} />);

      const today = currentDate.getDate();
      const dayElement = screen.getByText(today.toString()).closest('.calendar-day');

      expect(dayElement).toHaveClass('has-events');
    });
  });

  describe('Task deadline highlighting', () => {
    test('should highlight task deadline day', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const taskWithDeadline: TaskItem = {
        id: 1,
        name: 'Тестовая задача',
        end_date: tomorrow.toISOString(),
        status: { id: 0, alias: 'В работе' },
        created_at: '',
        description: '',
        project_id: 0,
        creator_id: 0,
        executor_id: 0,
        start_date: '',
        status_id: 0,
        task_comments: [],
        task_files: []
      };

      render(
        <Calendar
          {...defaultProps}
          task={taskWithDeadline}
        />
      );

      const tomorrowDay = tomorrow.getDate();
      const dayElement = screen.getByText(tomorrowDay.toString());
      expect(dayElement.closest('.calendar-day')).toHaveClass('calendar-day-deadline');
    });
  });

  describe('Vacation days', () => {
    test('should mark vacation days', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      render(
        <Calendar
          {...defaultProps}
          vacationDays={[tomorrow]}
        />
      );

      const tomorrowDay = tomorrow.getDate();
      const dayElement = screen.getByText(tomorrowDay.toString());
      expect(dayElement.closest('.calendar-day')).toHaveClass('vacation-day');
    });
  });

  describe('Calendar status classes', () => {
    test('should apply correct status class', () => {

      const taskWithStatus: TaskItem = {
        id: 1,
        name: 'Тестовая задача',
        end_date: new Date().toISOString(),
        status: { id: 0, alias: 'На проверке' },
        created_at: '',
        description: '',
        project_id: 0,
        creator_id: 0,
        executor_id: 0,
        start_date: '',
        status_id: 0,
        task_comments: [],
        task_files: []
      };

      render(
        <Calendar
          {...defaultProps}
          task={taskWithStatus}
          status="on-review"
        />
      );

      const calendarElement = screen.getByLabelText('Предыдущий месяц').closest('.calendar');
      expect(calendarElement).toHaveClass('border-on-review');
    });
  });
});