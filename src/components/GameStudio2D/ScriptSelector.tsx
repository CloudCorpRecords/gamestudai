import React, { useState, useEffect } from 'react';
import { ScriptLibrary } from './types';
import scriptIntegration from './ScriptIntegration';
import './GameStudio2D.css';

interface ScriptSelectorProps {
  onScriptSelect: (scriptId: string) => void;
  onCancel: () => void;
  currentScriptId?: string;
}

const ScriptSelector: React.FC<ScriptSelectorProps> = ({ 
  onScriptSelect, 
  onCancel,
  currentScriptId 
}) => {
  const [scripts, setScripts] = useState<ScriptLibrary['scripts']>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Load scripts on component mount
  useEffect(() => {
    const loadScripts = async () => {
      try {
        setLoading(true);
        await scriptIntegration.initialize();
        const scriptLibrary = scriptIntegration.getAvailableScripts();
        setScripts(scriptLibrary.scripts);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load scripts: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };

    loadScripts();
  }, []);

  // Get unique categories from scripts
  const categories = ['All', ...new Set(scripts.map(script => script.category))];

  // Filter scripts based on search term and category
  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || script.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle script selection
  const handleScriptSelect = (scriptId: string) => {
    onScriptSelect(scriptId);
  };

  return (
    <div className="script-selector">
      <div className="script-selector-header">
        <h3>Select Visual Script</h3>
        <button className="close-button" onClick={onCancel}>×</button>
      </div>

      <div className="script-selector-filters">
        <input
          type="text"
          placeholder="Search scripts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="script-search-input"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="script-category-select"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="script-loading">Loading scripts...</div>
      ) : error ? (
        <div className="script-error">{error}</div>
      ) : filteredScripts.length === 0 ? (
        <div className="no-scripts-found">No scripts found</div>
      ) : (
        <div className="script-list">
          {filteredScripts.map(script => (
            <div 
              key={script.id} 
              className={`script-item ${currentScriptId === script.id ? 'selected' : ''}`}
              onClick={() => handleScriptSelect(script.id)}
            >
              <div className="script-item-header">
                <h4>{script.name}</h4>
                <span className="script-category">{script.category}</span>
              </div>
              <p className="script-description">{script.description}</p>
              <div className="script-meta">
                <span className="script-date">Updated: {new Date(script.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="script-selector-footer">
        <button className="cancel-button" onClick={onCancel}>Cancel</button>
        <button 
          className="create-script-button"
          onClick={() => window.open('/visual-scripting', '_blank')}
        >
          Create New Script
        </button>
      </div>
    </div>
  );
};

export default ScriptSelector; 