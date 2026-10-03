import React from 'react';
import { Clock, CheckSquare, PlayCircle, Sparkles, Heart, Award } from 'lucide-react';

export default function BottomNavBar({ activeTab, onSelectTab, pendingTodoCount = 0 }) {
  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'todo', label: 'To-Do', icon: CheckSquare, badge: pendingTodoCount > 0 ? pendingTodoCount : null },
    { id: 'focus', label: 'Focus', icon: PlayCircle, isSpecial: true },
    { id: 'ai', label: 'Co-Planner', icon: Sparkles },
    { id: 'wellbeing', label: 'Wellbeing', icon: Heart },
    { id: 'trophies', label: 'Trophies', icon: Award }
  ];

  return (
    <nav className="bottom-nav-bar">
      <div className="bottom-nav-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''} ${tab.isSpecial ? 'special-focus' : ''}`}
              onClick={() => onSelectTab(tab.id)}
            >
              <div className="nav-icon-container">
                <Icon size={tab.isSpecial ? 20 : 18} strokeWidth={isActive ? 2.4 : 1.9} />
                {tab.badge && (
                  <span className="nav-badge">{tab.badge}</span>
                )}
              </div>
              <span className="nav-label">{tab.label}</span>
              {isActive && <span className="nav-active-pill" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
