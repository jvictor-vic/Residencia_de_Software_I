import { useState } from 'react';
import styles from './TextInputValidation.module.css';

import validCheck from '../../assets/icons/validCheck.svg';
import invalidCheck from '../../assets/icons/invalidCheck.svg';

interface TextInputValidationProps extends React.InputHTMLAttributes<HTMLInputElement> {
  status?: 'empty' | 'valid' | 'invalid';
  errorMessage?: string;
}

export function TextInputValidation({
  status = 'empty',
  errorMessage,
  className,
  onFocus,
  onBlur,
  ...props
}: TextInputValidationProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const wrapperClasses = [
    styles.wrapper,
    isFocused && styles.active,
    status === 'valid' && styles.valid,
    status === 'invalid' && styles.invalid,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.container}>
      <div className={wrapperClasses}>
        <input
          type="text"
          className={`${styles.input} ${className || ''}`}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Ícone Inline para Estado Válido (Checkmark) */}
        {status === 'valid' && (
          <span className={`${styles.iconContainer} ${styles.validIcon}`} aria-label="Válido">
            <img src={validCheck.src} />
          </span>
        )}

        {/* Ícone Inline para Estado Inválido (X) */}
        {status === 'invalid' && (
          <span className={`${styles.iconContainer} ${styles.invalidIcon}`} aria-label="Inválido">
            <img src={invalidCheck.src} />
          </span>
        )}
      </div>

      {/* Label com a descrição do erro */}
      {status === 'invalid' && errorMessage && (
        <span className={styles.errorLabel}>{errorMessage}</span>
      )}
    </div>
  );
}
