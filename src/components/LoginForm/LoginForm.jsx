import { useCallback, useId, useRef, useState } from 'react';
import { InputCPF } from '../InputCPF/InputCPF';
import InputSenha from '../InputSenha/InputSenha';
import styles from './LoginForm.module.css';

import warningIcon from '../../assets/icons/warning.svg?raw';

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

export default function LoginForm() {
  const id = useId();
  const cpfRef = useRef(null);
  const senhaRef = useRef(null);
  const submitLock = useRef(false);

  const [cpf, setCpf] = useState('');
  const [cpfValido, setCpfValido] = useState(false);
  const [senha, setSenha] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCpfValidationChange = useCallback((isValid) => setCpfValido(isValid), []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitLock.current || isSubmitting) return;
    const senhaError = senha ? '' : 'Digite a sua senha.';
    setErroSenha(senhaError);
    setStatus('');

    if (!cpfValido) return cpfRef.current?.focus();
    if (senhaError) return senhaRef.current?.focus();

    submitLock.current = true;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${BASE}api/auth/login`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, senha }),
      });

      const result = await response.json();
      if (!response.ok) {
        setStatus(
          typeof result?.error === 'string'
            ? result.error
            : 'Não foi possível entrar. Verifique os dados e tente novamente.',
        );
        return;
      }

      window.location.assign(`${BASE}painel`);
    } catch {
      setStatus('Não foi possível conectar ao servidor. Tente novamente.');
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  }

  const senhaErroId = `${id}-senha-erro`;

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-busy={isSubmitting}>
      {/* Mensagem geral do formulário */}
      <div aria-live="polite" aria-atomic="true">
        {status && (
          <p className={`${styles.aviso} ${styles.avisoErro}`} role="alert">
            <icon dangerouslySetInnerHTML={{ __html: warningIcon }}></icon>
            <span>{status}</span>
          </p>
        )}
      </div>

      {/* CPF */}
      <div className={styles.campo}>
        <label htmlFor={`${id}-cpf`} className={styles.label}>
          CPF
        </label>
        <InputCPF
          inputRef={cpfRef}
          id={`${id}-cpf`}
          inputMode="numeric"
          autoComplete="username"
          placeholder="000.000.000-00"
          required
          value={cpf}
          onChange={(value) => {
            setCpf(value);
            setCpfValido(false);
            setStatus('');
          }}
          onValidationChange={handleCpfValidationChange}
          className={styles.input}
        />
      </div>

      {/* Senha */}
      <div className={styles.campo}>
        <label htmlFor={`${id}-senha`} className={styles.label}>
          Senha
        </label>
        <InputSenha
          ref={senhaRef}
          id={`${id}-senha`}
          name="senha"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => {
            setSenha(e.target.value);
            if (erroSenha) setErroSenha('');
            setStatus('');
          }}
          aria-invalid={Boolean(erroSenha)}
          aria-describedby={erroSenha ? senhaErroId : undefined}
          className={`${styles.input} ${erroSenha ? styles.inputErro : ''}`}
        />
        {erroSenha && (
          <p id={senhaErroId} className={styles.erro}>
            <icon dangerouslySetInnerHTML={{ __html: warningIcon }}></icon>
            <span>{erroSenha}</span>
          </p>
        )}
      </div>

      <div className={styles.quickLinks}>
        <a href={`${BASE}recuperar-senha/`} className={styles.esqueci}>
          Esqueceu a senha?
        </a>

        <span className={styles.separador}>ou</span>

        <a href={`${BASE}cadastrar/`} className={styles.cadastrar}>
          Não possui conta?
        </a>
      </div>

      <button type="submit" className={styles.entrar} disabled={isSubmitting}>
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>

      <p className={styles.ajuda}>
        Enfrentando problemas para entrar? Procure a secretaria da sua escola.
      </p>
    </form>
  );
}
