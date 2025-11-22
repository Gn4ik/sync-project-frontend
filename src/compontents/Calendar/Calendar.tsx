import React, { useState } from 'react';
import './Calendar.css';
import { TaskStatus } from '../types/types';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: Date;
}

interface CalendarProps {
  events?: CalendarEvent[];
  status?: TaskStatus;
}

const Calendar: React.FC<CalendarProps> = ({ events = [], status = 'primary' }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1));

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

  const defaultEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Встреча по проекту 1',
      time: '18.00',
      date: new Date(2025, 10, 17)
    },
    {
      id: '2',
      title: 'Релиз проекта',
      time: '14.00',
      date: new Date(2025, 10, 25)
    },
    {
      id: '3',
      title: 'Корпоратив',
      time: '10.00',
      date: new Date(2025, 11, 31)
    }
  ];

  const calendarEvents = events.length > 0 ? events : defaultEvents;

  const getEventsForDay = (day: number, isCurrentMonth: boolean = true) => {
    if (!isCurrentMonth) return [];

    return calendarEvents.filter(event => {
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

  const renderTooltip = (dayEvents: CalendarEvent[]) => {
    if (dayEvents.length === 0) return null;

    return (
      <div className="calendar-tooltip">
        {dayEvents.map(event => (
          <div key={event.id} className="tooltip-event">
            <span className="tooltip-time">{event.time}</span>
            <span className="tooltip-title">{event.title}</span>
          </div>
        ))}
      </div>
    );
  };

  const calendarClass = `calendar border-${status}`;
  let calendarPosition;
  
  if (status != 'primary')
    calendarPosition = `relative`;

  return (
    <div className={calendarClass + ' ' + calendarPosition}>
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

          return (
            <div
              key={`${isCurrentMonth ? 'current' : 'other'}-${day}-${index}`}
              className={`calendar-day 
                ${isToday(day, isCurrentMonth) ? 'today' : ''} 
                ${dayEvents.length > 0 ? 'has-events' : ''}
                ${isOtherMonth ? 'other-month' : ''}
              `}
            >
              <span className="day-number">{day}</span>
              {renderTooltip(dayEvents)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;