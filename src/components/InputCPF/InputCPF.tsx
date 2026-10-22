import { useState, useEffect } from 'react';
import { IMaskInput } from 'react-imask';
import { actions } from 'astro:actions';
import styles from './InputCPF.module.css';

import { Spinner } from '../Spinner/Spinner';
import validCheck from '../../assets/icons/validCheck.svg';
import invalidCheck from '../../assets/icons/invalidCheck.svg';

interface InputCPFProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
}

export function InputCPF({
  value,
  onChange,
  onValidationChange,
  placeholder = '000.000.000-00',
}: InputCPFProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [status, setStatus] = useState<'empty' | 'valid' | 'invalid'>('empty');
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Efeito de validação e debounce
  useEffect(() => {
    const cleanCPF = value ? value.replace(/[^\d]/g, '') : '';

    if (cleanCPF.length === 0) {
      setStatus('empty');
      setErrorMessage('');
      onValidationChange?.(false);
      return;
    }

    // Debounce, apenas checa cpf no servidor se todos valores estiverem preenchidos
    const timer = setTimeout(async () => {
      if (cleanCPF.length < 11) {
        setStatus('invalid');
        setErrorMessage('CPF incompleto.');
        onValidationChange?.(false);
      } else {
        setIsValidating(true);
        try {
          const { data, error } = await actions.validarCPF({ cpf: value });

          if (error || (data && !data.valido)) {
            setStatus('invalid');
            setErrorMessage(error?.message || data?.message || 'CPF inválido ou já cadastrado.');
            onValidationChange?.(false);
          } else {
            setStatus('valid');
            setErrorMessage('');
            onValidationChange?.(true);
          }
        } catch (err) {
          setStatus('invalid');
          setErrorMessage('Erro ao validar o CPF.');
          onValidationChange?.(false);
        } finally {
          setIsValidating(false);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value, onValidationChange]);

  const wrapperClasses = [
    styles.wrapper,
    isFocused && styles.active,
    status === 'valid' && !isValidating && styles.valid,
    status === 'invalid' && !isValidating && styles.invalid,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.container}>
      <div className={wrapperClasses}>
        <IMaskInput
          type="text"
          mask="000.000.000-00"
          value={value || ''}
          onAccept={(maskedValue: string) => onChange(maskedValue)}
          placeholder={placeholder}
          className={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Spinner de Carregamento ou ícone inline de estado */}
        {isValidating ? (
          <span className={styles.iconContainer} aria-label="Validando...">
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

      {/* Label com descrição do erro */}
      {status === 'invalid' && errorMessage && (
        <span className={styles.errorLabel}>{errorMessage}</span>
      )}
    </div>
  );
}
