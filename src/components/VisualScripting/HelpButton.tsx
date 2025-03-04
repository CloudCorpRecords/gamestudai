import React, { useState } from 'react';
import { FaQuestion } from 'react-icons/fa';
import Documentation from './Documentation';
import './HelpButton.css';

const HelpButton: React.FC = () => {
  const [showDocs, setShowDocs] = useState<boolean>(false);

  const handleOpenHelp = () => {
    setShowDocs(true);
  };

  const handleCloseHelp = () => {
    setShowDocs(false);
  };

  return (
    <>
      <button 
        className="floating-help-button" 
        onClick={handleOpenHelp}
        title="Open documentation"
      >
        <FaQuestion />
      </button>
      
      {showDocs && (
        <Documentation onClose={handleCloseHelp} />
      )}
    </>
  );
};

export default HelpButton; 