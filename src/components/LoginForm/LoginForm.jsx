import { useId, useRef, useState } from 'react';
import { InputCPF } from '../InputCPF/InputCPF.jsx';
import { entrar } from '../../services/auth.js';
import styles from './LoginForm.module.css';

/**
 * Formulário de login com CPF e senha (ilha React).
 * O envio chama `entrar` em src/services/auth.js — hoje simulado;
 * é lá que a equipe liga a API real quando ela existir.
 */

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

function IconeAlerta() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d="M12 2 1 21h22L12 2Zm1 15h-2v-2h2v2Zm0-4h-2V9h2v4Z" />
    </svg>
  );
}

function IconeOk() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-2 15-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8l-9 9Z"
      />
    </svg>
  );
}

function IconeOlhoAberto() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 5C6.5 5 2.7 9.3 1.5 12c1.2 2.7 5 7 10.5 7s9.3-4.3 10.5-7C21.3 9.3 17.5 5 12 5Zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm0-7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"
      />
    </svg>
  );
}

function IconeOlhoFechado() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3.3 2 2 3.3l3.1 3.1C3.4 7.8 2.2 9.8 1.5 12c1.2 2.7 5 7 10.5 7 1.9 0 3.6-.5 5-1.3l3.7 3.7 1.3-1.3L3.3 2Zm8.7 14.5A4.5 4.5 0 0 1 7.5 12c0-.8.2-1.5.6-2.1l1.5 1.5a2.5 2.5 0 0 0 3 3l1.5 1.5c-.6.4-1.3.6-2.1.6ZM12 5c-1.3 0-2.6.2-3.7.7l2.1 2.1A4.5 4.5 0 0 1 16.2 13.6l3 3c1.5-1.3 2.6-3 3.3-4.6C21.3 9.3 17.5 5 12 5Z"
      />
    </svg>
  );
}

export default function LoginForm() {
  const id = useId();
  const cpfRef = useRef(null);
  const senhaRef = useRef(null);

  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erros, setErros] = useState({});
  const [status, setStatus] = useState({ tipo: '', mensagem: '' });
  const [enviando, setEnviando] = useState(false);

  function validarCpf(valor) {
    if (!apenasDigitos(valor)) return 'Digite o seu CPF.';
    if (apenasDigitos(valor).length < 11) return 'O CPF precisa ter 11 números.';
    if (!cpfValido(valor)) return 'Este CPF não é válido. Confira os números.';
    return '';
  }

  function validarSenha(valor) {
    if (!valor) return 'Digite a sua senha.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const novosErros = { cpf: validarCpf(cpf), senha: validarSenha(senha) };
    setErros(novosErros);
    setStatus({ tipo: '', mensagem: '' });

    // Leva o foco ao primeiro campo com erro
    if (novosErros.cpf) return cpfRef.current?.focus();
    if (novosErros.senha) return senhaRef.current?.focus();

    setEnviando(true);
    try {
      await entrar({ cpf: apenasDigitos(cpf), senha });
      setStatus({ tipo: 'sucesso', mensagem: 'Login feito! Entrando...' });
      // TODO: redirecionar para a página inicial do perfil, ex.:
      // window.location.href = `${BASE}horarios/`;
    } catch (err) {
      setStatus({
        tipo: 'erro',
        mensagem: err?.message || 'CPF ou senha incorretos. Tente novamente.',
      });
    } finally {
      setEnviando(false);
    }
  }

  const cpfErroId = `${id}-cpf-erro`;
  const senhaErroId = `${id}-senha-erro`;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* Mensagem geral (sucesso ou falha no login) */}
      <div aria-live="polite" aria-atomic="true">
        {status.mensagem && (
          <p
            className={`${styles.aviso} ${
              status.tipo === 'erro' ? styles.avisoErro : styles.avisoSucesso
            }`}
            role={status.tipo === 'erro' ? 'alert' : 'status'}
          >
            {status.tipo === 'erro' ? <IconeAlerta /> : <IconeOk />}
            <span>{status.mensagem}</span>
          </p>
        )}
      </div>

      {/* CPF */}
      <div className={styles.campo}>
        <label htmlFor={`${id}-cpf`} className={styles.label}>
          CPF
        </label>
        <InputCPF
          ref={cpfRef}
          id={`${id}-cpf`}
          name="cpf"
          type="text"
          inputMode="numeric"
          autoComplete="username"
          placeholder="000.000.000-00"
          maxLength={14}
          value={cpf}
          onChange={(e) => {
            setCpf(formatarCpf(e.target.value));
            if (erros.cpf) setErros((p) => ({ ...p, cpf: '' }));
          }}
          onBlur={() => cpf && setErros((p) => ({ ...p, cpf: validarCpf(cpf) }))}
          aria-invalid={Boolean(erros.cpf)}
          aria-describedby={erros.cpf ? cpfErroId : undefined}
          className={`${styles.input} ${erros.cpf ? styles.inputErro : ''}`}
        />
        {erros.cpf && (
          <p id={cpfErroId} className={styles.erro}>
            <IconeAlerta />
            <span>{erros.cpf}</span>
          </p>
        )}
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
              if (erros.senha) setErros((p) => ({ ...p, senha: '' }));
            }}
            aria-invalid={Boolean(erros.senha)}
            aria-describedby={erros.senha ? senhaErroId : undefined}
            className={`${styles.input} ${styles.inputSenha} ${
              erros.senha ? styles.inputErro : ''
            }`}
          />
          <button
            type="button"
            className={styles.olho}
            onClick={() => setMostrarSenha((v) => !v)}
            aria-pressed={mostrarSenha}
            aria-label={mostrarSenha ? 'Esconder senha' : 'Mostrar senha'}
            aria-controls={`${id}-senha`}
          >
            {mostrarSenha ? <IconeOlhoFechado /> : <IconeOlhoAberto />}
          </button>
        </div>
        {erros.senha && (
          <p id={senhaErroId} className={styles.erro}>
            <IconeAlerta />
            <span>{erros.senha}</span>
          </p>
        )}
      </div>

      <a href={`${BASE}recuperar-senha/`} className={styles.esqueci}>
        Esqueci minha senha
      </a>

      <button type="submit" className={styles.entrar} disabled={enviando} aria-busy={enviando}>
        {enviando ? 'Entrando...' : 'Entrar'}
      </button>

      <p className={styles.ajuda}>
        Primeiro acesso ou problemas para entrar? Procure a secretaria da sua escola.
      </p>
    </form>
  );
}
