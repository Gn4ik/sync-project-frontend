import React, { useState } from 'react';
import './Calendar.css';
import { TaskItem, TaskStatus, CalendarItem, Meeting } from '@types';

interface CalendarEvent {
  id: string;
  title: string;
  time?: string;
  date: Date;
  type: 'deadline' | 'meeting';
  link?: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
  status?: TaskStatus;
  task?: TaskItem;
  employeeCalendar?: CalendarItem[];
  meetings?: Meeting[];
  currentUserId?: number;
}

const Calendar: React.FC<CalendarProps> = ({
  events = [],
  status = 'primary',
  task,
  employeeCalendar = [],
  meetings = [],
  currentUserId
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getMonthYearString = () => {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const getLastDayOfPreviousMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getEventsFromCalendarData = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    employeeCalendar.forEach(calendarDay => {
      if (calendarDay) {
        const dayDate = new Date(calendarDay.day);

        calendarDay.timesheet?.forEach(([time, description, url], index) => {
          if (description.includes('Собрание')) return;

          events.push({
            id: `timesheet-${calendarDay.day}-${index}`,
            title: description,
            time: time !== '00:00:00' ? time.substring(0, 5) : '',
            date: dayDate,
            type: 'deadline'
          });
        });
      }
    });

    meetings.forEach(meeting => {
      const meetingDate = new Date(meeting.date);

      const isParticipant = meeting.employee_meetings?.some(
        emp => emp.employee_id === currentUserId
      );

      if (isParticipant) {
        const meetingTime = meeting.date.split('T')[1]?.substring(0, 5) || '00:00';

        events.push({
          id: `meeting-${meeting.id}`,
          title: `Встреча: ${meeting.name}`,
          time: meetingTime,
          date: meetingDate,
          type: 'meeting'
        });
      }
    });

    return events;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  const lastDayOfPreviousMonth = getLastDayOfPreviousMonth(year, month);

  const getAllCalendarDays = () => {
    const days: Array<{
      day: number;
      isCurrentMonth: boolean;
      isPreviousMonth?: boolean;
      isNextMonth?: boolean;
    }> = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({
        day: lastDayOfPreviousMonth - firstDayOfMonth + i + 1,
        isCurrentMonth: false,
        isPreviousMonth: true
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true
      });
    }

    const totalDays = days.length;
    const remainingDays = totalDays % 7;
    if (remainingDays > 0) {
      const daysToAdd = 7 - remainingDays;
      for (let i = 1; i <= daysToAdd; i++) {
        days.push({
          day: i,
          isCurrentMonth: false,
          isNextMonth: true
        });
      }
    }

    return days;
  };

  const calendarDays = getAllCalendarDays();
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const calendarEvents = events.length > 0 ? events : [];

  const getEventsForDay = (day: number, isCurrentMonth: boolean = true) => {
    if (!isCurrentMonth) return [];

    const allEvents = [...calendarEvents, ...getEventsFromCalendarData()];

    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    });
  };

  const isToday = (day: number, isCurrentMonth: boolean = true) => {
    if (!isCurrentMonth) return false;

    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const getStatusClass = () => {
    if (!task?.status?.alias) return '';

    const statusAlias = task.status.alias;
    let statusClass = '';

    switch (statusAlias) {
      case 'На проверке':
        statusClass = 'on-review';
        break;
      case 'В работе':
        statusClass = 'on-work';
        break;
      case 'Завершен':
        statusClass = 'completed';
        break;
      case 'К выполнению':
        statusClass = 'to-execution';
        break;
      case 'Отложен':
        statusClass = 'stopped';
        break;
      case 'Отменен':
        statusClass = 'closed';
        break;
      default:
        statusClass = '';
    }

    return `${statusClass}`;
  };

  const renderTooltip = (dayEvents: CalendarEvent[]) => {
    if (dayEvents.length === 0) return null;

    const deadlines: CalendarEvent[] = [];
    const meetings: CalendarEvent[] = [];

    dayEvents.forEach(event => {
      if (event.type === 'deadline') {
        deadlines.push(event);
      } else if (event.type === 'meeting') {
        meetings.push(event);
      }
    });

    return (
      <div className="calendar-tooltip">
        {meetings.length > 0 && (
          <div className="tooltip-section">
            <span className="tooltip-section-header">Встречи</span>
            {meetings.map((event, index) => (
              <div key={event.id} className="tooltip-event">
                <span className="tooltip-time">{event.time}</span>
                <span className="tooltip-title">{event.title}</span>
                {event.link && (
                  <div className="tooltip-link">
                    Ссылка: <a href={event.link} target="_blank" rel="noopener noreferrer">{event.link}</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {deadlines.length > 0 && (
          <div className="tooltip-section">
            <span className="tooltip-section-header">Дедлайны</span>
            {deadlines.map((event, index) => (
              <div key={event.id} className="tooltip-event">
                <span className="tooltip-title">{event.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const calendarClass = `calendar border-${getStatusClass()}`;
  let calendarPosition;

  if (getStatusClass() !== 'primary' || status !== 'primary') {
    calendarPosition = `relative`;
  }

  const defaultCalendar = `calendar border-${status} ${status !== 'primary' ? 'relative' : ''}`;

  return (
    <div className={getStatusClass()
      ? `${calendarClass} ${calendarPosition || ''}`
      : `${defaultCalendar}`}>
      <div className="calendar-header">
        <div className="calendar-navigation">
          <h3>{getMonthYearString()}</h3>
          <button
            className="nav-button prev-button"
            onClick={goToPreviousMonth}
            aria-label="Предыдущий месяц"
          >
            ❯
          </button>
          <button
            className="nav-button"
            onClick={goToNextMonth}
            aria-label="Следующий месяц"
          >
            ❯
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}

        {calendarDays.map(({ day, isCurrentMonth, isPreviousMonth, isNextMonth }, index) => {
          const dayEvents = getEventsForDay(day, isCurrentMonth);
          const isOtherMonth = isPreviousMonth || isNextMonth;

          const isDeadlineDay = task?.end_date && isCurrentMonth;
          let isDeadline = false;

          if (isDeadlineDay) {
            try {
              const taskDeadline = new Date(task.end_date);
              isDeadline = (
                taskDeadline.getDate() === day &&
                taskDeadline.getMonth() === month &&
                taskDeadline.getFullYear() === year
              );
            } catch (error) {
              console.error('Ошибка парсинга даты дедлайна:', error);
            }
          }

          return (
            <div
              key={`${isCurrentMonth ? 'current' : 'other'}-${day}-${index}`}
              className={`calendar-day  
                ${isToday(day, isCurrentMonth) ? 'today' : ''} 
                ${isDeadline ? `calendar-day-deadline ${getStatusClass()}` : ''}
                ${dayEvents.length > 0 ? 'has-events' : ''}
                ${isOtherMonth ? 'other-month' : ''}
              `}
            >
              <span className={isDeadline ? 'day-number-deadline' : 'day-number'}>{day}</span>
              {renderTooltip(dayEvents)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;