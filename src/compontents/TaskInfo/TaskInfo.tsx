import Calendar from '../Calendar/Calendar';
import './TaskInfo.css';
import '@styles/styles.css';
import linkIcon from '../../icons/LinkIcon.svg';
import { useEffect, useRef, useState } from 'react';
import '@styles/styles.css';
import Popup from '../Popup/Popup';
import Modal from '../Modal/Modal';
import { getTaskStatusFromAlias, TaskItem } from '../types/types';

type TaskInfoProps = {
  selectedTask?: TaskItem | null;
  userRole: string | null;
  statuses?: Array<{ id: number; alias: string }>;
  onStatusChange?: (taskId: number, newStatusId: number) => void;
}

const useAutoResizeTextarea = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, []);

  return { textareaRef, adjustHeight };
};

const TaskInfo = ({ selectedTask, userRole, statuses, onStatusChange }: TaskInfoProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isManagerPopupOpen, setIsManagerPopupOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const managerButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [hasText, setHasText] = useState(false);

  const taskStatus = getTaskStatusFromAlias(selectedTask?.status.alias || '');
  const lineClass = `line status-${taskStatus}`;
  const backgroundClass = `task-info-container status-${taskStatus}`;

  const { textareaRef, adjustHeight } = useAutoResizeTextarea();

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    setHasText(e.target.value.trim().length > 0);
  };

  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  const parseDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (error) {
      return dateString;
    }
  };

  const handleStatusChange = (newStatusId: number) => {
    setIsDropdownOpen(false);
    if (onStatusChange && selectedTask) {
      onStatusChange(selectedTask.id, newStatusId);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  const handleEditTask = () => {
    console.log('Редактировать задачу:', selectedTask?.id);
    setIsManagerPopupOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteTask = () => {
    console.log('Удалить задачу:', selectedTask?.id);
    setIsManagerPopupOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = (formData: any) => {
    console.log('Данные для редактирования:', formData);
    setIsEditModalOpen(false);
  };

  const handleDeleteSubmit = () => {
    console.log('Удаление задачи:', selectedTask?.id);
    setIsDeleteModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!selectedTask) {
    return (
      <div className="task-info-container">
        <div className="no-task-selected">
          <p>Выберите задачу для просмотра информации</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={backgroundClass}>
        <div className='line-container'>
          <div className={lineClass} />
          <div className='task-info'>
            <div className='main-info'>
              <div className='width-100'>
                <div className='task-title-container'>
                  <div className='task-title-wrapper'>
                    {userRole === 'manager' && (
                      <div className='manager-popup-wrapper'>
                        <button
                          ref={managerButtonRef}
                          className={`manager-edit-button ${isManagerPopupOpen ? 'active' : ''}`}
                          onClick={() => setIsManagerPopupOpen(!isManagerPopupOpen)}
                        >
                          <svg width="30" height="30" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M22.5625 19C22.5625 17.0359 20.9641 15.4375 19 15.4375C17.0359 15.4375 15.4375 17.0359 15.4375 19C15.4375 20.9641 17.0359 22.5625 19 22.5625C20.9641 22.5625 22.5625 20.9641 22.5625 19Z"
                              fill={isManagerPopupOpen ? "#0B57D0" : "#2D2D2D"}
                            />
                            <path
                              d="M22.5625 7.125C22.5625 5.16087 20.9641 3.5625 19 3.5625C17.0359 3.5625 15.4375 5.16087 15.4375 7.125C15.4375 9.08913 17.0359 10.6875 19 10.6875C20.9641 10.6875 22.5625 9.08913 22.5625 7.125Z"
                              fill={isManagerPopupOpen ? "#0B57D0" : "#2D2D2D"}
                            />
                            <path
                              d="M22.5625 30.875C22.5625 28.9109 20.9641 27.3125 19 27.3125C17.0359 27.3125 15.4375 28.9109 15.4375 30.875C15.4375 32.8391 17.0359 34.4375 19 34.4375C20.9641 34.4375 22.5625 32.8391 22.5625 30.875Z"
                              fill={isManagerPopupOpen ? "#0B57D0" : "#2D2D2D"}
                            />
                          </svg>
                        </button>
                        <Popup
                          isOpen={isManagerPopupOpen}
                          onClose={() => setIsManagerPopupOpen(false)}
                          position='left'
                          triggerRef={managerButtonRef}
                        >
                          <div className='manager-popup-content'>
                            <div className="manager-popup-list">
                              <div className="manager-popup-item" onClick={handleEditTask}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M15.222 0.779789C14.1822 -0.259867 12.4992 -0.259992 11.4593 0.779789L1.62336 10.6145C1.5578 10.68 1.50355 10.7653 1.47239 10.8588L0.0330157 15.1764C-0.129484 15.6639 0.335485 16.1297 0.823579 15.9669L5.14177 14.5277C5.23308 14.4973 5.3188 14.444 5.38611 14.3768L15.222 4.54204C16.2593 3.50479 16.2593 1.81704 15.222 0.779789ZM1.61417 14.386L2.33845 12.2133L3.78708 13.6618L1.61417 14.386ZM4.94417 13.051L2.94927 11.0564L11.3015 2.70513L13.2964 4.69982L4.94417 13.051ZM14.3381 3.65826L14.1803 3.81604L12.1854 1.82135L12.3431 1.6636C12.8932 1.1137 13.7881 1.1137 14.3381 1.6636C14.8881 2.21351 14.8881 3.10832 14.3381 3.65826Z" fill="currentColor" />
                                </svg>
                                {' '}Изменить
                              </div>
                              <div className="manager-popup-item" onClick={handleDeleteTask}>
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
                    <h2 className='task-title'>{selectedTask.name}</h2>
                  </div>
                  <div className='meta-info'>
                    <p className='created-at'>Создано:
                      <span className='created-at'>  {parseDate(selectedTask.created_at)}</span>
                    </p>
                    <span className='project-link'>
                      <img src={linkIcon} alt="Ссылка" />
                      Ссылка на проект
                    </span>
                  </div>
                </div>
                <div className='meta-info'>
                  <div className='status-section' ref={dropdownRef}>
                    <span className='section-label'>Статус:</span>
                    <div className='status-dropdown' onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                      <span className='status-badge'>{taskStatus}</span>
                      <span className={`dropdown-arrow ${isDropdownOpen ? 'dropdown-arrow-open' : ''}`}>❯</span>
                    </div>
                    {isDropdownOpen && statuses && (
                      <div className='dropdown-menu'>
                        {statuses.map((statusItem) => (
                          <div
                            key={statusItem.id}
                            className={`dropdown-item ${selectedTask.status_id === statusItem.id ? 'dropdown-item-active' : ''
                              }`}
                            onClick={() => handleStatusChange(statusItem.id)}
                          >
                            {statusItem.alias}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className='deadline-section'>
                    <span className='section-label'>Срок:</span>
                    <span className='deadline-date'>{parseDate(selectedTask.end_date)}</span>
                  </div>
                </div>
              </div>
              <Calendar status={taskStatus} />
            </div>

            <div className='description-section'>
              <h3 className='section-title'>Описание:</h3>
              <div className='description-text'>
                {selectedTask.description.split('\n').map((line, index) => (
                  <p key={index} className='description-line description-text'>
                    {line.startsWith('- ') ? (
                      <>
                        <span className='bullet'>•</span>
                        {line.substring(2)}
                      </>
                    ) : (
                      line
                    )}
                  </p>
                ))}
              </div>
            </div>

            <div className='comment-section'>
              <div className='comment-list'>
                <p>
                  COMMENT
                </p>
              </div>
              <form className="comment-form">
                <div className={`input-wrapper ${hasText ? 'has-text' : ''}`}>
                  <textarea
                    ref={textareaRef}
                    className="comment-input"
                    placeholder="Добавить комментарий"
                    maxLength={500}
                    onInput={handleTextareaInput}
                  />
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={!hasText}
                  >
                    <svg width="26" height="24" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M24.3043 13.6435C25.0311 13.3048 25.4902 12.6122 25.4902 11.8545C25.4902 11.0969 25.0311 10.4043 24.3043 10.0655C19.4063 7.78274 8.69939 2.79302 3.16058 0.211583C2.35669 -0.16346 1.38731 -0.0311357 0.732679 0.542768C0.0772376 1.11667 -0.124748 2.00967 0.226497 2.78092C1.59741 5.79411 3.49884 9.97174 4.1551 11.4129C4.22973 11.577 4.23054 11.7623 4.15753 11.9271L0.161603 20.9735C-0.179098 21.7447 0.0293793 22.6317 0.684821 23.1995C1.34026 23.7674 2.30477 23.8967 3.1046 23.5239L24.3043 13.6435ZM23.6651 12.4511L2.46539 22.3315C2.1985 22.4555 1.87646 22.4124 1.65825 22.2234C1.44004 22.0343 1.37028 21.7379 1.48385 21.4808L5.48058 12.4345C5.69879 11.94 5.69555 11.3842 5.47166 10.892C4.81541 9.45077 2.91397 5.27314 1.54306 2.2607C1.42625 2.00362 1.49358 1.7057 1.71179 1.5144C1.93 1.3231 2.25285 1.27924 2.52136 1.404L23.6651 11.2579C23.9068 11.3713 24.0601 11.602 24.0601 11.8545C24.0601 12.1071 23.9068 12.3377 23.6651 12.4511Z" fill="#2D2D2D" fillOpacity="0.5" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        type="task"
        mode="edit"
        initialData={selectedTask}
      />

      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Удаление задачи</h2>
              <button className="modal-close" onClick={handleCloseDeleteModal}>×</button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                Вы уверены, что хотите удалить задачу "{selectedTask?.name}"? Это действие нельзя отменить.
              </p>
              <div className="modal-actions">
                <div className="action-buttons">
                  <button type="button" className="btn-secondary" onClick={handleCloseDeleteModal}>
                    Отменить
                  </button>
                  <button type="button" className="btn-primary" onClick={handleDeleteSubmit} style={{ backgroundColor: '#dc3545' }}>
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TaskInfo;