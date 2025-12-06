import './CalendarEvents.css';
import { useState, useEffect, useRef } from 'react';
import { CalendarItem, Meeting, TaskItem } from '@types';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'deadline' | 'meeting';
  task?: TaskItem;
  link?: string;
  meetingId?: number;
}

interface CalendarEventsProps {
  currentUser: number;
  employeeCalendar: CalendarItem[];
  meetings: Meeting[];
  highlightedMeetingId?: number | null;
}

interface GroupedEvents {
  [date: string]: CalendarEvent[];
}

const monthsGenitive = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const CalendarEvents = ({ currentUser, employeeCalendar, meetings, highlightedMeetingId }: CalendarEventsProps) => {
  const [groupedEvents, setGroupedEvents] = useState<GroupedEvents>({});
  const highlightedMeetingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createEventsFromCalendarData = (): CalendarEvent[] => {
      const events: CalendarEvent[] = [];
      const today = new Date();
      const twoWeeksLater = new Date(today);
      twoWeeksLater.setDate(today.getDate() + 14);

      const usedTaskTitles = new Set<string>();

      employeeCalendar.forEach(calendarDay => {
        if (calendarDay) {
          const dayDate = new Date(calendarDay.day);

          if (dayDate >= today && dayDate <= twoWeeksLater) {
            usedTaskTitles.clear();

            calendarDay.task_deadlines?.forEach(([taskName, taskUrl], index) => {
              const uniqueKey = `${calendarDay.day}-${taskName}`;
              if (!usedTaskTitles.has(uniqueKey)) {
                usedTaskTitles.add(uniqueKey);
                events.push({
                  id: `deadline-${calendarDay.day}-${index}`,
                  title: `Дедлайн задачи "${taskName}"`,
                  date: calendarDay.day,
                  type: 'deadline'
                });
              }
            });

            calendarDay.timesheet?.forEach(([time, description, url], index) => {
              if (description.includes('Собрание')) return;
              const taskNameMatch = description.match(/Дедлайн задачи "([^"]+)"/);
              const taskName = taskNameMatch ? taskNameMatch[1] : description;
              const uniqueKey = `${calendarDay.day}-${taskName}`;

              if (!usedTaskTitles.has(uniqueKey)) {
                usedTaskTitles.add(uniqueKey);
                events.push({
                  id: `timesheet-${calendarDay.day}-${index}`,
                  title: description,
                  date: calendarDay.day,
                  time: time !== '00:00:00' ? time.substring(0, 5) : undefined,
                  type: 'deadline'
                });
              }
            });

            calendarDay.active_tasks?.forEach(([taskName, taskUrl], index) => {
              const uniqueKey = `${calendarDay.day}-${taskName}`;
              if (!usedTaskTitles.has(uniqueKey)) {
                usedTaskTitles.add(uniqueKey);
                events.push({
                  id: `active-${calendarDay.day}-${index}`,
                  title: `Активная задача: "${taskName}"`,
                  date: calendarDay.day,
                  type: 'deadline'
                });
              }
            });
          }
        }
      });

      meetings.forEach(meeting => {
        const meetingDate = new Date(meeting.date);

        if (meetingDate >= today && meetingDate <= twoWeeksLater) {
          const isParticipant = meeting.employee_meetings.some(
            emp => emp.employee_id === currentUser
          );

          if (isParticipant) {
            const meetingDay = meeting.date.split('T')[0];
            const meetingTime = meeting.date.split('T')[1]?.substring(0, 5);

            events.push({
              id: `meeting-${meeting.id}`,
              title: `- Встреча: ${meeting.name}`,
              date: meetingDay,
              time: meetingTime,
              type: 'meeting',
              link: meeting.link,
              meetingId: meeting.id
            });
          }
        }
      });

      return events.sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;

        if (!a.time && !b.time) return 0;
        if (!a.time) return -1;
        if (!b.time) return 1;

        return a.time.localeCompare(b.time);
      });
    };

    const events = createEventsFromCalendarData();
    const grouped = groupEventsByDate(events);
    setGroupedEvents(grouped);

    if (highlightedMeetingId && highlightedMeetingRef.current) {
      setTimeout(() => {
        highlightedMeetingRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300);
    }
  }, [employeeCalendar, meetings, currentUser, highlightedMeetingId]);

  const groupEventsByDate = (events: CalendarEvent[]): GroupedEvents => {
    const grouped: GroupedEvents = {};

    events.forEach(event => {
      const dateKey = event.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Сегодня';
    if (date.toDateString() === tomorrow.toDateString()) return 'Завтра';

    const weekday = date.toLocaleString('ru-RU', { weekday: 'long' });
    return `${date.getDate()} ${monthsGenitive[date.getMonth()]}, ${weekday}`;
  };

  const sortedDates = Object.keys(groupedEvents).sort((a, b) =>
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="calendar-events-container">
      <div className="line-container">
        <div className="line status-primary" />

        <div className="events-list">
          {sortedDates.map(date => (
            <div key={date} className="date-group">
              <div className="date-header">
                {formatDateHeader(date)}
              </div>

              <div className="blue-line"></div>

              <div className="events-for-date">
                {groupedEvents[date].map(event => {
                  const isHighlighted = event.meetingId === highlightedMeetingId;
                  return (
                    <div
                      key={event.id}
                      ref={isHighlighted ? highlightedMeetingRef : null}
                      className={`event-row ${isHighlighted ? 'event-highlighted' : ''}`}
                    >
                      <div
                        className={`event-time ${!event.time ? 'no-time' : ''}`}
                      >
                        {event.time || ''}
                      </div>
                      <div
                        className={`event-title-inline ${event.type === 'deadline' ? 'deadline' : 'meeting'}`}
                      >
                        {event.title}
                      </div>
                      {event.link && (
                        <div className='event-title-inline meeting'>
                          {', '}{'Ссылка: '}
                          <a href={event.link} className='meeting-link'>
                            {event.link}
                          </a>
                        </div>)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {sortedDates.length === 0 && (
            <div className="no-results">
              На ближайшие две недели событий нет
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarEvents;