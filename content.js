// Content script for Quick English Translate

(function() {
  'use strict';

  let currentSelection = null;
  let overlayElement = null;
  let toastElement = null;

  // Initialize content script
  function init() {
    // Listen for text selection
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keydown', handleKeyboardShortcut);
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(handleMessage);
    
    // Close overlay when clicking outside
    document.addEventListener('click', handleDocumentClick);
    
    // Handle escape key
    document.addEventListener('keydown', handleEscapeKey);
  }

  // Handle text selection with mouse
  function handleTextSelection(event) {
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText && selectedText.length > 0) {
        currentSelection = {
          text: selectedText,
          range: selection.getRangeAt(0),
          x: event.pageX,
          y: event.pageY
        };
      } else {
        currentSelection = null;
        hideOverlay();
      }
    }, 10);
  }

  // Handle keyboard shortcuts
  function handleKeyboardShortcut(event) {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
      event.preventDefault();
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText) {
        currentSelection = {
          text: selectedText,
          range: selection.getRangeAt(0),
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        };
        
        chrome.runtime.sendMessage({
          action: 'translate',
          text: selectedText
        });
      }
    }
  }

  // Handle messages from background script
  function handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'getSelection':
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        if (selectedText) {
          chrome.runtime.sendMessage({
            action: 'translate',
            text: selectedText
          });
        }
        break;
        
      case 'translationResult':
        handleTranslationSuccess(request);
        break;
        
      case 'translationError':
        handleTranslationError(request);
        break;
    }
  }

  // Handle successful translation
  async function handleTranslationSuccess(result) {
    const { translation, originalText, settings } = result;
    
    // Copy to clipboard if enabled
    if (settings.autoCopy) {
      try {
        await copyToClipboard(translation);
        showToast('Translation copied to clipboard!', 'success');
      } catch (error) {
        console.error('Clipboard error:', error);
        showToast('Translation ready, but clipboard access denied', 'warning');
      }
    }
    
    // Show overlay if enabled
    if (settings.showOverlay && currentSelection) {
      showOverlay(originalText, translation, settings);
    }
  }

  // Handle translation error
  function handleTranslationError(result) {
    const { error, provider } = result;
    let message = error;
    
    if (error.includes('API key')) {
      message = `Please set your ${provider.toUpperCase()} API key in extension settings`;
    } else if (error.includes('quota') || error.includes('limit')) {
      message = `${provider.toUpperCase()} quota exceeded. Try again later.`;
    } else if (error.includes('Network')) {
      message = 'Network error. Please check your connection.';
    }
    
    showToast(message, 'error');
  }

  // Copy text to clipboard
  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }

  // Show translation overlay
  function showOverlay(originalText, translation, settings) {
    hideOverlay(); // Remove any existing overlay
    
    const overlay = document.createElement('div');
    overlay.className = 'qet-overlay';
    overlay.innerHTML = `
      <div class="qet-overlay-content">
        <div class="qet-overlay-header">
          <span class="qet-overlay-title">English Translation</span>
          <button class="qet-overlay-close" aria-label="Close">×</button>
        </div>
        <div class="qet-overlay-body">
          <div class="qet-original-text">
            <strong>Original:</strong>
            <div class="qet-text-content">${escapeHtml(originalText)}</div>
          </div>
          <div class="qet-translated-text">
            <strong>Translation:</strong>
            <div class="qet-text-content">${escapeHtml(translation)}</div>
          </div>
        </div>
      </div>
    `;
    
    // Position overlay
    if (currentSelection) {
      const rect = currentSelection.range.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      let top = rect.bottom + scrollTop + 10;
      let left = rect.left + scrollLeft;
      
      // Adjust position if overlay would go off screen
      if (left + 320 > window.innerWidth + scrollLeft) {
        left = window.innerWidth + scrollLeft - 320 - 10;
      }
      if (left < scrollLeft) {
        left = scrollLeft + 10;
      }
      
      overlay.style.position = 'absolute';
      overlay.style.top = `${top}px`;
      overlay.style.left = `${left}px`;
      overlay.style.zIndex = '2147483647';
    }
    
    document.body.appendChild(overlay);
    overlayElement = overlay;
    
    // Add event listeners
    const closeBtn = overlay.querySelector('.qet-overlay-close');
    closeBtn.addEventListener('click', hideOverlay);
    
    // Auto-hide after delay
    if (settings.autoCloseDelay > 0) {
      setTimeout(hideOverlay, settings.autoCloseDelay);
    }
  }

  // Hide overlay
  function hideOverlay() {
    if (overlayElement) {
      overlayElement.remove();
      overlayElement = null;
    }
  }

  // Show toast notification
  function showToast(message, type = 'info') {
    hideToast(); // Remove any existing toast
    
    const toast = document.createElement('div');
    toast.className = `qet-toast qet-toast-${type}`;
    toast.textContent = message;
    
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.zIndex = '2147483647';
    
    document.body.appendChild(toast);
    toastElement = toast;
    
    // Auto-hide after 3 seconds
    setTimeout(hideToast, 3000);
  }

  // Hide toast notification
  function hideToast() {
    if (toastElement) {
      toastElement.remove();
      toastElement = null;
    }
  }

  // Handle clicks outside overlay
  function handleDocumentClick(event) {
    if (overlayElement && !overlayElement.contains(event.target)) {
      hideOverlay();
    }
  }

  // Handle escape key
  function handleEscapeKey(event) {
    if (event.key === 'Escape') {
      hideOverlay();
      hideToast();
    }
  }

  // Utility function to escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();