import Calendar from '../Calendar/Calendar';
import './TaskInfo.css';
import { TaskInfoProps } from '../types/types';
import '@styles/styles.css';
import linkIcon from '../../icons/LinkIcon.svg';

const TaskInfo = ({ selectedTask }: TaskInfoProps) => {
  const getStatusClass = (status?: string) => {
    if (!status) return '';
    return status.toLowerCase().replace('_', '-');
  };

  const status = selectedTask?.status || 'primary';
  const lineClass = `line ${getStatusClass(status)}`;
  const calendarClass = `calendar border-${getStatusClass(status)}`;

  return (
    <>
      <div className='task-info-container'>
        <div className='line-container'>
          <div className={lineClass} />
          {selectedTask ? (
            <div className='task-info'>
              <div className='main-info'>
                <div>
                  <div className='task-title-container'>
                    <h2 className='task-title'>{selectedTask.title}</h2>
                    <div className='meta-info'>
                      <span className='created-at'>Создано: {selectedTask.createdDate}</span>
                      <span className='project-link'>
                        <img src={linkIcon} alt="Ссылка" />
                        Ссылка на проект
                      </span>
                    </div>
                  </div>
                  <div className='meta-info'>
                    <div className='status-section'>
                      <span className='section-label'>Статус:</span>
                      <div className='status-dropdown'>
                        <span className='status-badge'>{selectedTask.status}</span>
                        <span className='dropdown-arrow'>▼</span>
                      </div>
                    </div>
                    <div className='deadline-section'>
                      <span className='section-label'>Срок:</span>
                      <span className='deadline-date'>{selectedTask.deadline}</span>
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

              <div className='manager-section'>
                <div className='manager-header'>
                  <span className='manager-name'>Менеджер</span>
                </div>
                <div className='manager-comment'>
                </div>
                <button className='add-comment-btn'>
                  Добавить комментарий
                </button>
              </div>
            </div>
          )
            :
            <Calendar status={status} />
          }
        </div >
      </div >
    </>
  );
}

export default TaskInfo;