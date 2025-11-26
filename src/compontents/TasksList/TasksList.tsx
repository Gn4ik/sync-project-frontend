import { TaskItem, ListNode, ReleaseItem, ProjectItem } from '../types/types';
import List from '../List/List';
import { useMemo } from 'react';

type TasksListProps = {
  items: ReleaseItem[];
  onItemClick?: (item: TaskItem) => void;
  onInfoClick?: (item: ListNode) => void;
  statuses?: Array<{ id: number; alias: string }>;
};

const generateDeterministicColor = (id: number): string => {
  let hash = 0;
  const idStr = id.toString();
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];

  return colors[Math.abs(hash) % colors.length];
};

const getStatusAlias = (statusId: number, statuses?: Array<{ id: number; alias: string }>): string => {
  if (!statuses) return `Статус ${statusId}`;
  const status = statuses.find(s => s.id === statusId);
  return status?.alias || `Статус ${statusId}`;
};

const TasksList = ({ items, onItemClick, onInfoClick, statuses }: TasksListProps) => {
  const listItems: ListNode[] = useMemo(() => {
    return items.map(release => ({
      id: `release-${release.id}`,
      title: release.name,
      type: 'release',
      data: release,

      children: release.projects?.map(project => ({
        id: `project-${project.id}`,
        title: project.name,
        type: 'project',
        data: project,

        children: project.tasks?.map(task => ({
          id: `task-${task.id}`,
          title: task.name,
          type: 'task',
          data: task,
          deadline: task.end_date,
          color: generateDeterministicColor(task.id),
          status: getStatusAlias(task.status_id, statuses)
        }))
      }))
    }));
  }, [items, statuses]);

  const handleItemClick = (node: ListNode) => {
    if (node.type === 'task' && node.data) {
      onItemClick?.(node.data as TaskItem);
    }
  };

  return (
    <List
      items={listItems}
      onItemClick={handleItemClick}
      onInfoClick={onInfoClick}
      indentSize={15}
      defaultExpanded={false}
      className="tasks-tree"
    />
  );
};

export default TasksList;
