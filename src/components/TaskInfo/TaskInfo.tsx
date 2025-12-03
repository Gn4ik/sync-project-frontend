import { useEffect, useRef, useState } from 'react';
import { CalendarItem, Employee, getTaskStatusFromAlias, Meeting, ProjectItem, Status, TaskItem } from '@types';
import TaskInfoUI from '@ui/TaskInfo';
import { tasksAPI } from '@utils/api';
import Preloader from '@components/Preloader';

type TaskInfoProps = {
  selectedTask?: TaskItem | null;
  userRole: string | null;
  userId: number;
  statuses?: Status[];
  onStatusChange?: (taskId: number, newStatusId: number) => void;
  projects: ProjectItem[];
  employees: Employee[];
  onTaskUpdate?: (mode: string) => void;
  loading?: boolean;
  employeeCalendar?: CalendarItem[];
  meetings?: Meeting[];
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

const TaskInfo = ({
  selectedTask,
  userRole,
  statuses,
  userId,
  onStatusChange,
  projects,
  employees,
  loading = false,
  employeeCalendar,
  meetings,
  onTaskUpdate
}: TaskInfoProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isManagerPopupOpen, setIsManagerPopupOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const managerButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea();

  const taskStatus = getTaskStatusFromAlias(selectedTask?.status.alias || '');
  const lineClass = `line status-${taskStatus}`;
  const backgroundClass = `task-info-container status-${taskStatus}`;

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

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight();
  };

  const handleStatusChange = (newStatusId: number) => {
    setIsDropdownOpen(false);
    if (onStatusChange && selectedTask) {
      onStatusChange(selectedTask.id, newStatusId);
    }
  };

  const handleFileDownload = async (fileId: number, fileName: string) => {
    try {

      const response = await tasksAPI.getTaskFiles(fileId);

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response headers:', response);

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading file:', error);
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

  const handleEditSubmit = async (formData: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return false;
      }
      const response = await tasksAPI.updateTask(formData);
      if (response.ok) {
        onTaskUpdate?.('edit');
        setIsEditModalOpen(false);

        if (selectedTask) {
          const updatedTaskResponse = await tasksAPI.getTasksById(selectedTask.id);
          if (updatedTaskResponse.ok) {
            const updatedTask = await updatedTaskResponse.json();
            selectedTask = updatedTask;
          }
        }
      }
      return response.ok;
    } catch (error) {
      console.error('Ошибка сети:', error);
      return false;
    }
  };

  const handleDeleteSubmit = async (taskId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return;
      }
      const response = await tasksAPI.deleteTask(taskId);
      if (response.ok) {
        setIsDeleteModalOpen(false);
        onTaskUpdate?.('delete');
      }
    }
    catch (error) {
      console.error('Ошибка сети:', error);
    }
  };

  const handleCommentSubmit = async (taskId: number, text: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return;
      }
      const response = await tasksAPI.commentTask(taskId, text);
      if (response.ok) {
        onTaskUpdate?.('comment');
      }
    }
    catch (error) {
      console.error('Ошибка сети:', error);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleToggleManagerPopup = () => {
    setIsManagerPopupOpen(!isManagerPopupOpen);
  };

  const handleCloseManagerPopup = () => {
    setIsManagerPopupOpen(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading)
    return <Preloader />

  return (
    <TaskInfoUI
      selectedTask={selectedTask}
      userRole={userRole}
      statuses={statuses}
      userId={userId}
      taskStatus={taskStatus}
      lineClass={lineClass}
      backgroundClass={backgroundClass}
      isDropdownOpen={isDropdownOpen}
      isManagerPopupOpen={isManagerPopupOpen}
      isEditModalOpen={isEditModalOpen}
      isDeleteModalOpen={isDeleteModalOpen}
      managerButtonRef={managerButtonRef}
      dropdownRef={dropdownRef}
      textareaRef={textareaRef}
      projects={projects}
      employees={employees}
      employeeCalendar={employeeCalendar}
      meetings={meetings}
      parseDate={parseDate}
      onTextareaInput={handleTextareaInput}
      onStatusChange={handleStatusChange}
      onToggleDropdown={handleToggleDropdown}
      onToggleManagerPopup={handleToggleManagerPopup}
      onCloseManagerPopup={handleCloseManagerPopup}
      onEditTask={handleEditTask}
      onDeleteTask={handleDeleteTask}
      onEditSubmit={handleEditSubmit}
      onDeleteSubmit={handleDeleteSubmit}
      onCloseEditModal={handleCloseEditModal}
      onCloseDeleteModal={handleCloseDeleteModal}
      onFileDownload={handleFileDownload}
      onCommentSubmit={handleCommentSubmit}
    />
  );
};

export default TaskInfo;