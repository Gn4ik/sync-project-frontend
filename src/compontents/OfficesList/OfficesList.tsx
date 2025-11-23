import { useEffect, useState } from 'react';
import { Colleague, Office } from '../types/types';
import './OfficesList.css';
import searchIcon from '../../icons/SearchIcon.svg';

interface OfficesListProps {
  items: Office[];
  onOfficeSelect?: (office: Office) => void;
  onColleagueSelect?: (colleague: Colleague) => void;
}

const OfficesList = ({ items, onOfficeSelect, onColleagueSelect }: OfficesListProps) => {
  const [activeOfficeId, setActiveOfficeId] = useState<string | null>(null);
  const [activeColleagueId, setActiveColleagueId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOffices, setFilteredOffices] = useState<Office[]>([]);
  const [expandedOffices, setExpandedOffices] = useState<Set<string>>(new Set());

  const handleOfficeClick = (office: Office) => {
    onOfficeSelect?.(office);
    setActiveOfficeId(office.id);
    setActiveColleagueId(null);

    setExpandedOffices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(office.id)) {
        newSet.delete(office.id);
      } else {
        newSet.add(office.id);
      }
      return newSet;
    });
  };

  const handleColleagueClick = (colleague: Colleague) => {
    onColleagueSelect?.(colleague);
    setActiveColleagueId(colleague.id);
  };

  const searchItems = (query: string, offices: Office[]): Office[] => {
    if (!query.trim()) return offices;

    return offices
      .map(office => {
        const filteredColleagues = office.colleagues?.filter(colleague =>
          colleague.name.toLowerCase().includes(query.toLowerCase()) ||
          colleague.position.toLowerCase().includes(query.toLowerCase()) ||
          (colleague.department && colleague.department.toLowerCase().includes(query.toLowerCase()))
        ) || [];

        if (filteredColleagues.length > 0) {
          return {
            ...office,
            colleagues: filteredColleagues
          };
        }

        if (office.name.toLowerCase().includes(query.toLowerCase())) {
          return office;
        }

        return null;
      })
      .filter(Boolean) as Office[];
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredOffices(searchItems(searchQuery, items));
      const officeIdsWithResults = searchItems(searchQuery, items).map(office => office.id);
      setExpandedOffices(new Set(officeIdsWithResults));
    } else {
      setFilteredOffices(items);
    }
  }, [searchQuery, items]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const getManager = (office: Office): Colleague | null => {
    return office.colleagues?.find(colleague =>
      colleague.position.toLowerCase().includes('руководитель') ||
      colleague.position.toLowerCase().includes('manager') ||
      colleague.position.toLowerCase().includes('глава')
    ) || null;
  };

  return (
    <>
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder='Поиск сотрудников или офисов'
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchQuery ? (
            <button className="search-clear" onClick={clearSearch}>
              ×
            </button>
          ) : (
            <img src={searchIcon} alt="Search" className="search-icon" />
          )}
        </div>
      </div>

      <div className="tree-list-container">
        <div className="tree-list">
          {filteredOffices.map(office => {
            const manager = getManager(office);
            const isExpanded = expandedOffices.has(office.id);
            const hasChildren = office.colleagues && office.colleagues.length > 0;

            return (
              <div key={office.id} className="tree-block">
                <div
                  className={`tree-item level-0 ${activeOfficeId === office.id ? 'active' : ''} ${hasChildren ? 'has-children' : ''} ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => handleOfficeClick(office)}
                  style={{ paddingLeft: '15px' }}
                >
                  <div className="tree-item-content">
                    {hasChildren && (
                      <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                        ❯
                      </span>
                    )}

                    {!hasChildren && (
                      <span className="expand-placeholder"></span>
                    )}

                    <div className="item-content-wrapper">
                      <span className="item-title">{office.name}</span>
                      {manager && (
                        <span className="office-manager">
                          {manager.name}
                        </span>
                      )}
                    </div>

                    <span className="item-badge">
                      {office.colleagues?.length || 0}
                    </span>
                  </div>
                </div>

                {isExpanded && office.colleagues && (
                  <div className="tree-children">
                    {office.colleagues.map(colleague => (
                      <div
                        key={colleague.id}
                        className={`tree-item level-1 ${activeColleagueId === colleague.id ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleColleagueClick(colleague);
                        }}
                        style={{ paddingLeft: '30px' }}
                      >
                        <div className="tree-item-content">
                          <span className="expand-placeholder"></span>

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

                          <div className="item-content-wrapper">
                            <span className="item-title">{colleague.name}</span>
                            <span className="colleague-position">
                              {colleague.position}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {searchQuery && filteredOffices.length === 0 && (
        <div className="no-results">
          Офисы или сотрудники не найдены
        </div>
      )}
    </>
  );
};

export default OfficesList;