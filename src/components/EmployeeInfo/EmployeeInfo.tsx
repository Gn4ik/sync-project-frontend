import { useRef, useState, useEffect } from 'react';
import { Department, Employee, Schedule } from '@types';
import EmployeeInfoUI from '@ui/EmployeeInfo';

interface EmployeeInfoProps {
  selectedEmployee: Employee | null;
  userRole: 'executor' | 'manager' | 'admin' | null;
  onEmployeeEdit?: (employee: Employee) => void;
  onEmployeeDelete?: (employeeId: string) => void;
  departments: Department[];
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

const EmployeeInfo = ({ selectedEmployee, userRole, onEmployeeEdit, onEmployeeDelete, departments }: EmployeeInfoProps) => {
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
    if (!selectedEmployee?.schedule) return 'Неизвестно';

    const schedule = selectedEmployee.schedule;
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

  const getEmployeeDepartment = (): string => {
    const uniqueDepartments = new Set<string>();
    departments.forEach(department => {
      department.staff.forEach(staffItem => {
        if (staffItem.employee?.id === selectedEmployee?.id) {
          const departmentInfo = `${department.name}, ${staffItem.office}`;
          uniqueDepartments.add(departmentInfo);
        }
      });
    });

    return Array.from(uniqueDepartments).join('/');
  }

  const getEmployeeSchedule = (): ScheduleDay[] => {
    if (!selectedEmployee?.schedule) {
      return daysOfWeek.map((day, index) => ({
        day,
        workHours: index < 5 ? '09:00 - 17:00' : 'Выходной',
        lunchHours: index < 5 ? '13:00 - 14:00' : '-',
        isWorking: index < 5
      }));
    }

    const schedule = selectedEmployee.schedule;

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
  const employeeSchedule = getEmployeeSchedule();

  useEffect(() => {
    const updateStatus = () => {
      setCurrentStatus(getCurrentStatus());
    };

    updateStatus();

    const interval = setInterval(updateStatus, 60000);

    return () => clearInterval(interval);
  }, [selectedEmployee]);

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

  const handleEditEmployee = () => {
    console.log('Редактировать сотрудника:', selectedEmployee?.id);
    setIsAdminPopupOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteEmployee = () => {
    console.log('Удалить сотрудника:', selectedEmployee?.id);
    setIsAdminPopupOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = (formData: any) => {
    console.log('Данные для редактирования сотрудника:', formData);
    setIsEditModalOpen(false);
    onEmployeeEdit?.(formData);
  };

  const handleDeleteSubmit = () => {
    console.log('Удаление сотрудника:', selectedEmployee?.id);
    setIsDeleteModalOpen(false);
    if (selectedEmployee) {
      onEmployeeDelete?.(selectedEmployee.id);
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
    <EmployeeInfoUI
      selectedEmployee={selectedEmployee}
      userRole={userRole}
      currentStatus={currentStatus}
      employeeSchedule={employeeSchedule}
      currentDayIndex={currentDayIndex}
      isAdminPopupOpen={isAdminPopupOpen}
      isEditModalOpen={isEditModalOpen}
      isDeleteModalOpen={isDeleteModalOpen}
      adminButtonRef={adminButtonRef}
      departments={departments}
      parseDate={parseDate}
      getStatusClass={getStatusClass}
      onToggleAdminPopup={handleToggleAdminPopup}
      onCloseAdminPopup={handleCloseAdminPopup}
      onEditEmployee={handleEditEmployee}
      onDeleteEmployee={handleDeleteEmployee}
      onEditSubmit={handleEditSubmit}
      onDeleteSubmit={handleDeleteSubmit}
      onCloseEditModal={handleCloseEditModal}
      onCloseDeleteModal={handleCloseDeleteModal}
      employeeDepartment={getEmployeeDepartment}
    />
  );
};

export default EmployeeInfo;