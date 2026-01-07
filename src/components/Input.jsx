import React from 'react';
import './Input.css';

const Input = ({ label, error, className = '', id, ...props }) => {
    // Generate random ID if not provided for accessibility
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`input-group ${className}`}>
            {label && (
                <label htmlFor={inputId} className="input-label">
                    {label}
                </label>
            )}
            {props.icon ? (
                <div className="input-wrapper">
                    <div className="input-icon">
                        {props.icon}
                    </div>
                    <input
                        id={inputId}
                        className={`input-field input-field-with-icon ${error ? 'input-error' : ''}`}
                        {...props}
                    />
                </div>
            ) : (
                <input
                    id={inputId}
                    className={`input-field ${error ? 'input-error' : ''}`}
                    {...props}
                />
            )}
            {error && <span className="input-error-message">{error}</span>}
        </div>
    );
};

export default Input;
