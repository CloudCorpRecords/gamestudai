import React, { useState } from 'react';
import ApiSettings from './ApiSettings';
import './Settings.css';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'api' | 'general' | 'appearance'>('api');
  
  return (
    <div className="settings-container">
      <div className="settings-sidebar">
        <h2>Settings</h2>
        <nav className="settings-nav">
          <button
            className={`nav-item ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`nav-item ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            API Keys
          </button>
          <button
            className={`nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
        </nav>
      </div>
      
      <div className="settings-content">
        {activeTab === 'api' && <ApiSettings />}
        
        {activeTab === 'general' && (
          <div className="settings-panel">
            <h2>General Settings</h2>
            <p className="coming-soon">General settings will be available in a future update.</p>
          </div>
        )}
        
        {activeTab === 'appearance' && (
          <div className="settings-panel">
            <h2>Appearance Settings</h2>
            <p className="coming-soon">Appearance settings will be available in a future update.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings; 