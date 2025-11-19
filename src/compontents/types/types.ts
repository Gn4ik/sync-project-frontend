export type TaskStatus =
  | 'primary'
  | 'on-review'
  | 'on-work'
  | 'completed'
  | 'to-execution'
  | 'stopped'
  | 'closed';

export type TaskItem = {
  id: string;
  title: string;
  isExpanded?: boolean;
  isActive?: boolean;
  executor: number;
  status: TaskStatus;
  createdDate: string;
  deadline: string;
  description: string;
}

export type ReleaseItem = {
  id: string;
  title: string;
  children?: ProjectItem[];
  isExpanded?: boolean;
  isActive?: boolean;
}

export type ProjectItem = {
  id: string;
  title: string;
  children?: TaskItem[];
  isExpanded?: boolean;
  isActive?: boolean;
}

export type TasksListProps = {
  items: ReleaseItem[];
  onItemClick?: (item: TaskItem) => void;
}

export type TaskInfoProps = {
  selectedTask?: TaskItem | null;
}

export type Colleague = {
  id: string;
  name: string;
  position: string;
  department?: string;
  avatar?: string;
  isOnline?: boolean;
}

export type ColleagueListProps = {
  items: Colleague[];
  onItemClick?: (colleague: Colleague) => void;
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