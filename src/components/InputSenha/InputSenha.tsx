import { forwardRef, useState } from 'react';
import type { FocusEvent, ForwardedRef, InputHTMLAttributes } from 'react';
import validCheck from '../../assets/icons/validCheck.svg';
import invalidCheck from '../../assets/icons/invalidCheck.svg';
import passwordHide from '../../assets/icons/password-hide.svg?raw';
import passwordShow from '../../assets/icons/password-show.svg?raw';
import styles from './InputSenha.module.css';

type InputStatus = 'empty' | 'valid' | 'invalid';

interface InputSenhaProps extends InputHTMLAttributes<HTMLInputElement> {
  status?: InputStatus;
  errorMessage?: string;
  errorMessageId?: string;
}

function InputSenhaBase(
  {
    status,
    errorMessage,
    errorMessageId,
    className,
    onFocus,
    onBlur,
    ...inputProps
  }: InputSenhaProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [focado, setFocado] = useState(false);

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setFocado(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setFocado(false);
    onBlur?.(event);
  };

  const wrapperClassName = [
    styles.wrapper,
    focado && styles.active,
    status === 'valid' && styles.valid,
    status === 'invalid' && styles.invalid,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.container}>
      <div className={wrapperClassName}>
        <input
          {...inputProps}
          ref={ref}
          type={mostrarSenha ? 'text' : 'password'}
          className={`${styles.input} ${className || ''}`}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {status === 'valid' && (
          <span className={`${styles.statusIcon} ${styles.validIcon}`} aria-label="Válido">
            <img src={validCheck.src} alt="" />
          </span>
        )}
        {status === 'invalid' && (
          <span className={`${styles.statusIcon} ${styles.invalidIcon}`} aria-label="Inválido">
            <img src={invalidCheck.src} alt="" />
          </span>
        )}
        <button
          type="button"
          className={styles.visibilityToggle}
          onClick={() => setMostrarSenha((visivel) => !visivel)}
          aria-pressed={mostrarSenha}
          aria-label={mostrarSenha ? 'Esconder senha' : 'Mostrar senha'}
          aria-controls={inputProps.id}
        >
          <span
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: mostrarSenha ? passwordHide : passwordShow }}
          />
        </button>
      </div>
      {status === 'invalid' && errorMessage && (
        <span id={errorMessageId} className={styles.errorMessage} role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  );
}

const InputSenha = forwardRef<HTMLInputElement, InputSenhaProps>((props, ref) =>
  InputSenhaBase(props, ref),
);
InputSenha.displayName = 'InputSenha';

export const InputSenhaValidation = forwardRef<HTMLInputElement, InputSenhaProps>((props, ref) =>
  InputSenhaBase(props, ref),
);
InputSenhaValidation.displayName = 'InputSenhaValidation';

export default InputSenha;
