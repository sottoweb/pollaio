import React from 'react';
import './Button.css';

/**
 * Accessible Button Component
 * @param {string} variant - primary, secondary, danger, outline, ghost
 * @param {string} size - sm, md, lg
 * @param {boolean} isLoading - Shows loading spinner
 * @param {React.ReactNode} icon - Icon component from lucide-react
 * @param {string} className - Additional classes
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon = null,
    className = '',
    disabled,
    ...props
}) => {
    return (
        <button
            className={`btn btn-${variant} btn-${size} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="spinner" aria-hidden="true"></span>
            ) : icon ? (
                <span className="btn-icon">{icon}</span>
            ) : null}
            <span className="btn-text">{children}</span>
        </button>
    );
};

export default Button;
