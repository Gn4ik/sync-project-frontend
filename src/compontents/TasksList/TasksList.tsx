import { TaskItem, TasksListProps, ListNode } from '../types/types';
import List from '../List/List';
import { useMemo } from 'react';

const generateDeterministicColor = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

const TasksList = ({ items, onItemClick }: TasksListProps) => {
  const listItems: ListNode[] = useMemo(() => {
    return items.map(release => ({
      ...release,
      type: 'release',
      children: release.children?.map(project => ({
        ...project,
        type: 'project',
        children: project.children?.map(task => ({
          ...task,
          type: 'task',
          color: generateDeterministicColor(task.id),
          status: task.status || 'primary'
        }))
      }))
    })) as ListNode[];
  }, [items]);
  
  const handleItemClick = (item: ListNode) => {
    if (item.type === 'task') {
      onItemClick?.(item as TaskItem);
    }
  };

  return (
    <List 
      items={listItems}
      onItemClick={handleItemClick}
      indentSize={15}
      className="tasks-tree"
      defaultExpanded={false}
    />
  );
};

export default TasksList;