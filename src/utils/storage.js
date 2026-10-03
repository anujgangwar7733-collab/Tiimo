import { 
  INITIAL_ACTIVITIES, 
  INITIAL_TODOS, 
  INITIAL_MOOD_HISTORY, 
  TROPHIES 
} from './initialData';

const STORAGE_KEYS = {
  ACTIVITIES: 'daily_routine_activities',
  TODOS: 'daily_routine_todos',
  MOOD_HISTORY: 'daily_routine_moods',
  TROPHIES: 'daily_routine_trophies',
  THEME: 'daily_routine_theme',
  STREAK: 'daily_routine_streak'
};

export function loadActivities() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return data ? JSON.parse(data) : INITIAL_ACTIVITIES;
  } catch (e) {
    return INITIAL_ACTIVITIES;
  }
}

export function saveActivities(activities) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (e) {}
}

export function loadTodos() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TODOS);
    return data ? JSON.parse(data) : INITIAL_TODOS;
  } catch (e) {
    return INITIAL_TODOS;
  }
}

export function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  } catch (e) {}
}

export function loadMoods() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MOOD_HISTORY);
    return data ? JSON.parse(data) : INITIAL_MOOD_HISTORY;
  } catch (e) {
    return INITIAL_MOOD_HISTORY;
  }
}

export function saveMoods(moods) {
  try {
    localStorage.setItem(STORAGE_KEYS.MOOD_HISTORY, JSON.stringify(moods));
  } catch (e) {}
}

export function loadTrophies() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TROPHIES);
    return data ? JSON.parse(data) : TROPHIES;
  } catch (e) {
    return TROPHIES;
  }
}

export function saveTrophies(trophies) {
  try {
    localStorage.setItem(STORAGE_KEYS.TROPHIES, JSON.stringify(trophies));
  } catch (e) {}
}

export function loadStreak() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STREAK);
    return data ? parseInt(data, 10) : 5;
  } catch (e) {
    return 5;
  }
}

export function saveStreak(streak) {
  try {
    localStorage.setItem(STORAGE_KEYS.STREAK, streak.toString());
  } catch (e) {}
}
