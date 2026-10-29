import { useState, useEffect } from 'react';
import { IMaskInput } from 'react-imask';

import styles from './inputCEP.module.css';
import { Spinner } from '../Spinner/Spinner';
import validCheck from '../../assets/icons/validCheck.svg';
import invalidCheck from '../../assets/icons/invalidCheck.svg';

interface EnderecoBrasilAPI {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
}

interface InputCEPProps {
  value: string;
  onChange: (value: string) => void;
  onAddressFound?: (address: EnderecoBrasilAPI) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
}

export function InputCEP({
  value,
  onChange,
  onAddressFound,
  onValidationChange,
  placeholder = '00000-000',
}: InputCEPProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [status, setStatus] = useState<'empty' | 'valid' | 'invalid'>('empty');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const cleanCEP = value ? value.replace(/[^\d]/g, '') : '';

    if (cleanCEP.length === 0) {
      setStatus('empty');
      setErrorMessage('');
      onValidationChange?.(false);
      return;
    }

    if (cleanCEP.length < 8) {
      setStatus('invalid');
      setErrorMessage('CEP incompleto.');
      onValidationChange?.(false);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCEP}`);

        if (!res.ok) {
          setStatus('invalid');
          setErrorMessage('CEP não encontrado.');
          onValidationChange?.(false);
        } else {
          const data: EnderecoBrasilAPI = await res.json();
          setStatus('valid');
          setErrorMessage('');
          onAddressFound?.(data);
          onValidationChange?.(true);
        }
      } catch (err) {
        setStatus('invalid');
        setErrorMessage('Erro ao buscar CEP.');
        onValidationChange?.(false);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value, onAddressFound, onValidationChange]);

  const wrapperClasses = [
    styles.wrapper,
    isFocused && styles.active,
    status === 'valid' && !isLoading && styles.valid,
    status === 'invalid' && !isLoading && styles.invalid,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.container}>
      <div className={wrapperClasses}>
        <IMaskInput
          type="text"
          mask="00000-000"
          value={value || ''}
          onAccept={(maskedValue: string) => onChange(maskedValue)}
          placeholder={placeholder}
          className={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {isLoading ? (
          <span className={styles.iconContainer} aria-label="Buscando CEP...">
            <Spinner className={styles.spinner} />
          </span>
        ) : status === 'valid' ? (
          <span className={`${styles.iconContainer} ${styles.validIcon}`} aria-label="Válido">
            <img src={validCheck.src} />
          </span>
        ) : status === 'invalid' ? (
          <span className={`${styles.iconContainer} ${styles.invalidIcon}`} aria-label="Inválido">
            <img src={invalidCheck.src} />
          </span>
        ) : null}
      </div>

      {status === 'invalid' && errorMessage && (
        <span className={styles.errorLabel}>{errorMessage}</span>
      )}
    </div>
  );
}
