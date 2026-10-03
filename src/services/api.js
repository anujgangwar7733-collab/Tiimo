/**
 * Production Frontend API Client Service for Tiimo Daily Flow
 * Interacts with Node.js/Express + MongoDB backend
 * Supports JWT Bearer tokens and HTTP-only cookie sessions
 */

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

const TOKEN_KEY = 'tiimo_token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('daily_routine_token') || null;
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem('daily_routine_token', token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('daily_routine_token');
    }
  } catch (e) {
    console.error('Failed to persist token:', e);
  }
};

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('daily_routine_token');
    localStorage.removeItem('tiimo_auth_user');
  } catch (e) {
    console.error('Failed to clear tokens:', e);
  }
};

/**
 * Universal request wrapper with JWT token injection and credentials
 */
async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers,
    credentials: 'include' // Sends HTTP-only session cookies
  };

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);
    
    // Check if response is empty (e.g. 204 No Content)
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMsg = (typeof data === 'object' && data.message) || (typeof data === 'object' && data.error) || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.code = (typeof data === 'object' && data.code) || 'API_ERROR';
      err.errors = (typeof data === 'object' && data.errors) || [];

      // Auto-clear invalid session on 401 Unauthorized
      if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        clearToken();
      }

      throw err;
    }

    return data;
  } catch (error) {
    // If backend is completely offline or unreachable (fetch TypeError)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const offlineErr = new Error('Cannot connect to Tiimo cloud server. Please check your connection.');
      offlineErr.status = 503;
      offlineErr.code = 'NETWORK_OFFLINE';
      throw offlineErr;
    }
    throw error;
  }
}

// ==========================================
// 1. Authentication API
// ==========================================
export const authApi = {
  register: async (name, email, password) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  login: async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  googleLogin: async (credentialOrPayload) => {
    const body = typeof credentialOrPayload === 'string'
      ? { credential: credentialOrPayload }
      : credentialOrPayload;

    const data = await request('/auth/google', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  getMe: async () => {
    return await request('/auth/me');
  },

  updateMe: async (updates) => {
    return await request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      clearToken();
    }
  }
};

// ==========================================
// 2. Tasks & Routine Timeline API
// ==========================================
export const taskApi = {
  /**
   * Fetch daily timeline activities for logged in user on date
   * @param {string} date - Format YYYY-MM-DD
   */
  getByDate: async (date) => {
    return await request(`/tasks?date=${date}`);
  },

  /**
   * Fetch tasks across a date range
   */
  getRange: async (start, end) => {
    return await request(`/tasks/range?start=${start}&end=${end}`);
  },

  /**
   * Create a new task or routine
   */
  create: async (taskData) => {
    return await request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  /**
   * Update task (completion, duration, time, title)
   */
  update: async (id, updates) => {
    return await request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  /**
   * Delete a task
   */
  delete: async (id) => {
    return await request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Reorder timeline activities
   */
  reorder: async (items) => {
    return await request('/tasks/reorder', {
      method: 'POST',
      body: JSON.stringify({ items })
    });
  },

  /**
   * Toggle a subtask checklist item
   */
  toggleSubtask: async (taskId, subtaskId) => {
    return await request(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PATCH'
    });
  }
};

// ==========================================
// 3. Focus & Insights API
// ==========================================
export const insightApi = {
  logFocusSession: async (sessionData) => {
    return await request('/insights/focus-session', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
  },

  getStats: async () => {
    return await request('/insights/stats');
  }
};

// ==========================================
// 4. Subscriptions & Stripe Paywall API
// ==========================================
export const subscriptionApi = {
  createCheckout: async (plan = 'pro_monthly') => {
    return await request('/subscription/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ plan })
    });
  },

  getPortal: async () => {
    return await request('/subscription/portal', {
      method: 'POST'
    });
  },

  demoUpgrade: async (plan = 'pro_monthly') => {
    return await request('/subscription/demo-upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan })
    });
  }
};

// ==========================================
// 5. Gamification, Streaks & Mood API
// ==========================================
export const gamificationApi = {
  getGamificationSummary: async () => {
    return await request('/gamification/summary');
  },

  logDailyMood: async (moodData) => {
    return await request('/gamification/mood', {
      method: 'POST',
      body: JSON.stringify(moodData)
    });
  },

  checkStreak: async () => {
    return await request('/gamification/streak/check', {
      method: 'POST'
    });
  },

  getHabitHeatmap: async (days = 30) => {
    return await request(`/gamification/heatmap?days=${days}`);
  },

  getUserTrophies: async () => {
    return await request('/gamification/trophies');
  }
};

