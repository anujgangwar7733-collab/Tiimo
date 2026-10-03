import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sunrise, Sparkles, Flame, Award, Heart, CheckCheck, 
  Lock, Check, Trophy as TrophyIcon, ChevronLeft 
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';

const BADGE_ICONS = {
  early_bird: Sunrise,
  deep_diver: Sparkles,
  streak_7: Flame,
  task_crusher: Award,
  mindful_soul: Heart,
  flow_initiate: CheckCheck
};

export default function TrophiesView({ onBack, isDarkMode = false }) {
  const { trophies, streak, triggerConfettiCelebration } = useGamification();

  const unlockedCount = trophies.filter(t => t.isUnlocked).length;
  const totalCount = trophies.length;

  return (
    <div className="tiimo-trophies-container animate-fade-in">
      {/* Header bar */}
      <div className="trophies-header-row">
        {onBack && (
          <button 
            type="button" 
            className="trophies-back-btn" 
            onClick={onBack}
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="trophies-header-titles">
          <h3 className="trophies-main-title">Achievements & Badges</h3>
          <span className="trophies-sub">Celebrate your mindful routine milestones</span>
        </div>
      </div>

      {/* Hero Stats Card */}
      <div className="trophies-hero-banner">
        <div className="trophy-cup-circle">
          <TrophyIcon size={26} className="trophy-bounce-icon" />
        </div>
        <div className="hero-text-block">
          <span className="hero-progress-label">YOUR TROPHY CABINET</span>
          <h4 className="hero-unlocked-score">
            {unlockedCount} of {totalCount} Badges Unlocked
          </h4>
          <div className="hero-score-bar-track">
            <div 
              className="hero-score-bar-fill"
              style={{ width: `${Math.round((unlockedCount / totalCount) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="trophies-badges-grid">
        {trophies.map((badge, idx) => {
          const Icon = BADGE_ICONS[badge.key] || Award;
          const isUnlocked = !!badge.isUnlocked;

          return (
            <motion.div
              key={badge.key}
              className={`badge-card ${isUnlocked ? 'is-unlocked' : 'is-locked'}`}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (isUnlocked) {
                  triggerConfettiCelebration(`Badge: ${badge.title}! 🏆`);
                }
              }}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="badge-card-top">
                <div className={`badge-icon-disc ${isUnlocked ? 'unlocked-glow' : 'locked-disc'}`}>
                  <Icon size={22} />
                </div>
                <span className={`badge-status-pill ${isUnlocked ? 'pill-unlocked' : 'pill-locked'}`}>
                  {isUnlocked ? (
                    <>
                      <Check size={11} strokeWidth={3} />
                      <span>Unlocked</span>
                    </>
                  ) : (
                    <>
                      <Lock size={11} />
                      <span>In Progress</span>
                    </>
                  )}
                </span>
              </div>

              <div className="badge-info-block">
                <h5 className="badge-title">{badge.title}</h5>
                <p className="badge-desc">{badge.description}</p>
              </div>

              {isUnlocked && badge.unlockedAt && (
                <div className="badge-unlocked-date">
                  <span>Earned {new Date(badge.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
