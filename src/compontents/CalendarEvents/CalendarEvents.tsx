import './CalendarEvents.css';
import { useState, useEffect } from 'react';
import { TaskItem } from '../types/types';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'deadline' | 'meeting';
  project?: string;
  task?: TaskItem;
}

interface CalendarEventsProps {
  tasks?: any[];
}

interface GroupedEvents {
  [date: string]: CalendarEvent[];
}
const monthsGenitive = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const CalendarEvents = ({ tasks }: CalendarEventsProps) => {
  const [groupedEvents, setGroupedEvents] = useState<GroupedEvents>({});

  const extractTasksFromData = (data: any[]): TaskItem[] => {
    const tasks: TaskItem[] = [];

    const extractTasks = (items: any[]) => {
      items.forEach(item => {
        if (item.children) {
          extractTasks(item.children);
        }
        if (item.executor && item.deadline) {
          tasks.push(item);
        }
      });
    };

    extractTasks(data);
    return tasks;
  };

  const createEventsFromTasks = (taskList: TaskItem[]): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    taskList.forEach(task => {
      if (task.end_date) {
        const deadlineDate = new Date(task.end_date);
        const today = new Date();
        const fiveDaysLater = new Date();
        fiveDaysLater.setDate(today.getDate() + 5);

        if (deadlineDate >= today && deadlineDate <= fiveDaysLater) {
          events.push({
            id: `deadline-${task.id}`,
            title: `Дедлайн задачи "${task.name}"`,
            date: task.end_date,
            type: 'deadline',
            task: task
          });
        }
      }
    });

    const mockMeetings: CalendarEvent[] = [
      {
        id: 'meeting-1',
        title: 'Встреча по проекту 100',
        date: '2025-11-25',
        time: '14:00',
        type: 'meeting',
        project: 'Проект 100'
      },
      {
        id: 'meeting-2',
        title: 'Совещание команды',
        date: '2025-11-25',
        time: '10:00',
        type: 'meeting'
      }
    ];

    const today = new Date();
    const fiveDaysLater = new Date();
    fiveDaysLater.setDate(today.getDate() + 5);

    const filteredMeetings = mockMeetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      return meetingDate >= today && meetingDate <= fiveDaysLater;
    });

    return [...events, ...filteredMeetings].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

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

  useEffect(() => {
    const mockTasksData = [
      {
        id: '1',
        title: 'Релиз 1',
        isExpanded: false,
        children: [
          {
            id: '2',
            title: 'Проект 100',
            isExpanded: false,
            description: `Описание проекта`,
            children: [
              {
                id: '3',
                title: 'Разработка формы авторизации для личного кабинета',
                isExpanded: false,
                executor: 1,
                status: 'stopped',
                createdDate: '2025-11-15',
                deadline: '2025-11-25',
                description: `Необходимо разработать адаптивную форму авторизации...`
              },
              {
                id: '3221',
                title: 'Разработка формы авторизации для личного кабинета',
                isExpanded: false,
                executor: 1,
                status: 'on-work',
                createdDate: '2025-11-13',
                deadline: '2025-11-24',
                description: `Необходимо разработать адаптивную форму авторизации...`
              },
              {
                id: '412421',
                title: 'Разработка формы авторизации для личного кабинета',
                isExpanded: false,
                executor: 2,
                status: 'closed',
                createdDate: '2025-11-11',
                deadline: '2025-11-24',
                description: `Необходимо разработать адаптивную форму авторизации...`
              },
              {
                id: '65655',
                title: 'Разработка формы авторизации для личного кабинета',
                isExpanded: false,
                executor: 3,
                status: 'completed',
                createdDate: '2025-12-15',
                deadline: '2025-11-23',
                description: `Необходимо разработать адаптивную форму авторизации...`
              },
            ]
          },
          {
            id: '4',
            title: 'Проект 2',
            isExpanded: false,
          }
        ]
      },
      {
        id: '5',
        title: 'Релиз 2',
        isExpanded: false,
        children: [
          {
            id: '6',
            title: 'Разработка формы авторизации для личного кабинета',
            isExpanded: false,
            executor: 1,
            status: 'on-work',
            createdDate: '2025-11-14',
            deadline: '2025-11-22',
            description: `Описание задачи`
          },
        ]
      }
    ];

    const tasksToUse = tasks || mockTasksData;
    const extractedTasks = extractTasksFromData(tasksToUse);
    const calendarEvents = createEventsFromTasks(extractedTasks);
    const grouped = groupEventsByDate(calendarEvents);

    setGroupedEvents(grouped);
  }, [tasks]);

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
                {groupedEvents[date].map(event => (
                  <div key={event.id} className="event-row">

                    <div
                      className={`event-time ${!event.time ? 'no-time' : ''}`}
                    >
                      {event.time || ''}
                    </div>
                    <div
                      className={`event-title-inline ${event.type === 'deadline' ? 'deadline' : ''}`}
                    >
                      {event.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarEvents;