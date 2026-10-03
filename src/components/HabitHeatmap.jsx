import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle, Info } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';

export default function HabitHeatmap({ isDarkMode = false }) {
  const { heatmapData } = useGamification();
  const [selectedDay, setSelectedDay] = useState(null);

  // Intensity color resolver
  const getCellColor = (intensity) => {
    switch (intensity) {
      case 3:
        return '#52B788'; // 100% Signature Tiimo Green
      case 2:
        return '#95D5B2'; // 50-80% Medium Sage
      case 1:
        return '#D8F3DC'; // 1-49% Light Mint
      case 0:
      default:
        return isDarkMode ? '#2C2D2F' : '#F0F0EE'; // 0% Off-white / soft charcoal
    }
  };

  const getBorderColor = (intensity) => {
    if (intensity === 0) {
      return isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
    }
    return 'rgba(82, 183, 136, 0.3)';
  };

  // Group days into 7-day columns (GitHub-style calendar layout)
  const columns = [];
  const daysPerCol = 7;
  for (let i = 0; i < heatmapData.length; i += daysPerCol) {
    columns.push(heatmapData.slice(i, i + daysPerCol));
  }

  const activeDay = selectedDay || (heatmapData.length > 0 ? heatmapData[heatmapData.length - 1] : null);

  return (
    <div className="tiimo-heatmap-container">
      <div className="heatmap-header">
        <div className="heatmap-title-block">
          <Calendar size={16} className="heatmap-cal-icon" />
          <h4 className="heatmap-title">30-Day Routine Consistency</h4>
        </div>
        <span className="heatmap-sub-tag">Heatmap</span>
      </div>

      {/* Grid of days */}
      <div className="heatmap-grid-scroll-wrapper">
        <div className="heatmap-grid">
          {heatmapData.map((day) => {
            const isSelected = activeDay?.date === day.date;
            const bg = getCellColor(day.intensity);
            const border = getBorderColor(day.intensity);

            return (
              <motion.button
                key={day.date}
                type="button"
                className={`heatmap-cell ${isSelected ? 'active-cell' : ''}`}
                style={{
                  backgroundColor: bg,
                  borderColor: border
                }}
                whileHover={{ scale: 1.25, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDay(day)}
                title={`${day.date}: ${day.completedTasks}/${day.totalTasks} routines completed`}
                aria-label={`Routines on ${day.date}`}
              />
            );
          })}
        </div>
      </div>

      {/* Interactive Day Inspector Box */}
      {activeDay && (
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeDay.date}
            className="heatmap-inspector-card"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <div className="inspector-left">
              <span className="inspector-date-label">
                {new Date(activeDay.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <div className="inspector-stat-row">
                <CheckCircle size={14} className="inspector-check-icon" />
                <span className="inspector-count-text">
                  <strong>{activeDay.completedTasks}</strong> of {activeDay.totalTasks || activeDay.completedTasks} routines completed
                </span>
                <span className="inspector-badge">{activeDay.percentage}%</span>
              </div>
            </div>

            {activeDay.mood && (
              <div className="inspector-mood-chip">
                <span>Mood:</span>
                <span className="mood-val">{activeDay.mood}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Color Legend */}
      <div className="heatmap-legend-row">
        <span className="legend-label">Less Flow</span>
        <div className="legend-swatches">
          <span className="swatch-box" style={{ backgroundColor: isDarkMode ? '#2C2D2F' : '#F0F0EE' }} title="0% Completed" />
          <span className="swatch-box" style={{ backgroundColor: '#D8F3DC' }} title="1-49% Completed" />
          <span className="swatch-box" style={{ backgroundColor: '#95D5B2' }} title="50-79% Completed" />
          <span className="swatch-box" style={{ backgroundColor: '#52B788' }} title="80-100% Completed" />
        </div>
        <span className="legend-label">Deep Flow</span>
      </div>
    </div>
  );
}
