import { useState, useEffect } from 'react';
import { IMaskInput } from 'react-imask';
import styles from './InputTel.module.css';

interface InputTelProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
}

export function InputTel({
  value,
  onChange,
  onValidationChange,
  placeholder = '(00) 00000-0000',
}: InputTelProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [status, setStatus] = useState<'empty' | 'valid' | 'invalid'>('empty');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const cleanTel = value ? value.replace(/[^\d]/g, '') : '';

    if (cleanTel.length === 0) {
      setStatus('empty');
      setErrorMessage('');
      onValidationChange?.(false);
      return;
    }

    // Telefone válido deve ter 10 (fixo) ou 11 (celular) dígitos
    if (cleanTel.length < 10) {
      setStatus('invalid');
      setErrorMessage('Telefone incompleto.');
      onValidationChange?.(false);
    } else {
      setStatus('valid');
      setErrorMessage('');
      onValidationChange?.(true);
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
        <IMaskInput
          type="tel"
          mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
          value={value || ''}
          onAccept={(maskedValue: string) => onChange(maskedValue)}
          placeholder={placeholder}
          className={styles.input}
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
