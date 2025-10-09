// src/components/ThemeToggle.jsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      className="theme-toggle"
      aria-label={`Mudar para modo ${isDark ? 'claro' : 'escuro'}`}
      title={`Modo ${isDark ? 'Claro' : 'Escuro'}`}
    >
      <div className="theme-toggle-inner">
        {isDark ? (
          <Sun size={18} className="theme-icon" />
        ) : (
          <Moon size={18} className="theme-icon" />
        )}
      </div>
    </button>
  );
}
