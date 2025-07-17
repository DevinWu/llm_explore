const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private token: string = '';

  setToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
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

  async register(email: string, password: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request('/api/user/profile');
  }

  async getBalance() {
    return this.request('/api/user/balance');
  }

  async translate(platform: string, chinese_text: string) {
    return this.request('/api/translate', {
      method: 'POST',
      body: JSON.stringify({ platform, chinese_text }),
    });
  }

  async getTranslationHistory() {
    return this.request('/api/translations/history');
  }

  async topUp(amount: number, payment_method: string) {
    return this.request('/api/payment/topup', {
      method: 'POST',
      body: JSON.stringify({ amount, payment_method }),
    });
  }
}

export const api = new ApiService();
