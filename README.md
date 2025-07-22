# Quick English Translate - Chrome Extension

A powerful Chrome extension that allows you to select text on any web page and instantly translate it into English with automatic clipboard copy functionality.

## ✨ Features

### 🚀 Core Functionality
- **Instant Translation**: Select text and translate to English with a single action
- **Automatic Clipboard Copy**: Translations are automatically copied to your clipboard
- **Multiple Triggers**: Right-click context menu or keyboard shortcut (Ctrl+Shift+T)
- **Overlay Display**: Shows translation results in an elegant overlay near selected text

### 🔧 Translation Services
- **DeepL API** (Recommended) - High-quality translations with superior accuracy
- **Google Cloud Translate** - Fast translations supporting 100+ languages  
- **OpenAI GPT** - Contextual translations with natural language understanding

### 🎨 User Experience
- **Smart Overlay Positioning**: Automatically adjusts to avoid screen edges
- **Toast Notifications**: Clear feedback for all actions
- **Translation History**: Access your last 100 translations
- **Dark Mode Support**: Adapts to system preferences
- **Accessibility**: Full keyboard navigation and screen reader support

## 📦 Installation

### From Source (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your browser toolbar

### From Chrome Web Store
*Coming soon - extension will be published to the Chrome Web Store*

## 🔑 Setup

### 1. Get an API Key
Choose your preferred translation service and get an API key:

- **DeepL** (Recommended): Visit [DeepL Pro API](https://www.deepl.com/pro-api)
- **Google Translate**: Visit [Google Cloud Console](https://cloud.google.com/translate/docs/setup) 
- **OpenAI**: Visit [OpenAI Platform](https://platform.openai.com/api-keys)

### 2. Configure the Extension
1. Click the extension icon in your toolbar
2. Click the settings gear icon
3. Select your translation service
4. Enter your API key
5. Adjust other preferences as needed
6. Click "Save Settings"

## 🚀 Usage

### Method 1: Context Menu
1. Select text on any web page
2. Right-click and choose "Translate to English"
3. Translation appears in overlay and is copied to clipboard

### Method 2: Keyboard Shortcut  
1. Select text on any web page
2. Press `Ctrl+Shift+T` (or `Cmd+Shift+T` on Mac)
3. Translation appears in overlay and is copied to clipboard

### Method 3: Extension Popup
1. Select text on any web page
2. Click the extension icon
3. View translation history and settings

## ⚙️ Configuration Options

### Translation Settings
- **Translation Service**: Choose between DeepL, Google, or OpenAI
- **API Key**: Your service-specific API key
- **Max Characters**: Limit translation length (100-10,000 chars)

### Behavior Settings  
- **Auto-copy to Clipboard**: Enable/disable automatic clipboard copy
- **Show Overlay**: Enable/disable translation overlay display
- **Auto-close Delay**: Set overlay auto-close timing (0-300 seconds)

### Keyboard Shortcuts
- **Default**: `Ctrl+Shift+T` (Windows/Linux) or `Cmd+Shift+T` (Mac)
- **Customization**: Available through `chrome://extensions/shortcuts`

## 🔒 Privacy & Security

- **Local Storage**: Translation history stored locally on your device
- **Secure API Keys**: Keys encrypted in Chrome's secure storage
- **No Tracking**: No usage analytics or user tracking
- **Minimal Permissions**: Only requests necessary browser permissions

## 🛠️ Technical Details

### Architecture
- **Manifest V3**: Modern Chrome extension architecture
- **Service Worker**: Background processing for translations
- **Content Scripts**: Page interaction and overlay display
- **Popup Interface**: Settings and history management

### Browser Support
- Chrome 88+
- Microsoft Edge 88+ 
- Opera 74+

### API Integration
- RESTful API calls to translation services
- Error handling and retry logic
- Rate limiting awareness
- Secure credential management

## 🐛 Troubleshooting

### Common Issues

**"API key required" error**
- Ensure you've entered a valid API key in extension settings
- Check that your API key format matches the selected service

**"Quota exceeded" error**  
- You've reached your API service usage limit
- Check your service provider's billing/quota settings

**Translation not copying to clipboard**
- Ensure clipboard permissions are granted
- Try clicking on a translation in the history to copy manually

**Overlay not appearing**
- Check that "Show overlay" is enabled in settings
- Ensure you're selecting text on a supported web page

### Getting Help
- Check the [Issues](https://github.com/your-username/quick-english-translate/issues) page
- Create a new issue with detailed description
- Include browser version and error messages

## 🤝 Contributing

Contributions are welcome! Please feel free to:

1. **Report Bugs**: Open an issue with reproduction steps
2. **Suggest Features**: Describe your feature idea in an issue
3. **Submit Pull Requests**: Fork the repo and submit improvements
4. **Improve Documentation**: Help make the README even better

### Development Setup
```bash
git clone https://github.com/your-username/quick-english-translate.git
cd quick-english-translate
# Load in Chrome as unpacked extension for testing
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chrome Extension documentation and examples
- Translation service providers (DeepL, Google, OpenAI)
- Open source community feedback and contributions

## 📈 Version History

### v1.1.0 (Current)
- ✅ Automatic clipboard copy functionality
- ✅ Multiple translation service support
- ✅ Improved error handling and user feedback
- ✅ Enhanced accessibility features
- ✅ Dark mode support

### v1.0.0 (Initial Release)
- ✅ Basic text selection and translation
- ✅ Context menu integration  
- ✅ Simple overlay display
- ✅ DeepL API integration

---

**Quick English Translate** - Bridging language barriers, one click at a time! 🌐