import { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { InputSenhaValidation } from '../InputSenha/InputSenha';
import styles from './CadastrarSenha.module.css';

interface CadastrarSenhaProps {
  senha: UseFormRegisterReturn;
  confirmarSenha: UseFormRegisterReturn;
  valorSenha: string;
  valorConfirmacao: string;
  erroSenha?: string;
  erroConfirmarSenha?: string;
}

interface RequisitosSenha {
  minimo: boolean;
  maiuscula: boolean;
  minuscula: boolean;
  numero: boolean;
  especial: boolean;
}

export function CadastrarSenha({
  senha,
  confirmarSenha,
  valorSenha,
  valorConfirmacao,
  erroSenha,
  erroConfirmarSenha,
}: CadastrarSenhaProps) {
  const id = useId();
  const [capsLockAtivo, setCapsLockAtivo] = useState<'senha' | 'confirmar' | null>(null);

  const requisitos: RequisitosSenha = {
    minimo: valorSenha.length >= 6,
    maiuscula: /\p{Lu}/u.test(valorSenha),
    minuscula: /\p{Ll}/u.test(valorSenha),
    numero: /\p{N}/u.test(valorSenha),
    especial: /[^\p{L}\p{N}\s]/u.test(valorSenha),
  };
  const senhaValida = Object.values(requisitos).every(Boolean) && valorSenha.length <= 16;
  const statusSenha = valorSenha.length === 0 ? 'empty' : senhaValida ? 'valid' : 'invalid';
  const statusConfirmacao =
    valorConfirmacao.length === 0
      ? 'empty'
      : valorConfirmacao === valorSenha && senhaValida
        ? 'valid'
        : 'invalid';

  const atualizarCapsLock =
    (campo: 'senha' | 'confirmar') => (event: KeyboardEvent<HTMLInputElement>) => {
      setCapsLockAtivo(event.getModifierState('CapsLock') ? campo : null);
    };

  const itensRequisitos: Array<{ id: keyof RequisitosSenha; texto: string }> = [
    { id: 'minimo', texto: 'Mínimo de 6 caracteres' },
    { id: 'maiuscula', texto: 'Pelo menos 1 letra maiúscula' },
    { id: 'minuscula', texto: 'Pelo menos 1 letra minúscula' },
    { id: 'numero', texto: 'Pelo menos 1 número' },
    { id: 'especial', texto: 'Pelo menos 1 caractere especial' },
  ];

  return (
    <>
      <div className={styles.field}>
        <label htmlFor={`${id}-senha`} className={styles.label}>
          Senha *
        </label>
        <InputSenhaValidation
          {...senha}
          id={`${id}-senha`}
          type="password"
          autoComplete="new-password"
          minLength={6}
          maxLength={16}
          required
          status={statusSenha}
          errorMessage={erroSenha}
          errorMessageId={`${id}-senha-erro`}
          aria-invalid={Boolean(erroSenha) || (valorSenha.length > 0 && !senhaValida)}
          aria-describedby={`${id}-requisitos${erroSenha ? ` ${id}-senha-erro` : ''}${capsLockAtivo === 'senha' ? ` ${id}-capslock-senha` : ''}`}
          onKeyDown={atualizarCapsLock('senha')}
          onKeyUp={atualizarCapsLock('senha')}
          onBlur={(event) => {
            senha.onBlur(event);
            setCapsLockAtivo(null);
          }}
        />
        <ul
          id={`${id}-requisitos`}
          className={styles.requirements}
          aria-label="Requisitos da senha"
        >
          {itensRequisitos.map(({ id: requisitoId, texto }) => (
            <li
              key={requisitoId}
              className={requisitos[requisitoId] ? styles.requirementMet : undefined}
            >
              <span className={styles.requirementMarker} aria-hidden="true">
                {requisitos[requisitoId] ? '✓' : '○'}
              </span>
              {texto}
              <span className={styles.screenReaderOnly}>
                {requisitos[requisitoId] ? ' — atendido' : ' — pendente'}
              </span>
            </li>
          ))}
        </ul>
        {valorSenha.length > 16 && (
          <span className={styles.error} role="alert">
            A senha deve ter no máximo 16 caracteres.
          </span>
        )}
        {capsLockAtivo === 'senha' && (
          <span id={`${id}-capslock-senha`} className={styles.warning} role="status">
            Caps Lock está ativado.
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-confirmar-senha`} className={styles.label}>
          Confirmar senha *
        </label>
        <InputSenhaValidation
          {...confirmarSenha}
          id={`${id}-confirmar-senha`}
          type="password"
          autoComplete="new-password"
          minLength={6}
          maxLength={16}
          required
          status={statusConfirmacao}
          errorMessage={erroConfirmarSenha}
          errorMessageId={`${id}-confirmar-erro`}
          aria-invalid={Boolean(erroConfirmarSenha) || statusConfirmacao === 'invalid'}
          aria-describedby={
            `${erroConfirmarSenha ? `${id}-confirmar-erro` : ''}${capsLockAtivo === 'confirmar' ? `${erroConfirmarSenha ? ' ' : ''}${id}-capslock-confirmar` : ''}` ||
            undefined
          }
          onKeyDown={atualizarCapsLock('confirmar')}
          onKeyUp={atualizarCapsLock('confirmar')}
          onBlur={(event) => {
            confirmarSenha.onBlur(event);
            setCapsLockAtivo(null);
          }}
        />
        {capsLockAtivo === 'confirmar' && (
          <span id={`${id}-capslock-confirmar`} className={styles.warning} role="status">
            Caps Lock está ativado.
          </span>
        )}
      </div>
    </>
  );
}
