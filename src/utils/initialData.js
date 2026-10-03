export const INITIAL_ACTIVITIES = [
  {
    id: 'act-1',
    title: 'Morning Routine & Intention',
    icon: 'Sun',
    startTime: '07:30',
    durationMinutes: 45,
    tintId: 'yellow',
    category: 'Routine',
    isCompleted: true,
    subtasks: [
      { id: 'sub-1', title: 'Hydrate with lemon water', completed: true },
      { id: 'sub-2', title: '10 min gentle somatic stretch', completed: true },
      { id: 'sub-3', title: 'Brew pour-over coffee & journal', completed: true },
      { id: 'sub-4', title: 'Review today’s 3 big priorities', completed: true }
    ],
    notes: 'Start slow, avoid checking phone before coffee.'
  },
  {
    id: 'act-2',
    title: 'Deep Work: Design System & Mobile App',
    icon: 'Laptop',
    startTime: '09:00',
    durationMinutes: 90,
    tintId: 'lavender',
    category: 'Work',
    isCompleted: false,
    subtasks: [
      { id: 'sub-2-1', title: 'Audit Notion color palette & hairlines', completed: true },
      { id: 'sub-2-2', title: 'Build Focus Timer circular progress ring', completed: true },
      { id: 'sub-2-3', title: 'Implement AI Co-Planner breakdown logic', completed: false },
      { id: 'sub-2-4', title: 'Test sound synthesizer audio chimes', completed: false }
    ],
    notes: 'Use pink noise in timer mode to stay locked in.'
  },
  {
    id: 'act-3',
    title: 'Brisk Walk & Solar Reset',
    icon: 'Footprints',
    startTime: '11:00',
    durationMinutes: 30,
    tintId: 'mint',
    category: 'Wellness',
    isCompleted: false,
    subtasks: [
      { id: 'sub-3-1', title: 'Step outside without screens', completed: false },
      { id: 'sub-3-2', title: 'Drink full bottle of water', completed: false }
    ],
    notes: 'Get natural sunlight to regulate afternoon dopamine.'
  },
  {
    id: 'act-4',
    title: 'Collaborative Sync & Email Zero',
    icon: 'Mail',
    startTime: '11:45',
    durationMinutes: 45,
    tintId: 'sky',
    category: 'Work',
    isCompleted: false,
    subtasks: [
      { id: 'sub-4-1', title: 'Respond to urgent product feedback', completed: false },
      { id: 'sub-4-2', title: 'Update task tracker status', completed: false }
    ],
    notes: 'Keep messages concise and action-oriented.'
  },
  {
    id: 'act-5',
    title: 'Nourishing Lunch & Audio Pause',
    icon: 'Utensils',
    startTime: '13:00',
    durationMinutes: 60,
    tintId: 'peach',
    category: 'Wellness',
    isCompleted: false,
    subtasks: [
      { id: 'sub-5-1', title: 'Warm Mediterranean grain bowl', completed: false },
      { id: 'sub-5-2', title: 'Listen to 15m calming podcast', completed: false }
    ],
    notes: 'Eat away from computer desk.'
  },
  {
    id: 'act-6',
    title: 'Afternoon Creative Sprint',
    icon: 'Sparkles',
    startTime: '14:30',
    durationMinutes: 75,
    tintId: 'rose',
    category: 'Creative',
    isCompleted: false,
    subtasks: [
      { id: 'sub-6-1', title: 'Draft interactive component specs', completed: false },
      { id: 'sub-6-2', title: 'Polish micro-animations & transitions', completed: false }
    ],
    notes: 'Focus on tactile delight.'
  },
  {
    id: 'act-7',
    title: 'Evening Unwind & Book Chapter',
    icon: 'Moon',
    startTime: '20:30',
    durationMinutes: 45,
    tintId: 'cream',
    category: 'Routine',
    isCompleted: false,
    subtasks: [
      { id: 'sub-7-1', title: 'Dim ambient lights in room', completed: false },
      { id: 'sub-7-2', title: 'Read 20 pages of fiction book', completed: false },
      { id: 'sub-7-3', title: 'Log daily wellbeing reflection', completed: false }
    ],
    notes: 'Prepare restful sleep environment.'
  }
];

