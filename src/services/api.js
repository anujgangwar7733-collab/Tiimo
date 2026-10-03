/**
 * Frontend API Client Service for Daily Routine
 * Interacts with Node.js/Express + MongoDB backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Universal request wrapper with JWT token injection
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('daily_routine_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.errors = data.errors || [];
      throw err;
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
}

// ==========================================
// Authentication API
// ==========================================
export const authApi = {
  register: async (userData) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.token) {
      localStorage.setItem('daily_routine_token', data.token);
    }
    return data;
  },

  login: async (credentials) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (data.token) {
      localStorage.setItem('daily_routine_token', data.token);
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

  logout: () => {
    localStorage.removeItem('daily_routine_token');
  }
};

// ==========================================
// Tasks & Routines Timeline API
// ==========================================
export const taskApi = {
  /**
   * Fetch daily timeline activities
   * @param {string} date - Format YYYY-MM-DD
   */
  getByDate: async (date) => {
    return await request(`/tasks?date=${date}`);
  },

  /**
   * Fetch tasks across a date range
   * @param {string} start - Format YYYY-MM-DD
   * @param {string} end - Format YYYY-MM-DD
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
   * Update task (time, status, title, subtasks)
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
   * @param {Array<{ id: string, order: number, startTime?: string }>} items
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
// Focus & Insights API
// ==========================================
export const insightApi = {
  /**
   * Log completed Focus Timer session + Wellbeing check-in
   */
  logFocusSession: async (sessionData) => {
    return await request('/insights/focus-session', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
  },

  /**
   * Fetch weekly stats, active streaks, and completion rate
   */
  getStats: async () => {
    return await request('/insights/stats');
  }
};
