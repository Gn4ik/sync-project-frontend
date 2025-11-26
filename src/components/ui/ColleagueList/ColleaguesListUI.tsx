import React from 'react';
import { Colleague } from '@types';
import './ColleaguesList.css';
import searchIcon from '@icons/SearchIcon.svg';

interface ColleaguesListUIProps {
  items: Colleague[];
  searchQuery: string;
  activeColleagueId?: string | null;
  onItemClick: (colleague: Colleague) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
}

const ColleaguesListUI: React.FC<ColleaguesListUIProps> = ({
  items,
  searchQuery,
  activeColleagueId,
  onItemClick,
  onSearchChange,
  onClearSearch
}) => {
  return (
    <>
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder='Поиск сотрудников'
            value={searchQuery}
            onChange={onSearchChange}
            className="search-input"
          />
          {searchQuery ? (
            <button className="search-clear" onClick={onClearSearch}>
              ×
            </button>
          ) : (
            <img src={searchIcon} alt="Search" className="search-icon" />
          )}
        </div>
      </div>
      <div className="colleagues-list">
        {items.map(colleague => (
          <div
            key={colleague.id}
            className={`colleague-item ${activeColleagueId === colleague.id ? 'active' : ''}`}
            onClick={() => onItemClick(colleague)}
          >
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
              <div className="colleague-name">
                {colleague.lname} {colleague.fname} {colleague.mname}
              </div>
              <div className="colleague-position">{colleague.position}</div>
            </div>
          </div>
        ))}
      </div>
      {searchQuery && items.length === 0 && (
        <div className="no-results">
          Сотрудники не найдены
        </div>
      )}
    </>
  );
};

export default ColleaguesListUI;