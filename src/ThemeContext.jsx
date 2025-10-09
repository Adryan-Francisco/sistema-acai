// src/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Recuperar tema do localStorage ou usar 'light' como padrão
    const savedTheme = localStorage.getItem('acai-theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Aplicar tema ao body
    document.body.setAttribute('data-theme', theme);
    // Salvar no localStorage
    localStorage.setItem('acai-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
