import React, { useState, useEffect } from 'react';
import './ApiSettings.css';
import axios from 'axios';

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
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const loadApiKeys = () => {
      console.log('Loading API keys from localStorage');
      const savedKeys = apiKeys.map(apiKey => {
        const storageKey = `apiKey_${apiKey.name}`;
        const savedValue = localStorage.getItem(storageKey);
        console.log(`Loaded ${apiKey.name} API key:`, savedValue ? '******' + savedValue.slice(-4) : 'not set');
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
    console.log(`Updating ${name} API key`);
    setApiKeys(prevKeys => 
      prevKeys.map(key => 
        key.name === name ? { ...key, key: value } : key
      )
    );
    setSaveStatus('idle');
  };

  const saveApiKeys = () => {
    console.log('Saving API keys to localStorage');
    setSaveStatus('saving');
    
    try {
      apiKeys.forEach(apiKey => {
        const storageKey = `apiKey_${apiKey.name}`;
        console.log(`Saving ${apiKey.name} API key to ${storageKey}`);
        localStorage.setItem(storageKey, apiKey.key);
      });
      
      setTimeout(() => {
        setSaveStatus('saved');
        console.log('API keys saved successfully');
        
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
      console.log('Clearing all API keys');
      apiKeys.forEach(apiKey => {
        const storageKey = `apiKey_${apiKey.name}`;
        console.log(`Removing ${apiKey.name} API key from ${storageKey}`);
        localStorage.removeItem(storageKey);
      });
      
      setApiKeys(prevKeys => 
        prevKeys.map(key => ({ ...key, key: '' }))
      );
      
      setSaveStatus('idle');
      console.log('All API keys cleared');
    }
  };

  const testReplicateApiKey = async () => {
    const replicateKey = apiKeys.find(k => k.name === 'replicate')?.key;
    
    if (!replicateKey) {
      setTestMessage('Please enter a Replicate API key first');
      setTestStatus('error');
      return;
    }
    
    setTestStatus('testing');
    setTestMessage('Testing API key...');
    
    try {
      console.log('Testing Replicate API key');
      const response = await axios.get('https://api.replicate.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${replicateKey.trim()}`
        }
      });
      
      console.log('API test response:', response.status);
      
      if (response.status === 200) {
        setTestStatus('success');
        setTestMessage('API key is valid!');
        console.log('API key test successful');
      } else {
        setTestStatus('error');
        setTestMessage(`Unexpected response: ${response.status}`);
        console.error('API key test failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setTestStatus('error');
      
      if (axios.isAxiosError(error) && error.response) {
        setTestMessage(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else {
        setTestMessage('Failed to connect to Replicate API');
      }
    }
    
    // Reset status after 5 seconds
    setTimeout(() => {
      setTestStatus('idle');
      setTestMessage('');
    }, 5000);
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
          className="test-button"
          onClick={testReplicateApiKey}
          disabled={testStatus === 'testing'}
        >
          {testStatus === 'idle' && 'Test Replicate API Key'}
          {testStatus === 'testing' && 'Testing...'}
          {testStatus === 'success' && 'API Key Valid!'}
          {testStatus === 'error' && 'API Key Invalid'}
        </button>
        
        <button 
          className="clear-button"
          onClick={clearApiKeys}
        >
          Clear All Keys
        </button>
      </div>
      
      {testMessage && (
        <p className={`test-message ${testStatus === 'error' ? 'error-message' : 'success-message'}`}>
          {testMessage}
        </p>
      )}
      
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