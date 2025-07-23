// Popup script for Quick English Translate

document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const elements = {
    settingsBtn: document.getElementById('settingsBtn'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    settingsPanel: document.getElementById('settingsPanel'),
    autoCopyToggle: document.getElementById('autoCopyToggle'),
    openOptionsBtn: document.getElementById('openOptionsBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    historyList: document.getElementById('historyList'),
    statusIndicator: document.getElementById('statusIndicator'),
    statusText: document.getElementById('statusText'),
    
    // Settings elements
    providerSelect: document.getElementById('providerSelect'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    toggleApiKey: document.getElementById('toggleApiKey'),
    apiKeyHelp: document.getElementById('apiKeyHelp'),
    showOverlayCheck: document.getElementById('showOverlayCheck'),
    maxCharsInput: document.getElementById('maxCharsInput'),
    autoCloseDelayInput: document.getElementById('autoCloseDelayInput'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn')
  };

  // Initialize popup
  init();

  function init() {
    loadSettings();
    loadHistory();
    setupEventListeners();
    updateStatus();
  }

  function setupEventListeners() {
    // Settings panel toggle
    elements.settingsBtn.addEventListener('click', showSettings);
    elements.closeSettingsBtn.addEventListener('click', hideSettings);
    
    // Open options page
    elements.openOptionsBtn.addEventListener('click', openOptionsPage);

    // Auto-copy toggle
    elements.autoCopyToggle.addEventListener('change', function() {
      chrome.runtime.sendMessage({
        action: 'getSettings'
      }, (settings) => {
        settings.autoCopy = elements.autoCopyToggle.checked;
        chrome.runtime.sendMessage({
          action: 'updateSettings',
          settings: settings
        });
      });
    });

    // Clear history
    elements.clearHistoryBtn.addEventListener('click', clearHistory);

    // Provider selection change
    elements.providerSelect.addEventListener('change', updateApiKeyHelp);

    // API key visibility toggle
    elements.toggleApiKey.addEventListener('click', toggleApiKeyVisibility);

    // Save settings
    elements.saveSettingsBtn.addEventListener('click', saveSettings);

    // History item clicks
    elements.historyList.addEventListener('click', handleHistoryClick);
  }

  function loadSettings() {
    chrome.runtime.sendMessage({ action: 'getSettings' }, (settings) => {
      if (settings) {
        elements.autoCopyToggle.checked = settings.autoCopy !== false;
        elements.providerSelect.value = settings.provider || 'deepl';
        elements.apiKeyInput.value = settings.apiKey || '';
        elements.showOverlayCheck.checked = settings.showOverlay !== false;
        elements.maxCharsInput.value = settings.maxChars || 5000;
        elements.autoCloseDelayInput.value = (settings.autoCloseDelay || 30000) / 1000;
        
        updateApiKeyHelp();
        updateStatus();
      }
    });
  }

  function loadHistory() {
    chrome.runtime.sendMessage({ action: 'getHistory' }, (history) => {
      displayHistory(history || []);
    });
  }

  function displayHistory(history) {
    if (!history.length) {
      elements.historyList.innerHTML = '<div class="no-history">No translations yet</div>';
      return;
    }

    const historyHTML = history.slice(0, 10).map(item => {
      const date = new Date(item.timestamp).toLocaleDateString();
      const time = new Date(item.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return `
        <div class="history-item" data-translation="${escapeHtml(item.translatedText)}">
          <div class="history-original">${escapeHtml(truncateText(item.originalText, 50))}</div>
          <div class="history-translation">${escapeHtml(truncateText(item.translatedText, 60))}</div>
          <div class="history-meta">
            <span class="history-provider">${item.provider}</span>
            <span class="history-time">${date} ${time}</span>
          </div>
        </div>
      `;
    }).join('');

    elements.historyList.innerHTML = historyHTML;
  }

  function handleHistoryClick(event) {
    const historyItem = event.target.closest('.history-item');
    if (historyItem) {
      const translation = historyItem.dataset.translation;
      copyToClipboard(translation);
      showTemporaryMessage('Copied to clipboard!');
    }
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Clipboard error:', error);
    }
  }

  function clearHistory() {
    if (confirm('Clear all translation history?')) {
      chrome.runtime.sendMessage({ action: 'clearHistory' }, () => {
        loadHistory();
      });
    }
  }

  function showSettings() {
    console.log('Settings button clicked');
    console.log('Settings panel element:', elements.settingsPanel);
    
    if (elements.settingsPanel) {
      elements.settingsPanel.classList.remove('hidden');
      console.log('Hidden class removed from settings panel');
    } else {
      console.error('Settings panel element not found');
    }
  }

  function hideSettings() {
    elements.settingsPanel.classList.add('hidden');
  }

  function openOptionsPage() {
    chrome.runtime.openOptionsPage();
    window.close(); // Close popup after opening options
  }

  function updateApiKeyHelp() {
    const provider = elements.providerSelect.value;
    const helpLinks = {
      deepl: 'https://www.deepl.com/pro-api',
      google: 'https://cloud.google.com/translate/docs/setup',
      openai: 'https://platform.openai.com/api-keys'
    };
    
    elements.apiKeyHelp.href = helpLinks[provider] || '#';
    elements.apiKeyHelp.textContent = `Get ${provider.toUpperCase()} API key`;
  }

  function toggleApiKeyVisibility() {
    const isPassword = elements.apiKeyInput.type === 'password';
    elements.apiKeyInput.type = isPassword ? 'text' : 'password';
    
    const icon = elements.toggleApiKey.querySelector('svg');
    if (isPassword) {
      icon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94l1.42 1.42A16.1 16.1 0 0 0 3 12s3.14 5.79 8 6.64"></path>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-1.42-1.42A16.1 16.1 0 0 0 21 12s-3.14-5.79-8-6.64z"></path>
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M21 21l-18-18"></path>
      `;
    } else {
      icon.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      `;
    }
  }

  function saveSettings() {
    const settings = {
      provider: elements.providerSelect.value,
      apiKey: elements.apiKeyInput.value,
      autoCopy: elements.autoCopyToggle.checked,
      showOverlay: elements.showOverlayCheck.checked,
      maxChars: parseInt(elements.maxCharsInput.value) || 5000,
      autoCloseDelay: parseInt(elements.autoCloseDelayInput.value) * 1000 || 30000
    };

    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: settings
    }, (response) => {
      if (response && response.success) {
        showTemporaryMessage('Settings saved!');
        updateStatus();
        setTimeout(hideSettings, 1000);
      }
    });
  }

  function updateStatus() {
    chrome.runtime.sendMessage({ action: 'getSettings' }, (settings) => {
      const statusDot = elements.statusIndicator.querySelector('.status-dot');
      
      if (!settings || !settings.apiKey) {
        statusDot.className = 'status-dot error';
        elements.statusText.textContent = 'API key required';
      } else {
        statusDot.className = 'status-dot';
        elements.statusText.textContent = `Ready (${settings.provider.toUpperCase()})`;
      }
    });
  }

  function showTemporaryMessage(message) {
    const originalText = elements.statusText.textContent;
    const statusDot = elements.statusIndicator.querySelector('.status-dot');
    const originalClass = statusDot.className;
    
    statusDot.className = 'status-dot';
    elements.statusText.textContent = message;
    
    setTimeout(() => {
      statusDot.className = originalClass;
      elements.statusText.textContent = originalText;
    }, 2000);
  }

  function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});