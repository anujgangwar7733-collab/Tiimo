import React, { useState } from 'react';
import { Sparkles, Send, ArrowRight, Clock, Plus, CheckCircle2, Bot, Wand2, Lightbulb } from 'lucide-react';
import { AI_PROMPT_PRESETS } from '../utils/initialData';
import { NOTION_TINTS } from '../utils/notionTokens';
import { playClickSound, playCompletionChime } from '../utils/audioEngine';

export default function AiPlannerView({ onAddGeneratedActivities }) {
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Smart heuristic AI generator for natural language routine breakdowns
  const generatePlan = (text) => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setSuccessMessage('');
    playClickSound();

    setTimeout(() => {
      const lower = text.toLowerCase();
      let activities = [];

      if (lower.includes('morning') || lower.includes('wake') || lower.includes('reset')) {
        activities = [
          {
            id: `ai-${Date.now()}-1`,
            title: 'Hydration & Mindful Grounding',
            icon: 'Sun',
            startTime: '07:00',
            durationMinutes: 20,
            tintId: 'yellow',
            category: 'Wellness',
            isCompleted: false,
            subtasks: [
              { id: 'ai-s1', title: 'Drink 500ml room temperature water', completed: false },
              { id: 'ai-s2', title: '5 min deep belly breathing', completed: false }
            ],
            notes: 'Wake up nervous system gently without social media.'
          },
          {
            id: `ai-${Date.now()}-2`,
            title: 'Somatic Movement & Shower',
            icon: 'Footprints',
            startTime: '07:25',
            durationMinutes: 35,
            tintId: 'mint',
            category: 'Routine',
            isCompleted: false,
            subtasks: [
              { id: 'ai-s3', title: '15 min gentle spine mobility stretches', completed: false },
              { id: 'ai-s4', title: 'Warm shower and dress in comfortable clothes', completed: false }
            ]
          },
          {
            id: `ai-${Date.now()}-3`,
            title: 'Protein Breakfast & Day Preview',
            icon: 'Utensils',
            startTime: '08:05',
            durationMinutes: 30,
            tintId: 'peach',
            category: 'Routine',
            isCompleted: false,
            subtasks: [
              { id: 'ai-s5', title: 'High-protein breakfast & herbal tea', completed: false },
              { id: 'ai-s6', title: 'Identify #1 most important win for today', completed: false }
            ]
          }
        ];
      } else if (lower.includes('study') || lower.includes('exam') || lower.includes('learning')) {
        activities = [
          {
            id: `ai-${Date.now()}-1`,
            title: 'Study Block 1: Core Concepts Review',
            icon: 'BookOpen',
            startTime: '10:00',
            durationMinutes: 45,
            tintId: 'lavender',
            category: 'Study',
            isCompleted: false,
            subtasks: [
              { id: 'ai-s1', title: 'Read lecture notes and highlight formulas', completed: false },
              { id: 'ai-s2', title: 'Create 10 active recall flashcards', completed: false }
            ]
          },
          {
            id: `ai-${Date.now()}-2`,
            title: 'Brain Recharge & Hydration Break',
            icon: 'Coffee',
            startTime: '10:50',
            durationMinutes: 15,
            tintId: 'sky',
            category: 'Break',
            isCompleted: false,
            subtasks: [
              { id: 'ai-s3', title: 'Step away from screen, walk around room', completed: false }
            ]
          },
          {
            id: `ai-${Date.now()}-3`,
            title: 'Study Block 2: Practice Problems Sprint',
            icon: 'Laptop',
            startTime: '11:10',
            durationMinutes: 50,
            tintId: 'rose',
            category: 'Study',
            isCompleted: false,
            subtasks: [
              { id: 'ai-s4', title: 'Solve 5 past examination questions without looking', completed: false },
              { id: 'ai-s5', title: 'Score and note any incorrect concepts', completed: false }
            ]
          }
        ];
      } else if (lower.includes('clean') || lower.includes('declutter') || lower.includes('room') || lower.includes('house')) {
        activities = [
          {
            id: `ai-${Date.now()}-1`,
            title: 'Surface Clear & Trash Blitz',
            icon: 'Sparkles',
            startTime: '14:00',
            durationMinutes: 20,
            tintId: 'mint',
            category: 'Home',
            isCompleted: false,
            subtasks: [
              { id: 'ai-s1', title: 'Bag all trash, wrappers, and recycled papers', completed: false },
              { id: 'ai-s2', title: 'Return dirty dishes and cups to kitchen sink', completed: false }
            ]
          },
          {
            id: `ai-${Date.now()}-2`,
            title: 'Laundry & Clothes Organizing',
            icon: 'CheckSquare',
            startTime: '14:25',
            durationMinutes: 25,
            tintId: 'lavender',
            category: 'Home',
            isCompleted: false,
            subtasks: [
              { id: 'ai-s3', title: 'Hang clean jackets and place dirty clothes in hamper', completed: false },
              { id: 'ai-s4', title: 'Start a wash load cycle', completed: false }
            ]
          },
          {
            id: `ai-${Date.now()}-3`,
            title: 'Desk Wipe & Room Airing',
            icon: 'Sun',
            startTime: '14:55',
            durationMinutes: 15,
            tintId: 'cream',
            category: 'Home',
            isCompleted: false,
            subtasks: [
              { id: 'ai-s5', title: 'Wipe work desk surface with damp cloth', completed: false },
              { id: 'ai-s6', title: 'Open windows for 10 minutes fresh air', completed: false }
            ]
          }
        ];
      } else {
        // Universal task decomposition
        const titleWords = text.trim().slice(0, 32);
        activities = [
          {
            id: `ai-${Date.now()}-1`,
            title: `Phase 1: Setup & Outline - ${titleWords}`,
            icon: 'Laptop',
            startTime: '10:00',
            durationMinutes: 30,
            tintId: 'sky',
            category: 'Planning',
            isCompleted: false,
            subtasks: [
              { id: 'ai-s1', title: 'Gather all required materials and tabs', completed: false },
              { id: 'ai-s2', title: 'Write down the clear outcome checklist', completed: false }
            ]
          },
          {
            id: `ai-${Date.now()}-2`,
            title: `Phase 2: Execution Sprint - ${titleWords}`,
            icon: 'Sparkles',
            startTime: '10:35',
            durationMinutes: 50,
            tintId: 'peach',
            category: 'Focus',
            isCompleted: false,
            subtasks: [
              { id: 'ai-s3', title: 'Perform first uninterrupted deep work sprint', completed: false },
              { id: 'ai-s4', title: 'Review progress against milestone goals', completed: false }
            ]
          },
          {
            id: `ai-${Date.now()}-3`,
            title: `Phase 3: Wrap-up & Wrap Alignment`,
            icon: 'CheckSquare',
            startTime: '11:30',
            durationMinutes: 20,
            tintId: 'mint',
            category: 'Review',
            isCompleted: false,
            subtasks: [
              { id: 'ai-s5', title: 'Save outputs and send updates', completed: false },
              { id: 'ai-s6', title: 'Tidy up digital workspace tabs', completed: false }
            ]
          }
        ];
      }

      setGeneratedPlan(activities);
      setIsGenerating(false);
      playCompletionChime();
    }, 900);
  };

  const handleApplyToTimeline = () => {
    if (!generatedPlan || generatedPlan.length === 0) return;
    playClickSound();
    onAddGeneratedActivities(generatedPlan);
    setSuccessMessage(`✓ Successfully added ${generatedPlan.length} activities to your Daily Timeline!`);
    setGeneratedPlan(null);
    setPromptInput('');
    playCompletionChime();
  };

  return (
    <div className="ai-planner-container animate-fade-in">
      {/* Intro Header */}
      <div className="ai-header-card">
        <div className="ai-avatar-badge">
          <Wand2 size={20} className="ai-wand" />
        </div>
        <div className="ai-header-text">
          <h2 className="ai-title">AI Co-Planner</h2>
          <p className="ai-desc">
            Turn your brain dump into a calm, structured visual schedule with realistic time estimations.
          </p>
        </div>
      </div>

      {/* Input Box */}
      <div className="ai-input-card">
        <label className="ai-input-label" htmlFor="brain-dump-input">
          <Bot size={14} className="inline-icon" />
          Brain Dump / What's on your mind?
        </label>
        <textarea
          id="brain-dump-input"
          className="ai-textarea"
          rows={3}
          placeholder="e.g. I need to prepare a 10-slide deck, answer urgent client emails, and go for a quick 20 min walk before dinner..."
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
        />

        <div className="ai-input-actions">
          <span className="ai-hint">Instant time-block & step breakdown</span>
          <button
            type="button"
            className="ai-generate-btn"
            disabled={!promptInput.trim() || isGenerating}
            onClick={() => generatePlan(promptInput)}
          >
            {isGenerating ? (
              <>
                <span className="spinner"></span>
                <span>Decomposing...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Build Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="ai-presets-section">
        <span className="presets-title">
          <Lightbulb size={13} className="inline-icon" />
          Or try a quick preset:
        </span>
        <div className="preset-grid">
          {AI_PROMPT_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-chip"
              onClick={() => {
                setPromptInput(preset.prompt);
                generatePlan(preset.prompt);
              }}
            >
              <span className="preset-chip-title">{preset.title}</span>
              <span className="preset-chip-cat">{preset.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="ai-success-banner animate-fade-in">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Generated Plan Review */}
      {generatedPlan && (
        <div className="generated-plan-card animate-fade-in">
          <div className="plan-header-row">
            <div>
              <h3 className="plan-title">Generated Routine Breakdown</h3>
              <span className="plan-subtitle">
                {generatedPlan.length} structured blocks • Total ~
                {generatedPlan.reduce((acc, i) => acc + i.durationMinutes, 0)} min
              </span>
            </div>
            <button
              type="button"
              className="plan-apply-btn"
              onClick={handleApplyToTimeline}
            >
              <Plus size={16} />
              <span>Add to Today</span>
            </button>
          </div>

          <div className="plan-items-preview">
            {generatedPlan.map((act, index) => {
              const tint = NOTION_TINTS.find(t => t.id === act.tintId) || NOTION_TINTS[0];
              return (
                <div 
                  key={act.id} 
                  className="preview-item-row"
                  style={{ backgroundColor: tint.bg, borderColor: tint.border }}
                >
                  <div className="preview-item-left">
                    <span className="preview-step-num" style={{ color: tint.accent }}>#{index + 1}</span>
                    <div>
                      <h4 className="preview-item-title" style={{ color: tint.text }}>{act.title}</h4>
                      <span className="preview-item-time" style={{ color: tint.text }}>
                        <Clock size={11} className="inline-icon" />
                        {act.startTime} ({act.durationMinutes}m)
                      </span>
                    </div>
                  </div>

                  {act.subtasks && (
                    <span className="preview-sub-count" style={{ color: tint.accent }}>
                      {act.subtasks.length} subtasks
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
