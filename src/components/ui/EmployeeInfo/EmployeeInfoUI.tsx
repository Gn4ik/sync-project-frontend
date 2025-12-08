import React from 'react';
import './EmployeeInfo.css';
import '@styles/styles.css';
import Calendar from '@components/Calendar/Calendar';
import Popup from '@components/Popup/Popup';
import { Department, Employee, ProjectItem, Schedule } from '@types';
import { EmployeeModal } from '@components/EmployeeModal/EmployeeModal';

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

interface EmployeeInfoUIProps {
  selectedEmployee: Employee | null;
  userRole: string | null;
  currentStatus: 'На работе' | 'Отсутствует' | 'Обед' | 'Неизвестно' | 'В отпуске';
  employeeSchedule: ScheduleDay[];
  currentDayIndex: number;
  isAdminPopupOpen: boolean;
  isEditModalOpen: boolean;
  adminButtonRef: React.RefObject<HTMLButtonElement>;
  departments: Department[];
  schedules: Schedule[];
  parseDate: (dateString?: string) => string;
  getStatusClass: (status: string) => string;
  onToggleAdminPopup: () => void;
  onCloseAdminPopup: () => void;
  onEditEmployee: () => void;
  onSubmit: (formData: any) => Promise<boolean>;
  onCloseEditModal: () => void;
  employeeDepartment: () => string;
  vacationDays: Date[];
}

