import { useEffect, useState } from 'react';
import './List.css';
import { Colleague, ListNode, ListProps } from '../types/types';

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
  const expansionMap = new Map<string, boolean>();

  const collectExpansionState = (items: ListNode[]) => {
    items.forEach(item => {
      expansionMap.set(item.id, item.isExpanded ?? false);
      if (item.children) {
        collectExpansionState(item.children);
      }
    });
  };

  collectExpansionState(oldItems);

  const applyExpansionState = (items: ListNode[]): ListNode[] => {
    return items.map(item => {
      const isExpanded = expansionMap.get(item.id) ?? item.isExpanded ?? false;
      return {
        ...item,
        isExpanded,
        children: item.children ? applyExpansionState(item.children) : undefined
      };
    });
  };

  return applyExpansionState(newItems);
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
    setTreeItems(prevItems =>
      updateItemExpansion(prevItems, id)
    );
  };

  const updateItemExpansion = (items: ListNode[], id: string): ListNode[] => {
    return items.map(item => {
      if (item.id === id) {
        const newExpandedState = !item.isExpanded;
        const updatedItem = { ...item, isExpanded: newExpandedState };
        onItemToggle?.(updatedItem);
        return updatedItem;
      }
      if (item.children) {
        return {
          ...item,
          children: updateItemExpansion(item.children, id)
        };
      }
      return item;
    });
  };

  const handleItemClick = (item: ListNode) => {
    const hasChildren = item.children && item.children.length > 0;
    const isColleague = item.type === 'colleague';

    // Для элементов с детьми (офисы) - только разворачиваем/сворачиваем
    if (hasChildren && !isColleague) {
      toggleExpand(item.id);
    }

    // Для сотрудников - устанавливаем активный элемент
    if (isColleague) {
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

    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  };

  const renderTreeNode = (item: ListNode, level: number = 0, isRoot: boolean = true): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const canExpand = hasChildren && level < maxLevel;
    const isActive = item.id === activeItemId;
    const isExpandedRoot = isRoot && item.isExpanded && hasChildren;
    const showInfoButton = (item.type === 'release' || item.type === 'project') && item.isExpanded;
    const isTask = item.type === 'task';
    const isColleague = item.type === 'colleague';

    if (isColleague && item.data) {
      const colleague = item.data as Colleague;
      const isColleagueActive = colleague.id === activeItemId;

      return (
        <div
          key={item.id}
          className={`tree-block ${isRoot ? 'root-block' : ''}`}
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
                  <img src={colleague.avatar} alt={colleague.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {colleague.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {colleague.isOnline && <div className="online-indicator" />}
              </div>

              <div className="colleague-info">
                <div className="colleague-name">{colleague.name}</div>
                <div className="colleague-position">{colleague.position}</div>
                <div className="colleague-department">{colleague.department}</div>
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
        className={`tree-block ${isExpandedRoot ? 'expanded-block' : ''} ${isRoot ? 'root-block' : ''}`}
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
            {level === 2 && item.color && (
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

            {showIcons && !canExpand && level != 2 && (
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
            {item.children.map(child => renderTreeNode(child, level + 1, false))}
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
        {treeItems.map(item => renderTreeNode(item, 0, true))}
      </div>
    </div>
  );
};

export default List;