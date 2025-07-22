// Options page script for Quick English Translate

document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const elements = {
    provider: document.getElementById('provider'),
    apiKey: document.getElementById('apiKey'),
    toggleApiKey: document.getElementById('toggleApiKey'),
    apiKeyLink: document.getElementById('apiKeyLink'),
    apiStatus: document.getElementById('apiStatus'),
    providerDescription: document.getElementById('providerDescription'),
    autoCopy: document.getElementById('autoCopy'),
    showOverlay: document.getElementById('showOverlay'),
    maxChars: document.getElementById('maxChars'),
    autoCloseDelay: document.getElementById('autoCloseDelay'),
    clearHistory: document.getElementById('clearHistory'),
    saveSettings: document.getElementById('saveSettings'),
    resetSettings: document.getElementById('resetSettings'),
    statusMessage: document.getElementById('statusMessage'),
    statusText: document.getElementById('statusText'),
    closeStatus: document.getElementById('closeStatus')
  };

  // Provider descriptions and URLs
  const providerInfo = {
    deepl: {
      description: 'DeepL offers high-quality translations with superior accuracy for many language pairs',
      url: 'https://www.deepl.com/pro-api'
    },
    google: {
      description: 'Google Cloud Translate supports 100+ languages with fast translation speeds',
      url: 'https://cloud.google.com/translate/docs/setup'
    },
    openai: {
      description: 'OpenAI GPT provides contextual translations with natural language understanding',
      url: 'https://platform.openai.com/api-keys'
    }
  };

  // Initialize options page
  init();

  function init() {
    loadSettings();
    setupEventListeners();
    updateProviderInfo();
  }

  function setupEventListeners() {
    // Provider change
    elements.provider.addEventListener('change', function() {
      updateProviderInfo();
      validateApiKey();
    });

    // API key input
    elements.apiKey.addEventListener('input', debounce(validateApiKey, 500));
    
    // API key visibility toggle
    elements.toggleApiKey.addEventListener('click', toggleApiKeyVisibility);

    // Clear history
    elements.clearHistory.addEventListener('click', handleClearHistory);

    // Save settings
    elements.saveSettings.addEventListener('click', saveSettings);

    // Reset settings
    elements.resetSettings.addEventListener('click', handleResetSettings);

    // Close status message
    elements.closeStatus.addEventListener('click', hideStatusMessage);

    // Auto-hide status message
    let statusTimeout;
    function showStatusMessage(message, type = 'success') {
      clearTimeout(statusTimeout);
      
      elements.statusText.textContent = message;
      elements.statusMessage.className = `status-message ${type}`;
      elements.statusMessage.classList.remove('hidden');
      
      statusTimeout = setTimeout(hideStatusMessage, 5000);
    }

    // Make showStatusMessage available globally
    window.showStatusMessage = showStatusMessage;
  }

  function loadSettings() {
    chrome.runtime.sendMessage({ action: 'getSettings' }, (settings) => {
      if (settings) {
        elements.provider.value = settings.provider || 'deepl';
        elements.apiKey.value = settings.apiKey || '';
        elements.autoCopy.checked = settings.autoCopy !== false;
        elements.showOverlay.checked = settings.showOverlay !== false;
        elements.maxChars.value = settings.maxChars || 5000;
        elements.autoCloseDelay.value = Math.round((settings.autoCloseDelay || 30000) / 1000);
        
        updateProviderInfo();
        validateApiKey();
      }
    });
  }

  function updateProviderInfo() {
    const provider = elements.provider.value;
    const info = providerInfo[provider];
    
    if (info) {
      elements.providerDescription.textContent = info.description;
      elements.apiKeyLink.href = info.url;
      elements.apiKeyLink.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15,3 21,3 21,9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
        Get ${provider.toUpperCase()} API key
      `;
    }
  }

  function validateApiKey() {
    const apiKey = elements.apiKey.value.trim();
    
    if (!apiKey) {
      elements.apiStatus.textContent = '';
      elements.apiStatus.className = 'api-status';
      return;
    }

    // Basic validation based on provider
    const provider = elements.provider.value;
    let isValid = false;
    let message = '';

    switch (provider) {
      case 'deepl':
        // DeepL API keys end with ':fx' (free) or are UUID-like (pro)
        isValid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(:fx)?$/i.test(apiKey);
        message = isValid ? 'API key format is valid' : 'Invalid DeepL API key format';
        break;
        
      case 'google':
        // Google API keys are typically 39 characters long and alphanumeric with underscores/dashes
        isValid = /^AIza[0-9A-Za-z_-]{35,}$/.test(apiKey);
        message = isValid ? 'API key format is valid' : 'Invalid Google API key format';
        break;
        
      case 'openai':
        // OpenAI API keys start with 'sk-' and are followed by more characters
        isValid = /^sk-[a-zA-Z0-9]{20,}$/.test(apiKey);
        message = isValid ? 'API key format is valid' : 'Invalid OpenAI API key format';
        break;
    }

    elements.apiStatus.textContent = message;
    elements.apiStatus.className = `api-status ${isValid ? 'valid' : 'invalid'}`;
  }

  function toggleApiKeyVisibility() {
    const isPassword = elements.apiKey.type === 'password';
    elements.apiKey.type = isPassword ? 'text' : 'password';
    
    const eyeIcon = elements.toggleApiKey.querySelector('svg');
    if (isPassword) {
      // Show eye-off icon
      eyeIcon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94l1.42 1.42A16.1 16.1 0 0 0 3 12s3.14 5.79 8 6.64"></path>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-1.42-1.42A16.1 16.1 0 0 0 21 12s-3.14-5.79-8-6.64z"></path>
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M21 21l-18-18"></path>
      `;
    } else {
      // Show eye icon
      eyeIcon.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      `;
    }
  }

  function handleClearHistory() {
    if (confirm('Are you sure you want to clear all translation history? This action cannot be undone.')) {
      chrome.runtime.sendMessage({ action: 'clearHistory' }, (response) => {
        if (response && response.success) {
          showStatusMessage('Translation history cleared successfully');
        } else {
          showStatusMessage('Failed to clear history', 'error');
        }
      });
    }
  }

  function saveSettings() {
    const settings = {
      provider: elements.provider.value,
      apiKey: elements.apiKey.value.trim(),
      autoCopy: elements.autoCopy.checked,
      showOverlay: elements.showOverlay.checked,
      maxChars: parseInt(elements.maxChars.value) || 5000,
      autoCloseDelay: (parseInt(elements.autoCloseDelay.value) || 30) * 1000
    };

    // Validate settings
    if (!settings.apiKey) {
      showStatusMessage('Please enter an API key', 'error');
      elements.apiKey.focus();
      return;
    }

    if (settings.maxChars < 100 || settings.maxChars > 10000) {
      showStatusMessage('Maximum characters must be between 100 and 10,000', 'error');
      elements.maxChars.focus();
      return;
    }

    if (settings.autoCloseDelay < 0 || settings.autoCloseDelay > 300000) {
      showStatusMessage('Auto-close delay must be between 0 and 300 seconds', 'error');
      elements.autoCloseDelay.focus();
      return;
    }

    // Save settings
    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: settings
    }, (response) => {
      if (response && response.success) {
        showStatusMessage('Settings saved successfully!');
      } else {
        showStatusMessage('Failed to save settings', 'error');
      }
    });
  }

  function handleResetSettings() {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
      const defaultSettings = {
        provider: 'deepl',
        apiKey: '',
        autoCopy: true,
        showOverlay: true,
        maxChars: 5000,
        autoCloseDelay: 30000
      };

      // Update UI
      elements.provider.value = defaultSettings.provider;
      elements.apiKey.value = defaultSettings.apiKey;
      elements.autoCopy.checked = defaultSettings.autoCopy;
      elements.showOverlay.checked = defaultSettings.showOverlay;
      elements.maxChars.value = defaultSettings.maxChars;
      elements.autoCloseDelay.value = defaultSettings.autoCloseDelay / 1000;

      // Clear API status
      elements.apiStatus.textContent = '';
      elements.apiStatus.className = 'api-status';

      // Update provider info
      updateProviderInfo();

      // Save to storage
      chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: defaultSettings
      }, (response) => {
        if (response && response.success) {
          showStatusMessage('Settings reset to defaults');
        } else {
          showStatusMessage('Failed to reset settings', 'error');
        }
      });
    }
  }

  function hideStatusMessage() {
    elements.statusMessage.classList.add('hidden');
  }

  // Utility function for debouncing
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
});