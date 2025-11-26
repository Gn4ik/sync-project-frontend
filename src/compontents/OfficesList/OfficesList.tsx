import React, { useState, useEffect } from 'react';
import { Office, Colleague } from '../types/types';
import ColleaguesList from '../ColleaguesList/ColleaguesList';
import './OfficesList.css';
import searchIcon from '../../icons/SearchIcon.svg';

interface OfficesListProps {
  items: Office[];
  onColleagueSelect?: (colleague: Colleague) => void;
}

const OfficesList: React.FC<OfficesListProps> = ({ items, onColleagueSelect }) => {
  const [expandedOffices, setExpandedOffices] = useState<Set<string>>(new Set());
  const [hoveredOffice, setHoveredOffice] = useState<string | null>(null);
  const [activeColleagueId, setActiveColleagueId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOffices, setFilteredOffices] = useState<Office[]>(items);

  const toggleOffice = (officeId: string) => {
    setExpandedOffices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(officeId)) {
        newSet.delete(officeId);
      } else {
        newSet.add(officeId);
      }
      return newSet;
    });
  };

  const handleColleagueClick = (colleague: Colleague) => {
    setActiveColleagueId(colleague.id);
    onColleagueSelect?.(colleague);
  };

  const handleInfoMouseEnter = (officeId: string) => {
    setHoveredOffice(officeId);
  };

  const handleInfoMouseLeave = () => {
    setHoveredOffice(null);
  };

  const searchOffices = (query: string, offices: Office[]): Office[] => {
    if (!query.trim()) return offices;

    const lowercaseQuery = query.toLowerCase();

    return offices.filter(office => {
      const officeNameMatch = office?.name?.toLowerCase().includes(lowercaseQuery) || false;
      const managerMatch = office?.manager?.toLowerCase().includes(lowercaseQuery) || false;

      const colleaguesMatch = office?.colleagues?.some(colleague => {
        if (!colleague) return false;

        const fnameMatch = colleague.fname?.toLowerCase().includes(lowercaseQuery) || false;
        const mnameMatch = colleague.mname?.toLowerCase().includes(lowercaseQuery) || false;
        const lnameMatch = colleague.lname?.toLowerCase().includes(lowercaseQuery) || false;
        const positionMatch = colleague.position?.toLowerCase().includes(lowercaseQuery) || false;

        const departmentMatch = colleague.employee_departments?.[0]?.office?.toLowerCase().includes(lowercaseQuery) || false;

        return fnameMatch || mnameMatch || lnameMatch || positionMatch || departmentMatch;
      }) || false;

      return officeNameMatch || managerMatch || colleaguesMatch;
    });
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredOffices(searchOffices(searchQuery, items));
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

  return (
    <div className="offices-list-container">
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder='Поиск офисов и сотрудников'
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

      <div className="offices-list">
        {filteredOffices.map(office => {
          const isExpanded = expandedOffices.has(office.id);

          return (
            <div key={office.id} className={`office-block ${isExpanded ? 'expanded' : ''}`}>
              <div
                className="office-header"
                onClick={() => toggleOffice(office.id)}
              >
                <div className="office-header-content">
                  <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                    ❯
                  </span>

                  <span className="office-title">{office.name}</span>

                  <div className="office-header-right">
                    <div className="office-info-wrapper">
                      {isExpanded && (
                        <>
                          <button
                            className="info-button"
                            onMouseEnter={() => handleInfoMouseEnter(office.id)}
                            onMouseLeave={handleInfoMouseLeave}
                            title={`Руководитель: ${office.manager}`}
                          >
                            ℹ
                          </button>

                          {hoveredOffice === office.id && (
                            <div className="manager-tooltip">
                              Руководитель: {office.manager}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="office-colleagues">
                  <ColleaguesList
                    items={office.colleagues}
                    onItemClick={handleColleagueClick}
                    activeColleagueId={activeColleagueId}
                    onActiveColleagueChange={setActiveColleagueId}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {searchQuery && filteredOffices.length === 0 && (
        <div className="no-results">
          Ничего не найдено
        </div>
      )}
    </div>
  );
};

export default OfficesList;