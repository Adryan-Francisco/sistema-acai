// src/components/ModernCard.jsx
import React from 'react';
import './ModernCard.css';

const ModernCard = ({ 
  children, 
  className = '', 
  hoverable = true, 
  clickable = false,
  onClick,
  gradient = false,
  loading = false,
  animate = true,
  delay = 0,
  ...props 
}) => {
  const cardClasses = [
    'modern-card',
    hoverable && 'modern-card--hoverable',
    clickable && 'modern-card--clickable',
    gradient && 'modern-card--gradient',
    loading && 'modern-card--loading',
    animate && 'modern-card--animate',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (onClick && !loading) {
      onClick(e);
    }
  };

  const style = animate && delay > 0 ? { 
    animationDelay: `${delay}s`,
    opacity: 0,
    ...props.style
  } : props.style;

  if (loading) {
    return (
      <div className={cardClasses} style={style} {...props}>
        <div className="modern-card__loading">
          <div className="loading-spinner"></div>
          <div className="skeleton-content">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
      style={style}
      {...props}
    >
      {gradient && <div className="modern-card__gradient-overlay"></div>}
      <div className="modern-card__content">
        {children}
      </div>
    </div>
  );
};

// Componente de header para o card
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`modern-card__header ${className}`} {...props}>
    {children}
  </div>
);

// Componente de body para o card
export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`modern-card__body ${className}`} {...props}>
    {children}
  </div>
);

// Componente de footer para o card
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`modern-card__footer ${className}`} {...props}>
    {children}
  </div>
);

export { ModernCard };
export default ModernCard;