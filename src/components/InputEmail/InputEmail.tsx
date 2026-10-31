import { useState, useEffect } from 'react';
import styles from './InputEmail.module.css';

interface InputEmailProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
}

export function InputEmail({
  value,
  onChange,
  onValidationChange,
  placeholder = 'exemplo@email.com',
}: InputEmailProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [status, setStatus] = useState<'empty' | 'valid' | 'invalid'>('empty');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!value || value.trim() === '') {
      setStatus('empty');
      setErrorMessage('');
      onValidationChange?.(false);
      return;
    }

    // Validação regex simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);

    if (isValid) {
      setStatus('valid');
      setErrorMessage('');
      onValidationChange?.(true);
    } else {
      setStatus('invalid');
      setErrorMessage('E-mail inválido.');
      onValidationChange?.(false);
    }
  }, [value, onValidationChange]);

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
          type="email"
          className={styles.input}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
      {status === 'invalid' && errorMessage && (
        <span className={styles.errorLabel}>{errorMessage}</span>
      )}
    </div>
  );
}
