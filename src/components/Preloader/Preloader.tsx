import React from 'react';
import './Preloader.css';

const Preloader: React.FC = () => {
  return (
    <div data-testid="preloader" className="loader-container">
      <div className="spinner"></div>
    </div>
  );
};

export default Preloader;