const EmployeeInfoUI: React.FC<EmployeeInfoUIProps> = ({
  selectedEmployee,
  userRole,
  currentStatus,
  employeeSchedule,
  currentDayIndex,
  isAdminPopupOpen,
  isEditModalOpen,
  adminButtonRef,
  departments,
  schedules,
  parseDate,
  getStatusClass,
  onToggleAdminPopup,
  onCloseAdminPopup,
  onEditEmployee,
  onSubmit,
  onCloseEditModal,
  employeeDepartment,
  vacationDays
}) => {
  if (!selectedEmployee) {
    return (
      <div className="employee-info-container">
        <div className="no-employee-selected">
          <p>Выберите сотрудника для просмотра информации</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-info-container">
      <div className='line-container'>
        <div className='line status-primary' />
        <div className='container-with-padding'>
          <div className="employee-info-page">
            <div className="main-info-section">
              <div className="employee-info-header">
                <div className="employee-main-info">
                  <div className='employee-title-container'>
                    <div className='employee-title-wrapper'>
                      {userRole === 'admin' && (
                        <div className='admin-popup-wrapper'>
                          <button
                            ref={adminButtonRef}
                            className={`admin-edit-button ${isAdminPopupOpen ? 'active' : ''}`}
                            onClick={onToggleAdminPopup}
                          >
                            <svg width="30" height="30" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M22.5625 19C22.5625 17.0359 20.9641 15.4375 19 15.4375C17.0359 15.4375 15.4375 17.0359 15.4375 19C15.4375 20.9641 17.0359 22.5625 19 22.5625C20.9641 22.5625 22.5625 20.9641 22.5625 19Z"
                                fill={isAdminPopupOpen ? "#0B57D0" : "#2D2D2D"}
                              />
                              <path
                                d="M22.5625 7.125C22.5625 5.16087 20.9641 3.5625 19 3.5625C17.0359 3.5625 15.4375 5.16087 15.4375 7.125C15.4375 9.08913 17.0359 10.6875 19 10.6875C20.9641 10.6875 22.5625 9.08913 22.5625 7.125Z"
                                fill={isAdminPopupOpen ? "#0B57D0" : "#2D2D2D"}
                              />
                              <path
                                d="M22.5625 30.875C22.5625 28.9109 20.9641 27.3125 19 27.3125C17.0359 27.3125 15.4375 28.9109 15.4375 30.875C15.4375 32.8391 17.0359 34.4375 19 34.4375C20.9641 34.4375 22.5625 32.8391 22.5625 30.875Z"
                                fill={isAdminPopupOpen ? "#0B57D0" : "#2D2D2D"}
                              />
                            </svg>
                          </button>
                          <Popup
                            isOpen={isAdminPopupOpen}
                            onClose={onCloseAdminPopup}
                            position='left'
                            triggerRef={adminButtonRef}
                          >
                            <div className='admin-popup-content'>
                              <div className="admin-popup-list">
                                <div className="admin-popup-item" onClick={onEditEmployee}>
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.222 0.779789C14.1822 -0.259867 12.4992 -0.259992 11.4593 0.779789L1.62336 10.6145C1.5578 10.68 1.50355 10.7653 1.47239 10.8588L0.0330157 15.1764C-0.129484 15.6639 0.335485 16.1297 0.823579 15.9669L5.14177 14.5277C5.23308 14.4973 5.3188 14.444 5.38611 14.3768L15.222 4.54204C16.2593 3.50479 16.2593 1.81704 15.222 0.779789ZM1.61417 14.386L2.33845 12.2133L3.78708 13.6618L1.61417 14.386ZM4.94417 13.051L2.94927 11.0564L11.3015 2.70513L13.2964 4.69982L4.94417 13.051ZM14.3381 3.65826L14.1803 3.81604L12.1854 1.82135L12.3431 1.6636C12.8932 1.1137 13.7881 1.1137 14.3381 1.6636C14.8881 2.21351 14.8881 3.10832 14.3381 3.65826Z" fill="currentColor" />
                                  </svg>
                                  {' '}Изменить
                                </div>
                              </div>
                            </div>
                          </Popup>
                        </div>
                      )}
                      <h2 className="employee-info-name">{selectedEmployee.lname} {selectedEmployee.fname} {selectedEmployee.mname}</h2>
                    </div>
                  </div>
                  <div className="employee-info-position">
                    <span className='contact-label'>Должность: </span>
                    {selectedEmployee.position}
                  </div>
                </div>
              </div>

              <div className="info-section">
                <div className="contact-info">
                  <div className="contact-row">
                    <span className="contact-label">Офис:</span>
                    <span className="contact-value">{employeeDepartment()}</span>
                  </div>
                  <div className="contact-row">
                    <span className="contact-label">Статус:</span>
                    <span className={`contact-value status-indicator ${getStatusClass(currentStatus)}`}>
                      {currentStatus}
                    </span>
                  </div>
                  <div className="contact-row">
                    <span className="contact-label">Дата рождения:</span>
                    <span className="contact-value">{parseDate(selectedEmployee.dob)}</span>
                  </div>
                  <div className="contact-row">
                    <span className="contact-label">Телефон:</span>
                    <span className="contact-value">{selectedEmployee.phone || 'Не указан'}</span>
                  </div>
                  <div className="contact-row">
                    <span className="contact-label">Почта:</span>
                    <span className="contact-value">{selectedEmployee.email || 'Не указана'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="calendar-wrapper">
              <Calendar
                status='to-execution'
                vacationDays={vacationDays}
              />
            </div>
          </div>

          <div className="schedule-section">
            <h3 className="section-title">Расписание</h3>
            <div className="daily-schedule-container">
              {employeeSchedule.map((schedule, index) => (
                <div
                  key={schedule.day}
                  className={`daily-schedule-card ${index === currentDayIndex ? 'current-day' : ''} ${!schedule.isWorking ? 'day-off' : ''}`}
                >
                  <div className="schedule-content">
                    <div className={`schedule-day ${index === currentDayIndex ? 'current-day' : ''} ${!schedule.isWorking ? 'day-off' : ''}`}>
                      {schedule.day}
                    </div>
                    <div className="time-slot">
                      <div className={`schedule-text-primary ${index === currentDayIndex ? 'current-day' : ''} ${!schedule.isWorking ? 'day-off' : ''}`}>
                        {schedule.workHours}
                      </div>
                    </div>
                    {schedule.isWorking && (
                      <div className="time-slot">
                        <div className={`schedule-text-primary ${index === currentDayIndex ? 'current-day' : ''}`}>Обед:</div>
                        <div className={`schedule-text-primary ${index === currentDayIndex ? 'current-day' : ''}`}>{schedule.lunchHours}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <EmployeeModal
        isOpen={isEditModalOpen}
        onClose={onCloseEditModal}
        onSubmit={onSubmit}
        mode="edit"
        initialData={selectedEmployee}
        departments={departments}
        schedules={schedules}
      />
    </div>
  );
};

export default EmployeeInfoUI;