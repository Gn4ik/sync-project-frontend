import { TaskItem, ListNode, ReleaseItem, ProjectItem, getTaskStatusFromAlias } from '@types';
import List from '../List/List';
import { useMemo } from 'react';

type TasksListProps = {
  items: ReleaseItem[];
  onItemClick?: (item: TaskItem) => void;
  onInfoClick?: (item: ListNode) => void;
};

const TasksList = ({ items, onItemClick, onInfoClick }: TasksListProps) => {
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
          status: getTaskStatusFromAlias(task.status.alias)
        }))
      }))
    }));
  }, [items]);

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
