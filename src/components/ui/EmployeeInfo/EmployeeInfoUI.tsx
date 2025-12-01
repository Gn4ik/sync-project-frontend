import React from 'react';
import './EmployeeInfo.css';
import '@styles/styles.css';
import Calendar from '@components/Calendar/Calendar';
import Popup from '@components/Popup/Popup';
import { Department, Employee, ProjectItem } from '@types';
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
  userRole: 'executor' | 'manager' | 'admin' | null;
  currentStatus: 'На работе' | 'Отсутствует' | 'Обед' | 'Неизвестно';
  employeeSchedule: ScheduleDay[];
  currentDayIndex: number;
  isAdminPopupOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  adminButtonRef: React.RefObject<HTMLButtonElement>;
  departments: Department[];
  parseDate: (dateString?: string) => string;
  getStatusClass: (status: string) => string;
  onToggleAdminPopup: () => void;
  onCloseAdminPopup: () => void;
  onEditEmployee: () => void;
  onDeleteEmployee: () => void;
  onEditSubmit: (formData: any) => void;
  onDeleteSubmit: () => void;
  onCloseEditModal: () => void;
  onCloseDeleteModal: () => void;
  employeeDepartment: () => string;
}

const EmployeeInfoUI: React.FC<EmployeeInfoUIProps> = ({
  selectedEmployee,
  userRole,
  currentStatus,
  employeeSchedule,
  currentDayIndex,
  isAdminPopupOpen,
  isEditModalOpen,
  isDeleteModalOpen,
  adminButtonRef,
  departments,
  parseDate,
  getStatusClass,
  onToggleAdminPopup,
  onCloseAdminPopup,
  onEditEmployee,
  onDeleteEmployee,
  onEditSubmit,
  onDeleteSubmit,
  onCloseEditModal,
  onCloseDeleteModal,
  employeeDepartment
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
                                <div className="admin-popup-item" onClick={onDeleteEmployee}>
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.3966 1.89491H10.7304C10.4994 0.819375 9.3634 0 8 0C6.63663 0 5.50065 0.819375 5.26961 1.89491H0.603443C0.270154 1.89491 0 2.11875 0 2.39491V4.66478C0 4.94094 0.270154 5.16478 0.603443 5.16478H1.55236V15.5C1.55236 15.7762 1.82251 16 2.1558 16H13.8442C14.1775 16 14.4476 15.7762 14.4476 15.5V5.16475H15.3966C15.7298 5.16475 16 4.94091 16 4.66475V2.39491C16 2.11875 15.7298 1.89491 15.3966 1.89491ZM8 1C8.69411 1 9.2839 1.37597 9.4893 1.89491H6.5107C6.7161 1.37597 7.30589 1 8 1ZM13.2408 15H2.75924V5.16475H13.2408V15ZM14.7931 4.16475H1.20689V2.89491H14.7931V4.16475ZM5.75594 12.9628V7.33778C5.75594 7.06163 6.0261 6.83778 6.35939 6.83778C6.69268 6.83778 6.96283 7.06163 6.96283 7.33778V12.9628C6.96283 13.2389 6.69268 13.4628 6.35939 13.4628C6.0261 13.4628 5.75594 13.2389 5.75594 12.9628ZM9.03717 12.9628V7.33778C9.03717 7.06163 9.30732 6.83778 9.64061 6.83778C9.9739 6.83778 10.2441 7.06163 10.2441 7.33778V12.9628C10.2441 13.2389 9.9739 13.4628 9.64061 13.4628C9.30732 13.4628 9.03717 13.2389 9.03717 12.9628Z" fill="currentColor" />
                                  </svg>
                                  {' '}Удалить
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
              <Calendar status='to-execution' />
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
        onSubmit={onEditSubmit}
        mode="edit"
        initialData={selectedEmployee}
      />

      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={onCloseDeleteModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Удаление сотрудника</h2>
              <button className="modal-close" onClick={onCloseDeleteModal}>×</button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                Вы уверены, что хотите удалить сотрудника "{selectedEmployee?.lname} {selectedEmployee?.fname} {selectedEmployee?.mname}"? Это действие нельзя отменить.
              </p>
              <div className="modal-actions">
                <div className="action-buttons">
                  <button type="button" className="btn-secondary" onClick={onCloseDeleteModal}>
                    Отменить
                  </button>
                  <button type="button" className="btn-primary" onClick={onDeleteSubmit} style={{ backgroundColor: '#dc3545' }}>
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeInfoUI;