import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Play, Pause, ArrowRight, Check, CheckCircle2, 
  Clock, Flame, Heart, Award, Shield, Smartphone, Monitor, 
  ChevronDown, ChevronUp, Star, Laptop, Sun, Moon, Volume2, 
  VolumeX, RefreshCw, Wand2, Compass, Layers, Zap, Download,
  ExternalLink, ArrowUpRight
} from 'lucide-react';
import { playAmbientSound, stopAmbientSound, playCompletionChime, playClickSound } from '../utils/audioEngine';
import confetti from 'canvas-confetti';

export default function LandingPage({ onLaunchApp }) {
  // Demo Focus Timer State on Landing Page
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(1500); // 25 min
  const [soundMode, setSoundMode] = useState('pink');
  
  // Demo AI Co-Planner State on Landing Page
  const [demoPrompt, setDemoPrompt] = useState('Morning Reset Routine');
  const [demoBreakdown, setDemoBreakdown] = useState([
    { title: 'Hydration & Somatic Stretch', duration: 15, tint: '#fef7d6', icon: 'Sun' },
    { title: 'Nutritious Breakfast & Green Tea', duration: 25, tint: '#ffe8d4', icon: 'Coffee' },
    { title: 'Deep Work Sprint: Review Top 3 Priorities', duration: 45, tint: '#e6e0f5', icon: 'Laptop' },
    { title: 'Brisk Walk in Natural Sunlight', duration: 20, tint: '#d9f3e1', icon: 'Sun' }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Demo Box Breathing State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale');
  const [breathSec, setBreathSec] = useState(4);

  // Active FAQ
  const [openFaq, setOpenFaq] = useState(0);

  // Active Landing Theme Preview
  const [previewTheme, setPreviewTheme] = useState('warm-minimal');

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            stopAmbientSound();
            playCompletionChime();
            try {
              confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
            } catch(e) {}
            return 1500;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Audio Sync for Landing Page Demo
  useEffect(() => {
    if (timerRunning && soundMode !== 'none') {
      playAmbientSound(soundMode, 0.18);
    } else {
      stopAmbientSound();
    }
    return () => stopAmbientSound();
  }, [timerRunning, soundMode]);

  // Breathing Box Tick
  useEffect(() => {
    let bInterval = null;
    if (breathingActive) {
      bInterval = setInterval(() => {
        setBreathSec(prev => {
          if (prev <= 1) {
            setBreathPhase(curr => {
              if (curr === 'Inhale') return 'Hold';
              if (curr === 'Hold') return 'Exhale';
              if (curr === 'Exhale') return 'Pause';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathPhase('Inhale');
      setBreathSec(4);
    }
    return () => clearInterval(bInterval);
  }, [breathingActive]);

  const formatTimer = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAiPreset = (presetName) => {
    playClickSound();
    setDemoPrompt(presetName);
    setIsAiLoading(true);
    setTimeout(() => {
      if (presetName.includes('Study')) {
        setDemoBreakdown([
          { title: 'Core Lecture Review & Flashcards', duration: 40, tint: '#e6e0f5', icon: 'Laptop' },
          { title: 'Mental Reset & Hydration Break', duration: 10, tint: '#dcecfa', icon: 'Coffee' },
          { title: 'Practice Questions Blitz', duration: 45, tint: '#fde0ec', icon: 'Sparkles' }
        ]);
      } else if (presetName.includes('Declutter')) {
        setDemoBreakdown([
          { title: 'Trash & Recycled Paper Blitz', duration: 15, tint: '#d9f3e1', icon: 'Sparkles' },
          { title: 'Fold Clean Laundry & Hamper Sort', duration: 20, tint: '#ffe8d4', icon: 'Clock' },
          { title: 'Desk Surface Wipe & Room Airing', duration: 10, tint: '#fef7d6', icon: 'Sun' }
        ]);
      } else {
        setDemoBreakdown([
          { title: 'Hydration & Somatic Stretch', duration: 15, tint: '#fef7d6', icon: 'Sun' },
          { title: 'Nutritious Breakfast & Green Tea', duration: 25, tint: '#ffe8d4', icon: 'Coffee' },
          { title: 'Deep Work Sprint: Review Top 3 Priorities', duration: 45, tint: '#e6e0f5', icon: 'Laptop' },
          { title: 'Brisk Walk in Natural Sunlight', duration: 20, tint: '#d9f3e1', icon: 'Sun' }
        ]);
      }
      setIsAiLoading(false);
      playCompletionChime();
    }, 600);
  };

  return (
    <div className={`notion-landing-page theme-${previewTheme}`}>
      {/* 1. NOTION TOP NAVIGATION BAR */}
      <nav className="lp-nav">
        <div className="lp-nav-container">
          <div className="lp-nav-left">
            <a href="#" className="lp-brand">
              <span className="lp-brand-icon">✦</span>
              <span className="lp-brand-name">Daily Routine</span>
            </a>
            <div className="lp-nav-links">
              <a href="#features" className="lp-nav-link">Features</a>
              <a href="#visual-planning" className="lp-nav-link">Visual Planning</a>
              <a href="#focus-timer" className="lp-nav-link">Focus Timer</a>
              <a href="#ai-planner" className="lp-nav-link">AI Co-Planner</a>
              <a href="#wellbeing" className="lp-nav-link">Wellbeing</a>
              <a href="#pricing" className="lp-nav-link">Pricing</a>
              <a href="#faq" className="lp-nav-link">FAQ</a>
            </div>
          </div>

          <div className="lp-nav-right">
            <button 
              type="button" 
              className="lp-nav-btn secondary"
              onClick={onLaunchApp}
            >
              <Smartphone size={14} />
              <span>Mobile Frame</span>
            </button>
            <button 
              type="button" 
              className="lp-nav-btn primary"
              onClick={onLaunchApp}
            >
              <span>Launch Web App</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION (Notion Deep Brand Navy #0a1530) */}
      <header className="lp-hero-section">
        <div className="lp-hero-mesh-overlay"></div>
        <div className="lp-hero-container">
          {/* Top Award Pill */}
          <div className="lp-hero-award-pill">
            <span className="award-sparkle">★</span>
            <span>Inspired by Tiimo & Built with Notion Design System</span>
            <span className="award-divider">•</span>
            <span className="award-tag">iPhone App of the Year Finalist</span>
          </div>

          {/* Hero Main Headline (Notion Serif Heading) */}
          <h1 className="lp-hero-title">
            A visual AI planner built for real life & neurodivergent minds.
          </h1>

          <p className="lp-hero-subtitle">
            Turn scattered thoughts and executive functioning freeze into calm, structured momentum. 
            Visual timelines, ambient focus timer, brain dumps decomposed with AI, and sensory wellbeing—all wrapped in Notion's warm minimalism.
          </p>

          {/* Action CTAs */}
          <div className="lp-hero-actions">
            <button 
              type="button" 
              className="lp-hero-btn primary"
              onClick={onLaunchApp}
            >
              <span>Start Planning for Free</span>
              <ArrowRight size={16} />
            </button>

            <a 
              href="#interactive-demo"
              className="lp-hero-btn secondary"
            >
              <Play size={15} fill="currentColor" />
              <span>Explore Interactive Demos</span>
            </a>
          </div>

          <div className="lp-hero-platforms">
            <span>Available on</span>
            <span className="platform-tag">iOS</span>
            <span className="platform-tag">iPadOS</span>
            <span className="platform-tag">watchOS</span>
            <span className="platform-tag">Android</span>
            <span className="platform-tag">Web App</span>
          </div>

          {/* 3. HERO INTERACTIVE MOCKUP SHOWCASE */}
          <div className="lp-hero-mockup-wrapper" id="interactive-demo">
            <div className="lp-mockup-window">
              {/* Window Header */}
              <div className="lp-mockup-header">
                <div className="window-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="window-title">Daily Routine — Today's Visual Schedule (Live Preview)</div>
                <div className="window-badge">
                  <span className="live-dot"></span>
                  <span>Interactive</span>
                </div>
              </div>

              {/* Window Body: Multi-Column Visual Planner Mockup */}
              <div className="lp-mockup-body">
                {/* Column 1: Timeline Time Blocks */}
                <div className="mockup-col timeline-col">
                  <div className="col-header">
                    <span className="col-title">Today's Visual Timeline</span>
                    <span className="col-now-pill">NOW • 10:15 AM</span>
                  </div>

                  <div className="mockup-cards-stack">
                    <div className="mock-card yellow completed">
                      <div className="card-top">
                        <span className="card-icon">☀️</span>
                        <div className="card-meta">
                          <span className="card-title">Morning Routine & Lemon Water</span>
                          <span className="card-time">07:30 - 08:15 (45m)</span>
                        </div>
                        <span className="card-status done">✓ Done</span>
                      </div>
                    </div>

                    <div className="mock-card lavender active-now">
                      <div className="card-top">
                        <span className="card-icon">💻</span>
                        <div className="card-meta">
                          <span className="card-title">Deep Focus: Product Architecture</span>
                          <span className="card-time">09:00 - 10:30 (90m)</span>
                        </div>
                        <span className="card-status active">Active Now</span>
                      </div>
                      <div className="card-subtasks-preview">
                        <div className="mini-sub"><span className="mini-check done">✓</span> Audit Notion pastel tints</div>
                        <div className="mini-sub"><span className="mini-check done">✓</span> Configure Web Audio synthesizer</div>
                        <div className="mini-sub"><span className="mini-check">○</span> Test AI Co-Planner breakdown</div>
                      </div>
                    </div>

                    <div className="mock-card mint">
                      <div className="card-top">
                        <span className="card-icon">🌿</span>
                        <div className="card-meta">
                          <span className="card-title">Solar Reset Walk & Hydration</span>
                          <span className="card-time">11:00 - 11:30 (30m)</span>
                        </div>
                        <span className="card-tag">Wellness</span>
                      </div>
                    </div>

                    <div className="mock-card peach">
                      <div className="card-top">
                        <span className="card-icon">🥗</span>
                        <div className="card-meta">
                          <span className="card-title">Nourishing Lunch & Screen Break</span>
                          <span className="card-time">12:30 - 13:30 (60m)</span>
                        </div>
                        <span className="card-tag">Routine</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Live Focus Timer Widget */}
                <div className="mockup-col timer-col">
                  <div className="col-header">
                    <span className="col-title">Sensory Focus Timer</span>
                    <span className="sound-indicator">
                      {timerRunning ? <Volume2 size={13} className="sound-pulse" /> : <VolumeX size={13} />}
                      {timerRunning ? `${soundMode.toUpperCase()} NOISE` : 'MUTED'}
                    </span>
                  </div>

                  <div className="mock-timer-inner">
                    <div className="mock-timer-ring">
                      <svg width="150" height="150" viewBox="0 0 150 150">
                        <circle cx="75" cy="75" r="62" stroke="#e5e3df" strokeWidth="8" fill="transparent" />
                        <circle 
                          cx="75" cy="75" r="62" 
                          stroke="#5645d4" 
                          strokeWidth="8" 
                          fill="transparent"
                          strokeDasharray="390"
                          strokeDashoffset={390 - ((1500 - timerSeconds) / 1500) * 390}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                        />
                      </svg>
                      <div className="mock-timer-text">
                        <span className="mock-time">{formatTimer(timerSeconds)}</span>
                        <span className="mock-status">{timerRunning ? 'IN ZONE' : 'READY'}</span>
                      </div>
                    </div>

                    {/* Timer controls */}
                    <div className="mock-controls">
                      <button 
                        type="button" 
                        className={`mock-play-btn ${timerRunning ? 'running' : ''}`}
                        onClick={() => {
                          playClickSound();
                          setTimerRunning(!timerRunning);
                        }}
                      >
                        {timerRunning ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                        <span>{timerRunning ? 'Pause Session' : 'Start Focus'}</span>
                      </button>
                    </div>

                    {/* Sound Switcher */}
                    <div className="mock-sound-chips">
                      {['pink', 'rain', 'white', 'none'].map(s => (
                        <button
                          key={s}
                          type="button"
                          className={`sound-pill ${soundMode === s ? 'active' : ''}`}
                          onClick={() => {
                            playClickSound();
                            setSoundMode(s);
                          }}
                        >
                          {s === 'pink' ? 'Pink Noise' : s === 'rain' ? 'Rain' : s === 'white' ? 'White' : 'Off'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 3: Habits & AI Co-Planner Snippet */}
                <div className="mockup-col ai-col">
                  <div className="col-header">
                    <span className="col-title">AI Co-Planner & Streaks</span>
                    <span className="streak-badge-mini">🔥 5 Days</span>
                  </div>

                  <div className="mock-ai-box">
                    <span className="ai-label"><Wand2 size={12} /> Brain Dump:</span>
                    <p className="ai-quote">"{demoPrompt}"</p>
                    
                    <div className="ai-breakdown-mini">
                      {demoBreakdown.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="ai-step-pill" style={{ backgroundColor: item.tint }}>
                          <span className="step-idx">{idx + 1}.</span>
                          <span className="step-text">{item.title}</span>
                          <span className="step-min">{item.duration}m</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      type="button" 
                      className="mock-try-app-btn"
                      onClick={onLaunchApp}
                    >
                      <span>Open Full Mobile App</span>
                      <ArrowUpRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 4. AWARDS & SOCIAL PROOF MARQUEE */}
      <section className="lp-social-proof-strip">
        <div className="strip-container">
          <p className="strip-label">CELEBRATED BY OVER 1,000,000 NEURODIVERGENT PLANNERS WORLDWIDE</p>
          <div className="strip-logos-grid">
            <div className="award-item">
              <span className="award-trophy">🏆</span>
              <div>
                <strong>iPhone App of the Year</strong>
                <span>App Store Awards Finalist</span>
              </div>
            </div>
            <div className="award-item">
              <span className="award-trophy">🎨</span>
              <div>
                <strong>Apple Design Award</strong>
                <span>Inclusivity & Visual UX Nominee</span>
              </div>
            </div>
            <div className="award-item">
              <span className="award-trophy">⚡</span>
              <div>
                <strong>Fast Company</strong>
                <span>Most Innovative Productivity Tools</span>
              </div>
            </div>
            <div className="award-item">
              <span className="award-trophy">📰</span>
              <div>
                <strong>NYT Wirecutter</strong>
                <span>Best Daily Routine & Executive Planner</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CORE FEATURES DEEP-DIVE SECTION */}
      <section className="lp-features-section" id="features">
        <div className="lp-section-container">
          <div className="section-head">
            <span className="section-tag">Executive Functioning's Favorite Toolkit</span>
            <h2 className="section-title">Designed for how your brain actually works.</h2>
            <p className="section-desc">
              Standard calendars feel rigid and stressful. To-do list apps leave you paralyzed. 
              Daily Routine marries visual timeline blocks, sensory audio anchors, and smart AI breakdown into a delightful ritual.
            </p>
          </div>

          <div className="features-bento-grid">
            {/* Bento 1: Visual Timeline (Lavender Tint) */}
            <div className="bento-card tint-lavender" id="visual-planning">
              <div className="bento-badge">Visual Timeline</div>
              <h3 className="bento-title">Structure you can see</h3>
              <p className="bento-desc">
                Transform vague to-do lists into a continuous chronological day timeline. See what’s happening now, what's next, and never lose track of time.
              </p>
              <div className="bento-preview-visual">
                <div className="timeline-mock-strip">
                  <div className="time-marker">09:00</div>
                  <div className="timeline-bar-item">
                    <span className="bar-icon">☕</span>
                    <span>Morning Alignment Sprint</span>
                    <span className="bar-dur">45m</span>
                  </div>
                  <div className="time-now-line">
                    <span className="now-dot"></span>
                    <span>NOW</span>
                  </div>
                  <div className="time-marker">10:00</div>
                  <div className="timeline-bar-item active">
                    <span className="bar-icon">💻</span>
                    <span>Architecture Deep Work</span>
                    <span className="bar-dur">90m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento 2: Focus Timer (Mint Tint) */}
            <div className="bento-card tint-mint" id="focus-timer">
              <div className="bento-badge">Sensory Focus Timer</div>
              <h3 className="bento-title">Stay focused, not frozen</h3>
              <p className="bento-desc">
                Watch time pass gently with a circular progress countdown. Integrated with calming pink noise and 432Hz binaural beats to bypass ADHD resistance.
              </p>
              <div className="bento-preview-visual timer-visual">
                <div className="mini-ring-preview">
                  <div className="pulse-circle"></div>
                  <span className="mini-time-str">25:00</span>
                  <span className="mini-sound-str">Pink Noise On</span>
                </div>
              </div>
            </div>

            {/* Bento 3: AI Co-Planner (Peach Tint) */}
            <div className="bento-card tint-peach" id="ai-planner">
              <div className="bento-badge">AI Co-Planner</div>
              <h3 className="bento-title">The planning partner that gets it done</h3>
              <p className="bento-desc">
                Dump your unorganized thoughts into natural language. Our AI decomposes your goals into manageable steps and realistic timeblocks.
              </p>
              <div className="bento-preview-visual">
                <div className="ai-prompt-preview">
                  <div className="prompt-bubble">"I need to prepare for my exam tomorrow"</div>
                  <div className="arrow-down">↓</div>
                  <div className="plan-output-pill">3 blocks generated (115m total)</div>
                </div>
              </div>
            </div>

            {/* Bento 4: Flexible To-Dos (Rose Tint) */}
            <div className="bento-card tint-rose">
              <div className="bento-badge">Smart To-Do Lists</div>
              <h3 className="bento-title">Your to-do list, finally doable</h3>
              <p className="bento-desc">
                Group tasks into Work, Habits, and Personal lists. Drag or schedule any task directly into today's timeline with a single tap.
              </p>
              <div className="bento-preview-visual">
                <div className="todo-mock-item"><CheckCircle2 size={16} color="#a02e6d" /> Pick up organic groceries</div>
                <div className="todo-mock-item"><span className="circle-ph">○</span> Prepare slides for client sync</div>
              </div>
            </div>

            {/* Bento 5: Wellbeing & Sensory Regulation (Yellow Tint) */}
            <div className="bento-card tint-yellow" id="wellbeing">
              <div className="bento-badge">Sensory & Mood Check-in</div>
              <h3 className="bento-title">Regulate your nervous system</h3>
              <p className="bento-desc">
                Log daily energy levels from 1 to 5 and use the built-in 4-4-4-4 Box Breathing visualizer when task initiation anxiety strikes.
              </p>
              <div className="bento-preview-visual breathing-preview">
                <button
                  type="button"
                  className="interactive-breath-btn"
                  onClick={() => setBreathingActive(!breathingActive)}
                >
                  <span className="b-phase">{breathPhase}</span>
                  <span className="b-count">{breathSec}s</span>
                  <span className="b-sub">{breathingActive ? 'Click to pause' : 'Click to try box breathing'}</span>
                </button>
              </div>
            </div>

            {/* Bento 6: Gentle Streaks & Trophies (Sky Tint) */}
            <div className="bento-card tint-sky">
              <div className="bento-badge">Trophies & Streaks</div>
              <h3 className="bento-title">Motivation without shame</h3>
              <p className="bento-desc">
                Celebrate consistency with unlockable trophies like "Early Bird", "Focus Champion", and "Brain Dump Pro".
              </p>
              <div className="bento-preview-visual trophy-preview">
                <div className="trophy-badge-item">🏆 5-Day Habit Streak</div>
                <div className="trophy-badge-item">🎯 Focus Master Unlocked</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE AI CO-PLANNER EXPERIMENT */}
      <section className="lp-interactive-ai-section">
        <div className="lp-section-container">
          <div className="interactive-ai-card">
            <div className="ai-card-content">
              <div className="ai-card-badge">Try It Live</div>
              <h3 className="ai-card-title">Test the AI Brain Dump Decomposer</h3>
              <p className="ai-card-subtitle">
                Select a common overwhelm scenario to see how Daily Routine breaks it into structured, calm steps:
              </p>

              <div className="preset-buttons-row">
                {['Morning Reset Routine', 'Deep Study Exam Prep', 'Declutter My Room'].map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`preset-btn ${demoPrompt === p ? 'active' : ''}`}
                    onClick={() => handleAiPreset(p)}
                  >
                    <span>{p}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Output */}
              <div className="ai-live-results">
                {isAiLoading ? (
                  <div className="ai-loading-state">
                    <span className="spinner-large"></span>
                    <span>Decomposing your routine with AI...</span>
                  </div>
                ) : (
                  <div className="ai-results-grid">
                    {demoBreakdown.map((b, i) => (
                      <div key={i} className="ai-step-card" style={{ backgroundColor: b.tint }}>
                        <div className="step-num-pill">#{i + 1}</div>
                        <div className="step-info">
                          <h4 className="step-title">{b.title}</h4>
                          <span className="step-meta">Estimated Duration: {b.duration} minutes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="ai-action-footer">
                <button 
                  type="button" 
                  className="ai-add-all-btn"
                  onClick={onLaunchApp}
                >
                  <Sparkles size={16} />
                  <span>Use This Plan in Daily Routine App</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MAKE IT YOURS (Notion Design Themes) */}
      <section className="lp-themes-section">
        <div className="lp-section-container">
          <div className="section-head">
            <span className="section-tag">Notion Aesthetic Customization</span>
            <h2 className="section-title">Make it yours. Warm minimalism on every surface.</h2>
            <p className="section-desc">
              Choose from tailored palettes inspired by Notion’s design language. Switch between light, dark slate, lavender, and tranquil sage.
            </p>
          </div>

          <div className="theme-switcher-showcase">
            <div className="theme-toggle-chips">
              {[
                { id: 'warm-minimal', name: 'Notion Warm Minimal', color: '#5645d4', bg: '#ffffff' },
                { id: 'dark-slate', name: 'Notion Dark Slate', color: '#7b3ff2', bg: '#191919' },
                { id: 'lavender-mist', name: 'Lavender Mist', color: '#6e4fe0', bg: '#faf8ff' },
                { id: 'sage-tranquility', name: 'Sage Tranquility', color: '#2a9d99', bg: '#f7fbf9' }
              ].map(th => (
                <button
                  key={th.id}
                  type="button"
                  className={`theme-chip-btn ${previewTheme === th.id ? 'active' : ''}`}
                  onClick={() => {
                    playClickSound();
                    setPreviewTheme(th.id);
                  }}
                >
                  <span className="theme-dot" style={{ backgroundColor: th.color }}></span>
                  <span>{th.name}</span>
                </button>
              ))}
            </div>

            <div className="theme-preview-card">
              <div className="theme-preview-header">
                <span className="th-title">Theme Active: {previewTheme.replace('-', ' ').toUpperCase()}</span>
                <span className="th-badge">Notion DESIGN.md</span>
              </div>
              <div className="palette-strip">
                <span className="color-swatch peach" title="Peach Tint">#ffe8d4</span>
                <span className="color-swatch lavender" title="Lavender Tint">#e6e0f5</span>
                <span className="color-swatch mint" title="Mint Tint">#d9f3e1</span>
                <span className="color-swatch sky" title="Sky Tint">#dcecfa</span>
                <span className="color-swatch rose" title="Rose Tint">#fde0ec</span>
                <span className="color-swatch yellow" title="Yellow Tint">#fef7d6</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS & USER REVIEWS */}
      <section className="lp-testimonials-section">
        <div className="lp-section-container">
          <div className="section-head">
            <span className="section-tag">Loved by Neurodivergent Minds</span>
            <h2 className="section-title">"The only planner that doesn't trigger my ADHD."</h2>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="rating-stars">★★★★★</div>
              <p className="testimonial-text">
                "I have severe task initiation paralysis. Seeing my day as visual blocks with the pink noise focus timer was a genuine game changer. I've maintained a 14-day streak for the first time in my life!"
              </p>
              <div className="author-row">
                <div className="author-avatar">EP</div>
                <div>
                  <h4 className="author-name">Dr. Elena Perez</h4>
                  <span className="author-title">Cognitive Neuroscientist & Writer</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="rating-stars">★★★★★</div>
              <p className="testimonial-text">
                "The AI Co-Planner is magic. I just type 'I have 5 client emails, need to draft a brief, and buy groceries' and it instantly estimates the minutes and slots them into my day without feeling overwhelmed."
              </p>
              <div className="author-row">
                <div className="author-avatar">MC</div>
                <div>
                  <h4 className="author-name">Marcus Chen</h4>
                  <span className="author-title">Design Lead & Founder</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="rating-stars">★★★★★</div>
              <p className="testimonial-text">
                "The Notion design aesthetic makes it feel so calm and clean. No ugly gamification, just pure warm minimalism and gentle routines that respect my energy levels."
              </p>
              <div className="author-row">
                <div className="author-avatar">SL</div>
                <div>
                  <h4 className="author-name">Sarah Lindqvist</h4>
                  <span className="author-title">Architectural Student</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. NOTION 4-TIER PRICING TABLE */}
      <section className="lp-pricing-section" id="pricing">
        <div className="lp-section-container">
          <div className="section-head">
            <span className="section-tag">Simple, Transparent Pricing</span>
            <h2 className="section-title">Start free. Upgrade when you're ready.</h2>
            <p className="section-desc">Free forever for personal daily planning. Unlock unlimited AI co-planning with Pro.</p>
          </div>

          <div className="pricing-cards-grid">
            {/* Free Tier */}
            <div className="pricing-card">
              <div className="plan-name">Free</div>
              <div className="plan-price">$0 <span>/ forever</span></div>
              <p className="plan-summary">Essential visual daily planning and habit tracking.</p>
              <ul className="plan-features">
                <li><Check size={14} className="check-icon" /> Unlimited daily timeline routines</li>
                <li><Check size={14} className="check-icon" /> Focus timer with pink noise</li>
                <li><Check size={14} className="check-icon" /> Checklist subtasks on activities</li>
                <li><Check size={14} className="check-icon" /> 3 AI brain dumps per day</li>
                <li><Check size={14} className="check-icon" /> Sensory box breathing tool</li>
              </ul>
              <button 
                type="button" 
                className="plan-btn secondary"
                onClick={onLaunchApp}
              >
                Start Free
              </button>
            </div>

            {/* Plus Tier (Featured Notion Purple) */}
            <div className="pricing-card featured">
              <div className="featured-badge">MOST POPULAR</div>
              <div className="plan-name">Plus</div>
              <div className="plan-price">$4.99 <span>/ month</span></div>
              <p className="plan-summary">For deep focus and full routine personalization.</p>
              <ul className="plan-features">
                <li><Check size={14} className="check-icon" /> <strong>Everything in Free</strong></li>
                <li><Check size={14} className="check-icon" /> 50 AI Co-Planner breakdowns/mo</li>
                <li><Check size={14} className="check-icon" /> All 4 Notion palette color themes</li>
                <li><Check size={14} className="check-icon" /> Binaural 432Hz focus audio engine</li>
                <li><Check size={14} className="check-icon" /> Multi-device calendar sync</li>
              </ul>
              <button 
                type="button" 
                className="plan-btn primary"
                onClick={onLaunchApp}
              >
                Get Plus (7-Day Trial)
              </button>
            </div>

            {/* Pro AI Tier */}
            <div className="pricing-card">
              <div className="plan-name">Pro AI</div>
              <div className="plan-price">$8.99 <span>/ month</span></div>
              <p className="plan-summary">Unlimited AI co-planning and executive voice dumps.</p>
              <ul className="plan-features">
                <li><Check size={14} className="check-icon" /> <strong>Everything in Plus</strong></li>
                <li><Check size={14} className="check-icon" /> <strong>Unlimited AI</strong> Co-Planning</li>
                <li><Check size={14} className="check-icon" /> Natural voice brain dumps</li>
                <li><Check size={14} className="check-icon" /> Advanced weekly productivity insights</li>
                <li><Check size={14} className="check-icon" /> Priority neurodiversity coaching support</li>
              </ul>
              <button 
                type="button" 
                className="plan-btn secondary"
                onClick={onLaunchApp}
              >
                Upgrade to Pro AI
              </button>
            </div>

            {/* Lifetime Tier */}
            <div className="pricing-card">
              <div className="plan-name">Lifetime</div>
              <div className="plan-price">$79 <span>/ one-time</span></div>
              <p className="plan-summary">Pay once, own Daily Routine forever with all updates.</p>
              <ul className="plan-features">
                <li><Check size={14} className="check-icon" /> Lifetime access to all features</li>
                <li><Check size={14} className="check-icon" /> All future Notion theme kits</li>
                <li><Check size={14} className="check-icon" /> Zero recurring subscription fees</li>
                <li><Check size={14} className="check-icon" /> VIP community member badge</li>
              </ul>
              <button 
                type="button" 
                className="plan-btn secondary"
                onClick={onLaunchApp}
              >
                Buy Lifetime License
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. INTERACTIVE FAQ ACCORDION */}
      <section className="lp-faq-section" id="faq">
        <div className="lp-section-container narrow">
          <div className="section-head">
            <span className="section-tag">Frequently Asked Questions</span>
            <h2 className="section-title">Everything you need to know.</h2>
          </div>

          <div className="faq-accordion-list">
            {[
              {
                q: "How does Daily Routine help with ADHD and executive functioning?",
                a: "People with ADHD often experience 'time blindness'—the feeling that time is invisible until a deadline creates panic. Daily Routine makes time visible with horizontal timeline bars, a moving real-time NOW indicator, and audio anchors (like pink noise) that provide steady sensory stimulation while lowering task initiation friction."
              },
              {
                q: "Is Daily Routine available as an offline mobile app?",
                a: "Yes! Daily Routine works offline on iOS, Android, and web. All your routines, checklists, and ambient sound engines run locally with zero latency, even on airplane mode."
              },
              {
                q: "Can I customize the themes and colors to match my Notion workspace?",
                a: "Absolutely. We adopted Notion's official DESIGN.md specification. You can customize cards using Notion's exact pastel tints (Lavender, Peach, Mint, Sky, Rose, Butter, Warm Cream) and switch between Notion Warm Minimal and Dark Slate themes."
              },
              {
                q: "How does the AI Co-Planner estimate durations?",
                a: "Our AI model analyzes your natural language input, breaks down complex vague tasks into micro-actions, and estimates realistic durations based on cognitive load models (e.g. 15–25m for cognitive tasks, 45m for deep work, 15m for physical resets)."
              },
              {
                q: "How do streaks work if I miss a day?",
                a: "We believe in motivation without shame. Unlike apps that punish you with a zero streak, Daily Routine includes 'streak forgiveness' and celebrates progress over robotic perfection."
              }
            ].map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="faq-item">
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => {
                      playClickSound();
                      setOpenFaq(isOpen ? null : index);
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && (
                    <div className="faq-answer animate-fade-in">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. PRE-FOOTER CTA BANNER */}
      <section className="lp-prefooter-banner">
        <div className="prefooter-inner">
          <div className="prefooter-sparkle">✦</div>
          <h2 className="prefooter-title">Ready to bring calm clarity to your daily routine?</h2>
          <p className="prefooter-subtitle">
            Join over 1,000,000 thinkers, students, and neurodivergent planners who reclaimed their days.
          </p>
          <div className="prefooter-actions">
            <button 
              type="button" 
              className="lp-hero-btn primary"
              onClick={onLaunchApp}
            >
              <span>Launch Daily Routine App Now</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 12. NOTION STYLE FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-container">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <span className="logo-icon">✦</span>
              <span className="logo-text">Daily Routine</span>
            </div>
            <p className="footer-bio">
              Award-winning visual day planner & focus toolkit built for real life. Inspired by Tiimo and engineered with Notion's warm minimal design.
            </p>
            <div className="footer-copyright">
              © 2026 Daily Routine. Built with <span style={{ color: '#ff64c8' }}>♥</span> for neurodivergent focus.
            </div>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Product</h4>
            <a href="#visual-planning" className="footer-link">Visual Planning</a>
            <a href="#focus-timer" className="footer-link">Focus Timer</a>
            <a href="#ai-planner" className="footer-link">AI Co-Planner</a>
            <a href="#wellbeing" className="footer-link">Wellbeing & Box Breathing</a>
            <a href="#pricing" className="footer-link">Pricing Plans</a>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Resources</h4>
            <a href="#" className="footer-link">ADHD Executive Functioning Guide</a>
            <a href="#" className="footer-link">Sensory Calming Audio Science</a>
            <a href="#" className="footer-link">Time Blocking Best Practices</a>
            <a href="#" className="footer-link">Notion DESIGN.md Specs</a>
            <a href="#" className="footer-link">Community Discord</a>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Company</h4>
            <a href="#" className="footer-link">About Us</a>
            <a href="#" className="footer-link">Neurodiversity Mission</a>
            <a href="#" className="footer-link">App Store Awards</a>
            <a href="#" className="footer-link">Privacy & Offline Data</a>
            <a href="#" className="footer-link">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
