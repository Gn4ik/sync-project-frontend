import { useRef, useState, useEffect } from 'react';
import { Colleague, ProjectItem, Schedule } from '@types';
import ColleagueInfoUI from '@ui/ColleagueInfo';

interface ColleagueInfoProps {
  selectedColleague: Colleague | null;
  userRole: 'executor' | 'manager' | 'admin' | null;
  onColleagueEdit?: (colleague: Colleague) => void;
  onColleagueDelete?: (colleagueId: string) => void;
  projects: ProjectItem[];
  colleagues: Colleague[];
}

interface ScheduleDay {
  day: string;
  workHours: string;
  lunchHours: string;
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
  lunchStart?: string;
  lunchEnd?: string;
}

const ColleagueInfo = ({ selectedColleague, userRole, onColleagueEdit, onColleagueDelete, projects, colleagues }: ColleagueInfoProps) => {
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

  const [isAdminPopupOpen, setIsAdminPopupOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'На работе' | 'Отсутствует' | 'Обед' | 'Неизвестно'>('Неизвестно');
  const adminButtonRef = useRef<HTMLButtonElement>(null);

  const formatTime = (timeString: string): string => {
    if (!timeString || timeString === '00:00:00') return '--:--';
    return timeString.slice(0, 5);
  };

  const timeToMinutes = (timeString: string): number => {
    if (!timeString || timeString === '00:00:00') return 0;
    const [hours, minutes] = timeString.split(':').slice(0, 2).map(Number);
    return hours * 60 + minutes;
  };

  const getCurrentDayKey = (): string => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today = new Date().getDay();
    return days[today];
  };

  const getCurrentStatus = (): 'На работе' | 'Отсутствует' | 'Обед' | 'Неизвестно' => {
    if (!selectedColleague?.schedule) return 'Неизвестно';

    const schedule = selectedColleague.schedule;
    const currentDayKey = getCurrentDayKey();
    const currentDayIdKey = `${currentDayKey}_id` as keyof Schedule;

    const isWorkingDay = schedule[currentDayIdKey] !== 0;
    if (!isWorkingDay) return 'Отсутствует';

    const daySchedule = schedule[currentDayKey as keyof Schedule] as any;
    if (!daySchedule || daySchedule.starttime === '00:00:00') return 'Отсутствует';

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const workStart = timeToMinutes(daySchedule.starttime);
    const workEnd = timeToMinutes(daySchedule.endtime);
    const lunchStart = timeToMinutes(daySchedule.lunchbreak_start);
    const lunchEnd = timeToMinutes(daySchedule.lunchbreak_end);

    if (lunchStart > 0 && lunchEnd > 0 && currentMinutes >= lunchStart && currentMinutes <= lunchEnd) {
      return 'Обед';
    }

    if (currentMinutes >= workStart && currentMinutes <= workEnd) {
      return 'На работе';
    }

    return 'Отсутствует';
  };

  const getColleagueSchedule = (): ScheduleDay[] => {
    if (!selectedColleague?.schedule) {
      return daysOfWeek.map((day, index) => ({
        day,
        workHours: index < 5 ? '09:00 - 17:00' : 'Выходной',
        lunchHours: index < 5 ? '13:00 - 14:00' : '-',
        isWorking: index < 5
      }));
    }

    const schedule = selectedColleague.schedule;

    const dayMappings = [
      { key: 'mon', idKey: 'mon_id', name: 'Понедельник' },
      { key: 'tue', idKey: 'tue_id', name: 'Вторник' },
      { key: 'wed', idKey: 'wed_id', name: 'Среда' },
      { key: 'thu', idKey: 'thu_id', name: 'Четверг' },
      { key: 'fri', idKey: 'fri_id', name: 'Пятница' },
      { key: 'sat', idKey: 'sat_id', name: 'Суббота' },
      { key: 'sun', idKey: 'sun_id', name: 'Воскресенье' },
    ];

    return dayMappings.map(({ key, idKey, name }) => {
      const isWorking = schedule[idKey as keyof Schedule] !== 0;
      const daySchedule = schedule[key as keyof Schedule] as any;

      if (!isWorking) {
        return {
          day: name,
          workHours: 'Выходной',
          lunchHours: '-',
          isWorking: false
        };
      }

      const workHours = `${formatTime(daySchedule.starttime)} - ${formatTime(daySchedule.endtime)}`;

      const hasLunchBreak = daySchedule.lunchbreak_start !== '00:00:00' &&
        daySchedule.lunchbreak_end !== '00:00:00';

      const lunchHours = hasLunchBreak
        ? `${formatTime(daySchedule.lunchbreak_start)} - ${formatTime(daySchedule.lunchbreak_end)}`
        : 'Нет перерыва';

      return {
        day: name,
        workHours,
        lunchHours,
        isWorking: true,
        startTime: daySchedule.starttime,
        endTime: daySchedule.endtime,
        lunchStart: daySchedule.lunchbreak_start,
        lunchEnd: daySchedule.lunchbreak_end
      };
    });
  };

  const getCurrentDayIndex = (): number => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1;
  };

  const currentDayIndex = getCurrentDayIndex();
  const colleagueSchedule = getColleagueSchedule();

  useEffect(() => {
    const updateStatus = () => {
      setCurrentStatus(getCurrentStatus());
    };

    updateStatus();

    const interval = setInterval(updateStatus, 60000);

    return () => clearInterval(interval);
  }, [selectedColleague]);

  const parseDate = (dateString?: string): string => {
    if (!dateString) return 'Не указано';

    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();

      return `${day} ${month} ${year}`;
    } catch (error) {
      return 'Неверный формат даты';
    }
  };

  const handleEditColleague = () => {
    console.log('Редактировать сотрудника:', selectedColleague?.id);
    setIsAdminPopupOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteColleague = () => {
    console.log('Удалить сотрудника:', selectedColleague?.id);
    setIsAdminPopupOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = (formData: any) => {
    console.log('Данные для редактирования сотрудника:', formData);
    setIsEditModalOpen(false);
    onColleagueEdit?.(formData);
  };

  const handleDeleteSubmit = () => {
    console.log('Удаление сотрудника:', selectedColleague?.id);
    setIsDeleteModalOpen(false);
    if (selectedColleague) {
      onColleagueDelete?.(selectedColleague.id);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleToggleAdminPopup = () => {
    setIsAdminPopupOpen(!isAdminPopupOpen);
  };

  const handleCloseAdminPopup = () => {
    setIsAdminPopupOpen(false);
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'На работе':
        return 'status-working';
      case 'Обед':
        return 'status-lunch';
      case 'Отсутствует':
        return 'status-absent';
      default:
        return 'status-unknown';
    }
  };

  return (
    <ColleagueInfoUI
      selectedColleague={selectedColleague}
      userRole={userRole}
      currentStatus={currentStatus}
      colleagueSchedule={colleagueSchedule}
      currentDayIndex={currentDayIndex}
      isAdminPopupOpen={isAdminPopupOpen}
      isEditModalOpen={isEditModalOpen}
      isDeleteModalOpen={isDeleteModalOpen}
      adminButtonRef={adminButtonRef}
      projects={projects}
      colleagues={colleagues}
      parseDate={parseDate}
      getStatusClass={getStatusClass}
      onToggleAdminPopup={handleToggleAdminPopup}
      onCloseAdminPopup={handleCloseAdminPopup}
      onEditColleague={handleEditColleague}
      onDeleteColleague={handleDeleteColleague}
      onEditSubmit={handleEditSubmit}
      onDeleteSubmit={handleDeleteSubmit}
      onCloseEditModal={handleCloseEditModal}
      onCloseDeleteModal={handleCloseDeleteModal}
    />
  );
};

export default ColleagueInfo;