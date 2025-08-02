const API_BASE_URL = 'https://app-affolxke.fly.dev';

class ExtensionAPI {
  constructor() {
    this.token = null;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'An error occurred');
    }

    return response.json();
  }

  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.token = response.access_token;
    return response;
  }

  async register(email, password) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request('/api/user/profile');
  }

  async translate(platform, chinese_text) {
    return this.request('/api/translate', {
      method: 'POST',
      body: JSON.stringify({ platform, chinese_text }),
    });
  }
}

class ExtensionApp {
  constructor() {
    this.api = new ExtensionAPI();
    this.selectedPlatform = 'amazon';
    this.user = null;
    this.init();
  }

  async init() {
    await this.loadStoredAuth();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadStoredAuth() {
    try {
      const result = await chrome.storage.local.get(['token', 'user']);
      if (result.token) {
        this.api.token = result.token;
        this.user = result.user;
        
        try {
          this.user = await this.api.getProfile();
          await chrome.storage.local.set({ user: this.user });
        } catch (error) {
          await this.logout();
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    }
  }

  setupEventListeners() {
    document.getElementById('login-btn').addEventListener('click', () => this.handleLogin());
    document.getElementById('register-btn').addEventListener('click', () => this.handleRegister());
    document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    document.getElementById('capture-btn').addEventListener('click', () => this.capturePageContent());
    document.getElementById('translate-btn').addEventListener('click', () => this.handleTranslate());

    document.querySelectorAll('.platform-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.selectedPlatform = e.target.dataset.platform;
      });
    });

    document.getElementById('email').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleLogin();
    });

    document.getElementById('password').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleLogin();
    });
  }

  async handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      this.showError('Please enter email and password');
      return;
    }

    try {
      await this.api.login(email, password);
      this.user = await this.api.getProfile();
      
      await chrome.storage.local.set({
        token: this.api.token,
        user: this.user
      });

      this.showSuccess('Login successful!');
      this.updateUI();
    } catch (error) {
      this.showError(error.message);
    }
  }

  async handleRegister() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      this.showError('Please enter email and password');
      return;
    }

    try {
      await this.api.register(email, password);
      this.showSuccess('Registration successful! Please login.');
    } catch (error) {
      this.showError(error.message);
    }
  }

  async logout() {
    this.api.token = null;
    this.user = null;
    await chrome.storage.local.clear();
    this.updateUI();
    this.showSuccess('Logged out successfully');
  }

  async capturePageContent() {
    try {
      console.log('Starting page content capture...');
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Active tab:', tab);
      
      if (!tab || !tab.id) {
        throw new Error('无法访问当前标签页');
      }
      
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://'))) {
        throw new Error('无法在此页面上捕获内容（受限页面）');
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractContent' });
      
      console.log('Received response from content script:', response);
      
      if (response && response.content) {
        document.getElementById('chinese-text').value = response.content;
        this.showSuccess('页面内容已捕获！');
      } else if (response && response.error) {
        console.log('Content script error:', response.error);
        this.showError('内容提取失败: ' + response.error);
      } else {
        console.log('No content found in response');
        this.showError('页面上未找到内容');
      }
    } catch (error) {
      console.error('Capture error:', error);
      if (error.message.includes('Could not establish connection')) {
        this.showError('无法连接到页面内容脚本。请刷新页面后重试，或检查页面是否为受限页面。');
      } else {
        this.showError('捕获页面内容失败: ' + error.message);
      }
    }
  }

  async handleTranslate() {
    const chineseText = document.getElementById('chinese-text').value;
    
    if (!chineseText.trim()) {
      this.showError('Please enter Chinese text to translate');
      return;
    }

    try {
      const result = await this.api.translate(this.selectedPlatform, chineseText);
      
      document.getElementById('english-text').textContent = result.english_text;
      document.getElementById('translation-result').classList.remove('hidden');
      
      this.user = await this.api.getProfile();
      await chrome.storage.local.set({ user: this.user });
      this.updateUserInfo();

      if (result.cost > 0) {
        this.showSuccess(`Translation completed! Cost: ¥${result.cost.toFixed(2)}`);
      } else {
        this.showSuccess('Free translation completed!');
      }
    } catch (error) {
      this.showError(error.message);
    }
  }

  updateUI() {
    if (this.user) {
      document.getElementById('login-section').classList.add('hidden');
      document.getElementById('app-section').classList.remove('hidden');
      this.updateUserInfo();
    } else {
      document.getElementById('login-section').classList.remove('hidden');
      document.getElementById('app-section').classList.add('hidden');
      document.getElementById('email').value = '';
      document.getElementById('password').value = '';
    }
  }

  updateUserInfo() {
    if (this.user) {
      document.getElementById('user-email').textContent = this.user.email;
      document.getElementById('user-balance').textContent = `¥${this.user.balance.toFixed(2)}`;
      
      const freeLeft = Math.max(0, 10 - this.user.free_translations_used);
      document.getElementById('free-translations').textContent = freeLeft;
    }
  }

  showError(message) {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    
    const successEl = document.getElementById('success-message');
    successEl.classList.add('hidden');
    
    setTimeout(() => {
      errorEl.classList.add('hidden');
    }, 5000);
  }

  showSuccess(message) {
    const successEl = document.getElementById('success-message');
    successEl.textContent = message;
    successEl.classList.remove('hidden');
    
    const errorEl = document.getElementById('error-message');
    errorEl.classList.add('hidden');
    
    setTimeout(() => {
      successEl.classList.add('hidden');
    }, 3000);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  new ExtensionApp();
});
