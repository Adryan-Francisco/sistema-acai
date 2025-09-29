// src/components/ModernButton.jsx
import React from 'react';
import './ModernButton.css';

const ModernButton = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  className = '',
  gradient = false,
  ...props
}) => {
  const buttonClasses = [
    'modern-button',
    `modern-button--${variant}`,
    `modern-button--${size}`,
    loading && 'modern-button--loading',
    disabled && 'modern-button--disabled',
    fullWidth && 'modern-button--full-width',
    gradient && 'modern-button--gradient',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (!loading && !disabled && onClick) {
      onClick(e);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="modern-button__spinner"></div>
          <span className="modern-button__loading-text">Processando...</span>
        </>
      );
    }

    if (icon && iconPosition === 'left') {
      return (
        <>
          <span className="modern-button__icon modern-button__icon--left">
            {icon}
          </span>
          <span className="modern-button__text">{children}</span>
        </>
      );
    }

    if (icon && iconPosition === 'right') {
      return (
        <>
          <span className="modern-button__text">{children}</span>
          <span className="modern-button__icon modern-button__icon--right">
            {icon}
          </span>
        </>
      );
    }

    return <span className="modern-button__text">{children}</span>;
  };

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      <span className="modern-button__content">
        {renderContent()}
      </span>
      <div className="modern-button__ripple"></div>
    </button>
  );
};

export default ModernButton;