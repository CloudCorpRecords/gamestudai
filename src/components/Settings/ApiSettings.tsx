import React, { useState, useEffect } from 'react';
import './ApiSettings.css';

interface ApiKey {
  name: string;
  key: string;
  description: string;
}

const ApiSettings: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      name: 'replicate',
      key: '',
      description: 'Used for AI model generation with Replicate API'
    },
    {
      name: 'openai',
      key: '',
      description: 'Used for AI text generation and assistance'
    }
  ]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const loadApiKeys = () => {
      const savedKeys = apiKeys.map(apiKey => {
        const savedValue = localStorage.getItem(`apiKey_${apiKey.name}`);
        return {
          ...apiKey,
          key: savedValue || ''
        };
      });
      setApiKeys(savedKeys);
    };

    loadApiKeys();
  }, []);

  const handleApiKeyChange = (name: string, value: string) => {
    setApiKeys(prevKeys => 
      prevKeys.map(key => 
        key.name === name ? { ...key, key: value } : key
      )
    );
    setSaveStatus('idle');
  };

  const saveApiKeys = () => {
    setSaveStatus('saving');
    
    try {
      apiKeys.forEach(apiKey => {
        localStorage.setItem(`apiKey_${apiKey.name}`, apiKey.key);
      });
      
      setTimeout(() => {
        setSaveStatus('saved');
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      }, 500);
    } catch (error) {
      console.error('Error saving API keys:', error);
      setSaveStatus('error');
    }
  };

  const clearApiKeys = () => {
    if (window.confirm('Are you sure you want to clear all API keys?')) {
      apiKeys.forEach(apiKey => {
        localStorage.removeItem(`apiKey_${apiKey.name}`);
      });
      
      setApiKeys(prevKeys => 
        prevKeys.map(key => ({ ...key, key: '' }))
      );
      
      setSaveStatus('idle');
    }
  };

  return (
    <div className="api-settings">
      <h2>API Settings</h2>
      <p className="api-description">
        Configure API keys for external services. These keys are stored locally in your browser and are never sent to our servers.
      </p>
      
      <div className="api-keys-container">
        {apiKeys.map((apiKey) => (
          <div key={apiKey.name} className="api-key-item">
            <label htmlFor={`api-key-${apiKey.name}`}>
              {apiKey.name.charAt(0).toUpperCase() + apiKey.name.slice(1)} API Key
            </label>
            <input
              id={`api-key-${apiKey.name}`}
              type="password"
              value={apiKey.key}
              onChange={(e) => handleApiKeyChange(apiKey.name, e.target.value)}
              placeholder={`Enter your ${apiKey.name} API key`}
            />
            <p className="api-key-description">{apiKey.description}</p>
          </div>
        ))}
      </div>
      
      <div className="api-actions">
        <button 
          className="save-button"
          onClick={saveApiKeys}
          disabled={saveStatus === 'saving' || saveStatus === 'saved'}
        >
          {saveStatus === 'idle' && 'Save API Keys'}
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && 'Saved!'}
          {saveStatus === 'error' && 'Error Saving'}
        </button>
        
        <button 
          className="clear-button"
          onClick={clearApiKeys}
        >
          Clear All Keys
        </button>
      </div>
      
      {saveStatus === 'error' && (
        <p className="error-message">
          There was an error saving your API keys. Please try again.
        </p>
      )}
      
      <div className="api-security-note">
        <h3>Security Note</h3>
        <p>
          Your API keys are stored only in your browser's local storage and are never transmitted to our servers.
          They are used directly from your browser to make API calls to the respective services.
          For maximum security, consider using environment-specific API keys with appropriate usage limits.
        </p>
      </div>
    </div>
  );
};

export default ApiSettings; 