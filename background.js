// Background service worker for Quick English Translate

// Import translation utilities
importScripts('src/utils/translators.js');

// Initialize context menus and shortcuts
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu
  chrome.contextMenus.create({
    id: 'translate-to-english',
    title: 'Translate to English',
    contexts: ['selection']
  });

  // Set default settings
  chrome.storage.sync.get(['settings'], (result) => {
    if (!result.settings) {
      chrome.storage.sync.set({
        settings: {
          provider: 'deepl',
          apiKey: '',
          autoCopy: true,
          showOverlay: true,
          maxChars: 5000,
          autoCloseDelay: 30000
        }
      });
    }
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'translate-to-english' && info.selectionText) {
    handleTranslationRequest(info.selectionText, tab.id);
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'translate_selection') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelection' });
      }
    });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'translate':
      handleTranslationRequest(request.text, sender.tab.id, sendResponse);
      return true; // Keep message channel open for async response
      
    case 'getSettings':
      chrome.storage.sync.get(['settings'], (result) => {
        sendResponse(result.settings || {});
      });
      return true;
      
    case 'updateSettings':
      chrome.storage.sync.set({ settings: request.settings }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'getHistory':
      chrome.storage.local.get(['translationHistory'], (result) => {
        sendResponse(result.translationHistory || []);
      });
      return true;
      
    case 'clearHistory':
      chrome.storage.local.remove(['translationHistory'], () => {
        sendResponse({ success: true });
      });
      return true;
  }
});

// Main translation handler
async function handleTranslationRequest(text, tabId, sendResponse = null) {
  try {
    // Validate input
    if (!text || !text.trim()) {
      throw new Error('No text selected');
    }

    // Get settings
    const settings = await getSettings();
    
    if (text.length > settings.maxChars) {
      throw new Error(`Selection exceeds ${settings.maxChars} character limit`);
    }

    if (!settings.apiKey) {
      throw new Error(`Please set your ${settings.provider.toUpperCase()} API key in extension options`);
    }

    // Perform translation
    const translator = window.TranslationUtils.createTranslator(settings.provider, settings.apiKey);
    const translation = await translator.translate(text, 'EN');

    // Save to history
    await saveToHistory({
      originalText: text,
      translatedText: translation,
      provider: settings.provider,
      timestamp: Date.now()
    });

    // Send result to content script
    const response = {
      success: true,
      translation,
      originalText: text,
      settings
    };

    if (sendResponse) {
      sendResponse(response);
    } else {
      chrome.tabs.sendMessage(tabId, {
        action: 'translationResult',
        ...response
      });
    }

  } catch (error) {
    console.error('Translation error:', error);
    
    const errorResponse = {
      success: false,
      error: error.message,
      provider: error.provider || 'unknown'
    };

    if (sendResponse) {
      sendResponse(errorResponse);
    } else {
      chrome.tabs.sendMessage(tabId, {
        action: 'translationError',
        ...errorResponse
      });
    }
  }
}

// Helper function to get settings
function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['settings'], (result) => {
      const defaultSettings = {
        provider: 'deepl',
        apiKey: '',
        autoCopy: true,
        showOverlay: true,
        maxChars: 5000,
        autoCloseDelay: 30000
      };
      resolve({ ...defaultSettings, ...result.settings });
    });
  });
}

// Helper function to save translation to history
async function saveToHistory(translationData) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['translationHistory'], (result) => {
      const history = result.translationHistory || [];
      
      // Add new translation to beginning of array
      history.unshift(translationData);
      
      // Keep only last 100 translations
      const trimmedHistory = history.slice(0, 100);
      
      chrome.storage.local.set({ translationHistory: trimmedHistory }, resolve);
    });
  });
}

// Handle extension icon badge updates
chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.translationHistory) {
    const count = changes.translationHistory.newValue?.length || 0;
    if (count > 0) {
      chrome.action.setBadgeText({ text: count.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#4285f4' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }
});

// Initialize badge on startup
chrome.storage.local.get(['translationHistory'], (result) => {
  const count = result.translationHistory?.length || 0;
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#4285f4' });
  }
});