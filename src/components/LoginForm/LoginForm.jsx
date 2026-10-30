import { useCallback, useId, useRef, useState } from 'react';
import { InputCPF } from '../InputCPF/InputCPF';
import styles from './LoginForm.module.css';

import passwordShow from '../../assets/icons/password-show.svg?raw';
import passwordHide from '../../assets/icons/password-hide.svg?raw';
import warningIcon from '../../assets/icons/warning.svg?raw';

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

export default function LoginForm() {
  const id = useId();
  const cpfRef = useRef(null);
  const senhaRef = useRef(null);

  const [cpf, setCpf] = useState('');
  const [cpfValido, setCpfValido] = useState(false);
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState('');
  const [status, setStatus] = useState('');

  const handleCpfValidationChange = useCallback((isValid) => setCpfValido(isValid), []);

  function handleSubmit(e) {
    e.preventDefault();
    const senhaError = senha ? '' : 'Digite a sua senha.';
    setErroSenha(senhaError);
    setStatus('');

    if (!cpfValido) return cpfRef.current?.focus();
    if (senhaError) return senhaRef.current?.focus();

    setStatus('A autenticação ainda não está configurada no sistema.');
  }

  const senhaErroId = `${id}-senha-erro`;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
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
        <div className={styles.senhaWrap}>
          <input
            ref={senhaRef}
            id={`${id}-senha`}
            name="senha"
            type={mostrarSenha ? 'text' : 'password'}
            autoComplete="current-password"
            value={senha}
            onChange={(e) => {
              setSenha(e.target.value);
              if (erroSenha) setErroSenha('');
              setStatus('');
            }}
            aria-invalid={Boolean(erroSenha)}
            aria-describedby={erroSenha ? senhaErroId : undefined}
            className={`${styles.input} ${styles.inputSenha} ${erroSenha ? styles.inputErro : ''}`}
          />
          <button
            type="button"
            className={styles.olho}
            onClick={() => setMostrarSenha((v) => !v)}
            aria-pressed={mostrarSenha}
            aria-label={mostrarSenha ? 'Esconder senha' : 'Mostrar senha'}
            aria-controls={`${id}-senha`}
            dangerouslySetInnerHTML={
              mostrarSenha ? { __html: passwordHide } : { __html: passwordShow }
            }
          ></button>
        </div>
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

      <button type="submit" className={styles.entrar}>
        Entrar
      </button>

      <p className={styles.ajuda}>
        Enfrentando problemas para entrar? Procure a secretaria da sua escola.
      </p>
    </form>
  );
}
