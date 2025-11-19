import { useState } from 'react';
import './List.css';
import { ListNode, ListProps } from '../types/types';

const initializeItemExpansion = (item: ListNode, expanded: boolean): ListNode => {
  return {
    ...item,
    isExpanded: expanded,
    children: item.children ? item.children.map(child =>
      initializeItemExpansion(child, expanded)
    ) : undefined
  };
};

const List = ({
  items,
  onItemClick,
  onItemToggle,
  showIcons = true,
  expandIcon = '❯',
  collapseIcon = '❯',
  indentSize = 15,
  maxLevel = 10,
  className = '',
  style,
  renderItem,
  defaultExpanded = false
}: ListProps) => {
  const [treeItems, setTreeItems] = useState<ListNode[]>(() =>
    items.map(item => initializeItemExpansion(item, defaultExpanded))
  );
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

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

    if (hasChildren) {
      toggleExpand(item.id);
    }

    setActiveItemId(item.id);
    onItemClick?.(item);
  };

  const renderTreeNode = (item: ListNode, level: number = 0, isRoot: boolean = true): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const canExpand = hasChildren && level < maxLevel;
    const isActive = item.id === activeItemId;
    const isExpandedRoot = isRoot && item.isExpanded && hasChildren;

    if (renderItem) {
      return renderItem(item, level);
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

            {showIcons && !canExpand && level != 2 &&(
              <span className="expand-placeholder"></span>
            )}

            <span className="item-title">{item.title}</span>

            {item.badge && (
              <span className="item-badge">{item.badge}</span>
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