export const INITIAL_TODOS = [
  { id: 'td-1', title: 'Finalize Daily Routine UI color system', list: 'Today', priority: 'High', tintId: 'lavender', completed: true, scheduledTime: '09:00' },
  { id: 'td-2', title: 'Drink 2.5L water throughout day', list: 'Habits', priority: 'Medium', tintId: 'sky', completed: false, scheduledTime: null },
  { id: 'td-3', title: 'Pick up organic oat milk and fresh fruit', list: 'Personal', priority: 'Low', tintId: 'mint', completed: false, scheduledTime: '17:30' },
  { id: 'td-4', title: 'Refill weekly vitamin organizer', list: 'Habits', priority: 'Medium', tintId: 'yellow', completed: true, scheduledTime: null },
  { id: 'td-5', title: 'Prepare presentation slides for Monday team sync', list: 'Work', priority: 'High', tintId: 'peach', completed: false, scheduledTime: '15:45' },
  { id: 'td-6', title: '20 minutes stretching / mobility flow', list: 'Habits', priority: 'Low', tintId: 'rose', completed: false, scheduledTime: '19:00' },
  { id: 'td-7', title: 'Schedule dental routine checkup', list: 'Personal', priority: 'Low', tintId: 'gray', completed: false, scheduledTime: null }
];

export const INITIAL_MOOD_HISTORY = [
  { date: 'Yesterday', mood: 'Calm', energy: 4, reflection: 'Had a super productive focus sprint without distractions.' },
  { date: '2 days ago', mood: 'Joyful', energy: 5, reflection: 'Celebrated finishing milestone on time, feeling energized.' },
  { date: '3 days ago', mood: 'Tired', energy: 2, reflection: 'Stayed up late reading, need to reset bedtime.' }
];

export const TROPHIES = [
  { id: 'tr-1', title: 'Early Bird', desc: 'Completed a scheduled routine before 9:00 AM', icon: 'Sunrise', unlocked: true, date: 'Unlocked today' },
  { id: 'tr-2', title: 'Focus Champion', desc: 'Completed 3 full Focus Timer sessions', icon: 'Flame', unlocked: true, date: 'Unlocked 2 days ago' },
  { id: 'tr-3', title: 'Brain Dump Pro', desc: 'Used AI Co-Planner to break down a goal', icon: 'Sparkles', unlocked: true, date: 'Unlocked yesterday' },
  { id: 'tr-4', title: 'Streak Master', desc: 'Maintained a 5-day continuous planning streak', icon: 'Award', unlocked: true, date: 'Active (5 Days)' },
  { id: 'tr-5', title: 'Mindful Anchor', desc: 'Logged wellbeing & energy check-in 5 times', icon: 'Heart', unlocked: false, date: '3 / 5 completed' },
  { id: 'tr-6', title: 'Executive Power', desc: 'Completed all scheduled activities in a single day', icon: 'CheckCheck', unlocked: false, date: 'In progress' }
];

export const AI_PROMPT_PRESETS = [
  {
    title: 'Morning Reset Routine',
    prompt: 'Plan a calm 60-minute ADHD-friendly morning routine with hydration, light stretching, breakfast, and review.',
    category: 'Wellness'
  },
  {
    title: 'Sprint: Prepare Presentation',
    prompt: 'I have to finish a 10-slide deck on product strategy by this afternoon. Break it into actionable 25-minute sprints.',
    category: 'Work'
  },
  {
    title: 'Declutter & Clean Room',
    prompt: 'My apartment is a mess and I feel overwhelmed. Give me a realistic step-by-step cleaning flow under 45 minutes.',
    category: 'Home'
  },
  {
    title: 'Deep Study / Exam Prep',
    prompt: 'Break down a 2-hour intensive study session with pomodoro blocks and active recall testing.',
    category: 'Study'
  }
];
