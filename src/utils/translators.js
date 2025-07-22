// Translation service adapters

class TranslationError extends Error {
  constructor(message, provider, status) {
    super(message);
    this.name = 'TranslationError';
    this.provider = provider;
    this.status = status;
  }
}

// Base translator interface
class Translator {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.options = options;
  }

  async translate(text, targetLang = 'EN') {
    throw new Error('translate method must be implemented');
  }

  detectLanguage(text) {
    // Simple language detection heuristic
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) return 'JA';
    if (/[À-ÿ]/.test(text)) return 'ES'; // Simplified
    if (/[А-Яа-я]/.test(text)) return 'RU';
    if (/[一-龯]/.test(text)) return 'ZH';
    return 'AUTO';
  }
}

// DeepL API adapter
class DeepLTranslator extends Translator {
  constructor(apiKey, options = {}) {
    super(apiKey, options);
    this.baseUrl = options.pro ? 'https://api.deepl.com' : 'https://api-free.deepl.com';
  }

  async translate(text, targetLang = 'EN') {
    if (!text.trim()) throw new TranslationError('Empty text provided', 'deepl');
    if (text.length > 5000) throw new TranslationError('Text too long (max 5000 chars)', 'deepl');

    const url = `${this.baseUrl}/v2/translate`;
    const body = new URLSearchParams({
      auth_key: this.apiKey,
      text: text,
      target_lang: targetLang === 'EN' ? 'EN-US' : targetLang,
      preserve_formatting: '1'
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403) {
          throw new TranslationError('Invalid API key', 'deepl', 403);
        } else if (response.status === 456) {
          throw new TranslationError('Quota exceeded', 'deepl', 456);
        }
        throw new TranslationError(errorData.message || 'Translation failed', 'deepl', response.status);
      }

      const data = await response.json();
      return data.translations[0].text;
    } catch (error) {
      if (error instanceof TranslationError) throw error;
      throw new TranslationError(`Network error: ${error.message}`, 'deepl');
    }
  }
}

// Google Cloud Translate adapter
class GoogleTranslator extends Translator {
  constructor(apiKey, options = {}) {
    super(apiKey, options);
    this.baseUrl = 'https://translation.googleapis.com/language/translate/v2';
  }

  async translate(text, targetLang = 'EN') {
    if (!text.trim()) throw new TranslationError('Empty text provided', 'google');
    if (text.length > 5000) throw new TranslationError('Text too long (max 5000 chars)', 'google');

    const url = `${this.baseUrl}?key=${this.apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLang.toLowerCase(),
          format: 'text'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403) {
          throw new TranslationError('Invalid API key or quota exceeded', 'google', 403);
        }
        throw new TranslationError(errorData.error?.message || 'Translation failed', 'google', response.status);
      }

      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      if (error instanceof TranslationError) throw error;
      throw new TranslationError(`Network error: ${error.message}`, 'google');
    }
  }
}

// OpenAI GPT adapter for translation
class OpenAITranslator extends Translator {
  constructor(apiKey, options = {}) {
    super(apiKey, options);
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = options.model || 'gpt-3.5-turbo';
  }

  async translate(text, targetLang = 'EN') {
    if (!text.trim()) throw new TranslationError('Empty text provided', 'openai');
    if (text.length > 4000) throw new TranslationError('Text too long (max 4000 chars for GPT)', 'openai');

    const prompt = `Translate the following text into English. Return only the translated text without any explanations or comments:\n\n${text}`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: Math.min(1000, Math.ceil(text.length * 2)),
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new TranslationError('Invalid API key', 'openai', 401);
        } else if (response.status === 429) {
          throw new TranslationError('Rate limit exceeded', 'openai', 429);
        }
        throw new TranslationError(errorData.error?.message || 'Translation failed', 'openai', response.status);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      if (error instanceof TranslationError) throw error;
      throw new TranslationError(`Network error: ${error.message}`, 'openai');
    }
  }
}

// Factory function to create translator instances
function createTranslator(provider, apiKey, options = {}) {
  switch (provider) {
    case 'deepl':
      return new DeepLTranslator(apiKey, options);
    case 'google':
      return new GoogleTranslator(apiKey, options);
    case 'openai':
      return new OpenAITranslator(apiKey, options);
    default:
      throw new Error(`Unknown translation provider: ${provider}`);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createTranslator, TranslationError };
} else {
  window.TranslationUtils = { createTranslator, TranslationError };
}