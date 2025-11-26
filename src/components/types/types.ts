export type TaskStatus =
  | 'primary'
  | 'on-review'
  | 'on-work'
  | 'completed'
  | 'to-execution'
  | 'stopped'
  | 'closed';

export type User = {
  id: number;
  enroll: string;
  role: 'executor' | 'manager' | 'admin';
  name: string;
}

export type Office = {
  colleagues: Colleague[];
  id: string;
  name: string;
  manager: string;
}

export type Schedule = {
  sun_id: number;
  mon_id: number;
  wed_id: number;
  fri_id: number;
  id: number;
  tue_id: number;
  thu_id: number;
  sat_id: number;
  fri: WorkDay;
  tue: WorkDay;
  sat: WorkDay;
  wed: WorkDay;
  sun: WorkDay;
  thu: WorkDay;
  mon: WorkDay;
}

export type TaskItem = {
  id: number;
  created_at: string;
  end_date: string;
  description: string;
  project_id: number;
  creator_id: number;
  executor_id: number;
  start_date: string;
  name: string;
  status_id: number;
  task_comments: any[];
  task_files: any[];
  isExpanded?: boolean;
  isActive?: boolean;
  canEdit?: boolean;
  status: Status;
}

export type Status = {
  alias: string;
  id: number;
}

export type Meeting = {
  name: string,
  description: string;
  date: string;
  id: number;
  creator_id: number;
  link: string;
}

export type WorkDay = {
  endtime: string;
  starttime: string;
  launchbreak_end: string;
  launchbreak_start: string;
}

export type Department = {
  id: number;
  lead_id: number;
  name: string;
}

export type EmployeeDepartment = {
  department_id: number;
  department: Department;
  employee_id: number;
  office: string;
}

export type EmployeeMeeteng = {
  employee_id: number;
  meeting_id: number;
  meeting: Meeting;
}

export type ProjectItem = {
  id: number;
  created_at: string;
  status_id: number;
  name: string;
  description: string;
  manager_id: number;
  release_id: number;
  tasks: TaskItem[];
  isExpanded?: boolean;
  isActive?: boolean;
}

export type ReleaseItem = {
  id: number;
  description: string;
  status_id: number;
  name: string;
  version: string;
  projects: ProjectItem[];
  isExpanded?: boolean;
  isActive?: boolean;
}

export interface Colleague {
  id: string;
  fname: string;
  lname: string;
  mname: string;
  position: string;
  avatar?: string;
  dob?: string;
  phone?: string;
  email?: string;
  employee_meetengs: null;
  schedule: Schedule;
  employee_departments: EmployeeDepartment[];
}

export type ListNode = {
  id: string;
  title: string;
  type?: string;
  children?: ListNode[];
  isExpanded?: boolean;
  isActive?: boolean;
  icon?: string | React.ReactNode;
  badge?: string | number;
  data?: any;
  color?: string;
  deadline?: string;
}

export type ListProps = {
  items: ListNode[];
  onItemClick?: (item: ListNode) => void;
  onItemToggle?: (item: ListNode) => void;
  showIcons?: boolean;
  expandIcon?: string | React.ReactNode;
  collapseIcon?: string | React.ReactNode;
  indentSize?: number;
  maxLevel?: number;
  className?: string;
  style?: React.CSSProperties;
  renderItem?: (item: ListNode, level: number) => React.ReactNode;
  defaultExpanded?: boolean;
}

export type CreateTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskFormData) => void;
}

export type TaskFormData = {
  title: string;
  project: string;
  assignee: string;
  deadline: string;
  description: string;
}

export const getTaskStatusFromAlias = (alias: string): TaskStatus => {
  const statusMap: Record<string, TaskStatus> = {
    'Создан': 'to-execution',
    'Активен': 'on-work',
    'Приостановлен': 'stopped',
    'Завершен': 'completed',
    'Отменен': 'closed',
    'Согласовывается': 'on-review'
  };

  return statusMap[alias] || 'primary';
};
