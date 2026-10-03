import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckSquare, PlayCircle, User, Plus } from 'lucide-react';

export default function BottomNavBar({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  pendingTodoCount = 0
}) {
  const tabs = [
    { id: 'timeline', label: 'Today', icon: Clock },
    { id: 'todo', label: 'To-Do', icon: CheckSquare, badge: pendingTodoCount > 0 ? pendingTodoCount : null },
    { id: 'focus', label: 'Focus', icon: PlayCircle },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="tiimo-nav-wrapper">
      {/* Floating Action Button (FAB) */}
      <motion.button
        type="button"
        className="tiimo-fab-btn"
        onClick={onOpenAddModal}
        title="Add Activity or Routine"
        aria-label="Add activity"
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
      >
        <Plus size={24} strokeWidth={2.8} />
      </motion.button>

      {/* Floating Docked Navigation Bar */}
      <nav className="tiimo-floating-navbar">
        <div className="navbar-pill-container">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                className={`navbar-tab-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectTab(tab.id)}
              >
                {isActive && (
                  <motion.div
                    className="navbar-active-bg"
                    layoutId="activeTabBadge"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}

                <div className="tab-icon-wrapper">
                  <Icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 1.9}
                  />
                  {tab.badge && (
                    <span className="tab-counter-badge">{tab.badge}</span>
                  )}
                </div>

                <span className="tab-label">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
