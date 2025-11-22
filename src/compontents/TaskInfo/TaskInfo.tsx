import Calendar from '../Calendar/Calendar';
import './TaskInfo.css';
import { TaskInfoProps } from '../types/types';
import '@styles/styles.css';
import linkIcon from '../../icons/LinkIcon.svg';
import { useEffect, useRef, useState } from 'react';
import '@styles/styles.css';

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

const TaskInfo = ({ selectedTask, onStatusChange }: TaskInfoProps
  & { onStatusChange?: (newStatus: string) => void }) => {
  const getStatusClass = (status?: string) => {
    if (!status) return '';
    return status.toLowerCase().replace('_', '-');
  };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [hasText, setHasText] = useState(false);

  const status = selectedTask?.status || 'primary';
  const lineClass = `line status-${getStatusClass(status)}`;
  const backgroundClass = `task-info-container status-${getStatusClass(status)}`;

  const { textareaRef, adjustHeight } = useAutoResizeTextarea();

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    setHasText(e.target.value.trim().length > 0);
  };

  const statusArray = [
    { value: 'on-review', label: 'На ревью' },
    { value: 'to-execution', label: 'К выполнению' },
    { value: 'on-work', label: 'В работе' },
    { value: 'completed', label: 'Завершена' },
    { value: 'stopped', label: 'Остановлена' },
    { value: 'closed', label: 'Закрыта' }
  ];

  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  const parseStatus = (statusString: string): string => {
    const statusMap: Record<string, string> = {
      'on-review': 'На ревью',
      'to-execution': 'К выполнению',
      'on-work': 'В работе',
      'completed': 'Завершена',
      'stopped': 'Остановлена',
      'closed': 'Закрыта'
    };

    return statusMap[statusString];
  }

  const parseDate = (dateString: string): string => {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`
  }

  const handleStatusChange = (newStatus: string) => {
    setIsDropdownOpen(false);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className={backgroundClass}>
        <div className='line-container'>
          <div className={lineClass} />
          {selectedTask && (
            <div className='task-info'>
              <div className='main-info'>
                <div>
                  <div className='task-title-container'>
                    <h2 className='task-title'>{selectedTask.title}</h2>
                    <div className='meta-info'>
                      <p className='created-at'>Создано:
                        <span className='created-at'>  {parseDate(selectedTask.createdDate)}</span>
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
                        <span className='status-badge'>{parseStatus(selectedTask.status)}</span>
                        <span className={`dropdown-arrow ${isDropdownOpen ? 'dropdown-arrow-open' : ''}`}>❯</span>
                      </div>
                      {isDropdownOpen && (
                        <div className='dropdown-menu'>
                          {statusArray.map((statusItem) => (
                            <div
                              key={statusItem.value}
                              className={`dropdown-item ${selectedTask.status === statusItem.value ? 'dropdown-item-active' : ''
                                }`}
                              onClick={() => handleStatusChange(statusItem.value)}
                            >
                              {statusItem.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className='deadline-section'>
                      <span className='section-label'>Срок:</span>
                      <span className='deadline-date'>{parseDate(selectedTask.deadline)}</span>
                    </div>
                  </div>
                </div>
                <Calendar status={status} />
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
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M24.3043 13.6435C25.0311 13.3048 25.4902 12.6122 25.4902 11.8545C25.4902 11.0969 25.0311 10.4043 24.3043 10.0655C19.4063 7.78274 8.69939 2.79302 3.16058 0.211583C2.35669 -0.16346 1.38731 -0.0311357 0.732679 0.542768C0.0772376 1.11667 -0.124748 2.00967 0.226497 2.78092C1.59741 5.79411 3.49884 9.97174 4.1551 11.4129C4.22973 11.577 4.23054 11.7623 4.15753 11.9271L0.161603 20.9735C-0.179098 21.7447 0.0293793 22.6317 0.684821 23.1995C1.34026 23.7674 2.30477 23.8967 3.1046 23.5239L24.3043 13.6435ZM23.6651 12.4511L2.46539 22.3315C2.1985 22.4555 1.87646 22.4124 1.65825 22.2234C1.44004 22.0343 1.37028 21.7379 1.48385 21.4808L5.48058 12.4345C5.69879 11.94 5.69555 11.3842 5.47166 10.892C4.81541 9.45077 2.91397 5.27314 1.54306 2.2607C1.42625 2.00362 1.49358 1.7057 1.71179 1.5144C1.93 1.3231 2.25285 1.27924 2.52136 1.404L23.6651 11.2579C23.9068 11.3713 24.0601 11.602 24.0601 11.8545C24.0601 12.1071 23.9068 12.3377 23.6651 12.4511Z" fill="#2D2D2D" fill-opacity="0.5" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div >
      </div >
    </>
  );
}

export default TaskInfo;