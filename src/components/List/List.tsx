import { useEffect, useState } from 'react';
import './List.css';
import { Colleague, ListNode, ListProps } from '@types';

const initializeItemExpansion = (item: ListNode, expanded: boolean): ListNode => {
  return {
    ...item,
    isExpanded: expanded,
    children: item.children ? item.children.map(child =>
      initializeItemExpansion(child, expanded)
    ) : undefined
  };
};

const preserveExpansionState = (oldItems: ListNode[], newItems: ListNode[]): ListNode[] => {
  const map = new Map<string, boolean>();

  const collect = (items: ListNode[]) => {
    items.forEach(i => {
      map.set(i.id, i.isExpanded ?? false);
      if (i.children) collect(i.children);
    });
  };
  collect(oldItems);

  const apply = (items: ListNode[]): ListNode[] =>
    items.map(i => ({
      ...i,
      isExpanded: map.get(i.id) ?? false,
      children: i.children ? apply(i.children) : undefined
    }));

  return apply(newItems);
};

interface ListPropsWithInfo extends ListProps {
  onInfoClick?: (item: ListNode) => void;
}

const List = ({
  items,
  onItemClick,
  onItemToggle,
  onInfoClick,
  showIcons = true,
  expandIcon = '❯',
  collapseIcon = '❯',
  indentSize = 15,
  maxLevel = 10,
  className = '',
  style,
  renderItem,
  defaultExpanded = false
}: ListPropsWithInfo) => {
  const [treeItems, setTreeItems] = useState<ListNode[]>(() =>
    items.map(item => initializeItemExpansion(item, defaultExpanded))
  );
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  useEffect(() => {
    setTreeItems(prevItems =>
      preserveExpansionState(prevItems, items.map(item =>
        initializeItemExpansion(item, defaultExpanded)
      ))
    );
  }, [items, defaultExpanded]);

  const toggleExpand = (id: string) => {
    setTreeItems(prevItems => {
      const updateItem = (items: ListNode[]): ListNode[] => {
        return items.map(item => {
          if (item.id === id) {
            const newExpandedState = !item.isExpanded;
            console.log(item.isExpanded);
            console.log(item.title);
            const updatedItem = { ...item, isExpanded: newExpandedState };
            onItemToggle?.(updatedItem);
            return updatedItem;
          }
          if (item.children) {
            return {
              ...item,
              children: updateItem(item.children)
            };
          }
          return item;
        });
      };
      return updateItem(prevItems);
    });
  };

  const handleItemClick = (item: ListNode) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpandable = item.type === 'release' || item.type === 'project';
    const isColleague = item.type === 'colleague';
    const isTask = item.type === 'task';

    if (hasChildren && isExpandable) {
      toggleExpand(item.id);
      return;
    }

    if (isTask || isColleague) {
      setActiveItemId(item.id);
    }

    onItemClick?.(item);
  };

  const handleInfoClick = (e: React.MouseEvent, item: ListNode) => {
    e.stopPropagation();
    onInfoClick?.(item);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch (error) {
      return dateString;
    }
  };

  const renderTreeNode = (item: ListNode, level: number = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const canExpand = hasChildren && level < maxLevel;
    const isActive = item.id === activeItemId;
    const showInfoButton = (item.type === 'release' || item.type === 'project') && item.isExpanded;
    const isTask = item.type === 'task';
    const isColleague = item.type === 'colleague';

    if (renderItem) {
      return renderItem(item, level);
    }

    if (isColleague && item.data) {
      const colleague = item.data as Colleague;
      const isColleagueActive = colleague.id === activeItemId;

      return (
        <div
          key={item.id}
          className="tree-block"
        >
          <div
            className={`tree-item 
            level-${level} 
            ${isColleagueActive ? 'active' : ''}
            ${canExpand ? 'has-children' : ''}
            ${item.isExpanded ? 'expanded' : ''}
            colleague-item
          `}
            onClick={() => handleItemClick(item)}
            style={{
              paddingLeft: `${15 + (level * indentSize)}px`
            }}
          >
            <div className="tree-item-content">
              <div className="colleague-avatar">
                {colleague.avatar ? (
                  <img src={colleague.avatar} alt={colleague.fname} />
                ) : (
                  <div className="avatar-placeholder">
                    {colleague.fname.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="colleague-info">
                <div className="colleague-name">{colleague.fname} {colleague.mname} {colleague.lname}</div>
                <div className="colleague-position">{colleague.position}</div>
                <div className="colleague-department">{colleague.employee_departments?.[0].office}</div>
              </div>

              {showIcons && !canExpand && (
                <span className="expand-placeholder"></span>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={item.id}
        className="tree-block"
      >
        <div
          className={`tree-item 
          level-${level} 
          ${isActive ? 'active' : ''}
          ${canExpand ? 'has-children' : ''}
          ${item.isExpanded ? 'expanded' : ''}
        `}
          onClick={() => handleItemClick(item)}
          style={{
            paddingLeft: `${15 + (level * indentSize)}px`
          }}
        >
          <div className="tree-item-content">
            {isTask && item.color && (
              <span
                className="task-color-marker"
                style={{ backgroundColor: item.color }}
              />
            )}

            {showIcons && item.icon && (
              <span className="item-icon">{item.icon}</span>
            )}

            {showIcons && canExpand && (
              <span className={`expand-icon ${item.isExpanded ? 'expanded' : ''}`}>
                {item.isExpanded ? collapseIcon : expandIcon}
              </span>
            )}

            {showIcons && !canExpand && !isTask && (
              <span className="expand-placeholder"></span>
            )}

            <div className="item-content-wrapper">
              <span className="item-title">{item.title}</span>
              {isTask && item.deadline && (
                <span className="task-deadline">
                  {formatDate(item.deadline)}
                </span>
              )}
            </div>

            {item.badge && (
              <span className="item-badge">{item.badge}</span>
            )}

            {showInfoButton && (
              <button
                className="info-button"
                onClick={(e) => handleInfoClick(e, item)}
                title="Просмотреть информацию"
              >
                ℹ
              </button>
            )}
          </div>
        </div>

        {hasChildren && item.isExpanded && item.children && (
          <div className="tree-children">
            {item.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`tree-list-container ${className}`}
      style={style}
    >
      <div className="tree-list">
        {treeItems.map(item => renderTreeNode(item, 0))}
      </div>
    </div>
  );
};

export default List;