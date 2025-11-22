import './ColleagueInfo.css';
import { Colleague } from '../types/types';
import Calendar from '../Calendar/Calendar';
import '@styles/styles.css';

interface ColleagueInfoProps {
  selectedColleague: Colleague | null;
}

const ColleagueInfo = ({ selectedColleague }: ColleagueInfoProps) => {
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];

  const dailySchedule = [
    { day: 'Понедельник', workHours: '7:00 - 16:00', lunchHours: '12:00 - 13:00' },
    { day: 'Вторник', workHours: '7:00 - 16:00', lunchHours: '12:00 - 13:00' },
    { day: 'Среда', workHours: '7:00 - 16:00', lunchHours: '12:00 - 13:00' },
    { day: 'Четверг', workHours: '7:00 - 16:00', lunchHours: '12:00 - 13:00' },
    { day: 'Пятница', workHours: '7:00 - 16:00', lunchHours: '12:00 - 13:00' }
  ];

  const getCurrentDayIndex = () => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1;
  };

  const currentDayIndex = getCurrentDayIndex();

  const parseDate = (dateString?: string): string => {
    if (!dateString) return 'Не указано';

    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const schedule = {
    workHours: '7:00 - 16:00',
    lunchHours: '12:00 - 13:00'
  };

  return (
    <div className="colleague-info-container">
      <div className='line-container'>
        <div className='line status-primary' />
        {selectedColleague && (
          <div className='container-with-padding'>
            <div className="colleague-info-page">
              <div className="main-info-section">
                <div className="colleague-info-header">
                  <div className="colleague-main-info">
                    <h2 className="colleague-info-name">{selectedColleague.name}</h2>
                    <div className="colleague-info-position">
                      <span className='contact-label'>Должность: </span>
                      {selectedColleague.position}
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <div className="contact-info">
                    <div className="contact-row">
                      <span className="contact-label">Офис:</span>
                      <span className="contact-value">{selectedColleague.department || 'Не указан'}</span>
                    </div>
                    <div className="contact-row">
                      <span className="contact-label">Статус:</span>
                      <span className="contact-value">{selectedColleague.isOnline || 'Не указан'}</span>
                    </div>
                    <div className="contact-row">
                      <span className="contact-label">Дата рождения:</span>
                      <span className="contact-value">{parseDate(selectedColleague.birthDate)}</span>
                    </div>
                    <div className="contact-row">
                      <span className="contact-label">Телефон:</span>
                      <span className="contact-value">{selectedColleague.phone || 'Не указан'}</span>
                    </div>
                    <div className="contact-row">
                      <span className="contact-label">Почта:</span>
                      <span className="contact-value">{selectedColleague.email || 'Не указана'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Calendar status='to-execution' />
            </div>

            <div className="schedule-section">
              <h3 className="section-title">Расписание</h3>
              <div className="daily-schedule-container">
                {dailySchedule.map((schedule, index) => (
                  <div
                    key={schedule.day}
                    className={`daily-schedule-card ${index === currentDayIndex ? 'current-day' : ''}`}
                  >
                    <div className="schedule-content">
                      <div className={`schedule-day ${index === currentDayIndex ? 'current-day' : ''}`}>
                        {schedule.day}
                      </div>
                      <div className="time-slot">
                        <div className={`schedule-text-primary ${index === currentDayIndex ? 'current-day' : ''}`}>{schedule.workHours}</div>
                      </div>
                      <div className="time-slot">
                        <div className={`schedule-text-primary ${index === currentDayIndex ? 'current-day' : ''}`}>Обед:</div>
                        <div className={`schedule-text-primary ${index === currentDayIndex ? 'current-day' : ''}`}>{schedule.lunchHours}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColleagueInfo;