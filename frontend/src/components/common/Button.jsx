import React from 'react';
import './Button.css';

function Button({ children, type = 'button', variant = 'primary', onClick, disabled, className = '', ...props }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`TV-btn TV-btn-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
