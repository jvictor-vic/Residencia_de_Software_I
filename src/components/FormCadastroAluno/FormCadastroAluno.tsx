import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alunoSchema, type AlunoFormData } from './schemaAluno';
import { InputCPF } from '../InputCPF/InputCPF';
import { DateField } from '../DateField/DateField';
import { Combobox } from '../Combobox/Combobox';
import { InputEmail } from '../InputEmail/InputEmail';
import { InputTel } from '../InputTel/InputTel';
import { InputCEP } from '../InputCEP/InputCEP';
import { CadastrarSenha } from '../CadastroSenha/CadastrarSenha';
import { calcularIdade } from '@utils/calcularIdade';

import styles from './FormCadastroAluno.module.css';

import listaPaises from '../../data/lista_paises-formatada.json';

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const listaGeneros = ['Homem Cis', 'Homem Trans', 'Mulher Cis', 'Mulher Trans', 'Não-Binário'];
const listaCorRaca = ['Amarela', 'Branca', 'Indígena', 'Parda', 'Preta'];
const listaParentescos = ['Mãe', 'Pai', 'Tio / Tia', 'Avô / Avó', 'Diretor de Abrigo', 'Tutor'];
const listaZonasMoradia = ['Urbana', 'Rural'];

interface PaisItem {
  label: string;
  value: string;
  icon?: string;
}

interface EstadoItem {
  id: number;
  sigla: string;
  nome: string;
}

interface MunicipioItem {
  id: number;
  nome: string;
}

export function FormCadastroAluno() {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<AlunoFormData>({
    resolver: zodResolver(alunoSchema),
    mode: 'onChange',
  });

  // Etapas: aluno, responsável (quando menor), residência, login do aluno e login do responsável.
  const [currentStep, setCurrentStep] = useState(1);

  // Watchers dados do Aluno
  const generoSelecionado = watch('genero');
  const generosComNomeSocial = ['Homem Trans', 'Mulher Trans', 'Não-Binário'];
  const exibeNomeSocial = generosComNomeSocial.includes(generoSelecionado);

  const nacionalidadeSelecionada = watch('nacionalidade');
  const isBrasileiro = nacionalidadeSelecionada === 'Brasil';

  const dataNascimentoAluno = watch('dataNascimento');
  const isMenorIdade = dataNascimentoAluno ? calcularIdade(dataNascimentoAluno) < 18 : false;

  // Watchers dados do responsável
  const respGeneroSelecionado = watch('responsavelGenero');
  const exibeNomeSocialResp = generosComNomeSocial.includes(respGeneroSelecionado || '');
  const cpfAluno = watch('cpf') || '';
  const cpfResponsavel = watch('responsavelCpf') || '';
  const nomeAlunoLogin = watch('nomeSocial')?.trim() || watch('nomeCompleto') || '';
  const nomeResponsavelLogin =
    watch('responsavelNomeSocial')?.trim() || watch('responsavelNomeCompleto') || '';
  const senhaAluno = watch('senhaAluno') || '';
  const confirmarSenhaAluno = watch('confirmarSenhaAluno') || '';
  const senhaResponsavel = watch('senhaResponsavel') || '';
  const confirmarSenhaResponsavel = watch('confirmarSenhaResponsavel') || '';
  const deveCadastrarContaResponsavel = isMenorIdade;
  const [mensagemEnvio, setMensagemEnvio] = useState<{
    tipo: 'erro' | 'sucesso';
    texto: string;
  } | null>(null);
  const [cadastroConcluido, setCadastroConcluido] = useState(false);
  const submitLock = useRef(false);

  // Estados para dados externos (Países, Estados e Municípios)
  const [paises] = useState<PaisItem[]>(listaPaises);
  const [estados, setEstados] = useState<EstadoItem[]>([]);
  const [municipios, setMunicipios] = useState<MunicipioItem[]>([]);

  // 2. Buscar Estados do IBGE quando for Brasil
  useEffect(() => {
    if (isBrasileiro) {
      fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
        .then((res) => res.json())
        .then((data) => setEstados(data))
        .catch((err) => console.error('Erro ao buscar estados:', err));
    } else {
      setEstados([]);
      setMunicipios([]);
      setValue('estadoNatal', '');
      setValue('naturalidade', '');
    }
  }, [nacionalidadeSelecionada, setValue]);

  // 3. Buscar Municípios do IBGE baseado no Estado selecionado
  const estadoNatalSigla = watch('estadoNatal');
  useEffect(() => {
    if (estadoNatalSigla) {
      // Encontra o ID do estado correspondente à sigla
      const estadoObj = estados.find((e) => e.sigla === estadoNatalSigla);
      if (estadoObj) {
        fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoObj.id}/municipios`,
        )
          .then((res) => res.json())
          .then((data) => setMunicipios(data))
          .catch((err) => console.error('Erro ao buscar municípios:', err));
      }
    } else {
      setMunicipios([]);
      setValue('naturalidade', '');
    }
  }, [estadoNatalSigla, estados, setValue]);

  const handleAddressFound = useCallback(
    (address: { state: string; city: string; neighborhood: string; street: string }) => {
      setValue('estadoResidencial', address.state, { shouldValidate: true });
      setValue('municipioResidencial', address.city, { shouldValidate: true });
      setValue('bairroResidencial', address.neighborhood, { shouldValidate: true });
      if (address.street) {
        setValue('logradouro', address.street, { shouldValidate: true });
      }
    },
    [setValue],
  );

  // Validações e Navegação entre Etapas
  const handleNextFromStep1 = async () => {
    const fieldsToValidate: (keyof AlunoFormData)[] = [
      'nomeCompleto',
      'genero',
      'cpf',
      'dataNascimento',
      'corRaca',
      'nacionalidade',
    ];

    if (isBrasileiro) {
      fieldsToValidate.push('estadoNatal', 'nacionalidade');
    }
    if (!isMenorIdade) {
      fieldsToValidate.push('responsavelEmail', 'responsavelTelefone');
    }

    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      if (isMenorIdade) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3); // Maior de idade pula direto para a Etapa 3
      }
    }
  };

  const handleNextFromStep2 = async () => {
    const fieldsToValidate: (keyof AlunoFormData)[] = [
      'responsavelParentesco',
      'responsavelCpf',
      'responsavelNomeCompleto',
      'responsavelGenero',
      'responsavelDataNascimento',
      'responsavelEmail',
      'responsavelTelefone',
    ];

    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 5) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(isMenorIdade ? 2 : 1);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleNextFromStep3 = async () => {
    const camposResidenciais: (keyof AlunoFormData)[] = [
      'zonaMoradia',
      'cep',
      'estadoResidencial',
      'municipioResidencial',
      'bairroResidencial',
      'logradouro',
    ];

    if (await trigger(camposResidenciais)) {
      setCurrentStep(4);
    }
  };

  const handleNextFromStep4 = async () => {
    if (await trigger(['senhaAluno', 'confirmarSenhaAluno'])) {
      setCurrentStep(5);
    }
  };

  const onSubmit = async (data: AlunoFormData) => {
    if (submitLock.current || cadastroConcluido) return;

    const {
      senhaAluno,
      confirmarSenhaAluno,
      senhaResponsavel,
      confirmarSenhaResponsavel,
      responsavelParentesco,
      responsavelCpf,
      responsavelNomeCompleto,
      responsavelGenero,
      responsavelNomeSocial,
      responsavelDataNascimento,
      responsavelEmail,
      responsavelTelefone,
      ...dadosAluno
    } = data;
    const alunoMenor = calcularIdade(data.dataNascimento) < 18;

    submitLock.current = true;
    setMensagemEnvio(null);

    const responseBody = {
      aluno: {
        ...dadosAluno,
        dataNascimento: dataParaAPI(data.dataNascimento),
        ...(alunoMenor
          ? {
              responsavelParentesco,
              responsavelCpf,
              responsavelNomeCompleto,
              responsavelGenero,
              responsavelNomeSocial,
              responsavelDataNascimento: responsavelDataNascimento
                ? dataParaAPI(responsavelDataNascimento)
                : null,
              responsavelEmail,
              responsavelTelefone,
            }
          : { responsavelEmail, responsavelTelefone }),
      },
      senha: senhaAluno,
      ...(alunoMenor ? { senhaResponsavel } : {}),
    };

    try {
      const response = await fetch(`${BASE}api/auth/register`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseBody),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const errorMessage =
          result &&
          typeof result === 'object' &&
          'error' in result &&
          typeof result.error === 'string'
            ? result.error
            : 'Não foi possível concluir o cadastro. Tente novamente.';
        throw new Error(errorMessage);
      }

      setMensagemEnvio({
        tipo: 'sucesso',
        texto: 'Cadastro realizado com sucesso. Você já pode entrar na sua conta.',
      });
      setCadastroConcluido(true);
      setValue('senhaAluno', '');
      setValue('confirmarSenhaAluno', '');
      setValue('senhaResponsavel', '');
      setValue('confirmarSenhaResponsavel', '');
    } catch (error) {
      setMensagemEnvio({
        tipo: 'erro',
        texto:
          error instanceof Error
            ? error.message
            : 'Não foi possível conectar ao servidor. Tente novamente.',
      });
    } finally {
      submitLock.current = false;
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      {mensagemEnvio && (
        <p
          className={`${styles.formMessage} ${
            mensagemEnvio.tipo === 'sucesso' ? styles.formSuccess : styles.formError
          }`}
          role={mensagemEnvio.tipo === 'erro' ? 'alert' : 'status'}
          aria-live={mensagemEnvio.tipo === 'erro' ? 'assertive' : 'polite'}
        >
          {mensagemEnvio.texto}
          {mensagemEnvio.tipo === 'sucesso' && (
            <>
              {' '}
              <a href={`${BASE}entrar`}>Entrar</a>
            </>
          )}
        </p>
      )}
      {/* ──────────────── ETAPA 1: DADOS DO ALUNO ──────────────── */}
      {currentStep === 1 && (
        <div className={`${styles.stepContainer} ${styles.stepAluno}`}>
          <h2 className={styles.sectionTitle}>Cadastro - Dados do Aluno</h2>

          <div className={styles.fieldsWrapper}>
            <div className={`${styles.fieldGroup} ${styles.cpf}`}>
              <label className={styles.label}>CPF *</label>
              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <InputCPF
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="000.000.000-00"
                  />
                )}
              />
              {errors.cpf && <span className={styles.error}>{errors.cpf.message}</span>}
            </div>

            <div className={`${styles.fieldGroup} ${styles.nomeCompleto}`}>
              <label htmlFor="nomeCompleto" className={styles.label}>
                Nome Completo *
              </label>
              <input
                id="nomeCompleto"
                type="text"
                className={styles.input}
                placeholder="Digite o nome completo do aluno"
                {...register('nomeCompleto')}
              />
              {errors.nomeCompleto && (
                <span className={styles.error}>{errors.nomeCompleto.message}</span>
              )}
            </div>

            <div className={`${styles.fieldGroup} ${styles.genero}`}>
              <label className={styles.label} htmlFor="genero">
                Gênero *
              </label>
              <select id="genero" className={styles.select} defaultValue="" {...register('genero')}>
                <option value="" disabled hidden>
                  Selecione o gênero
                </option>
                {listaGeneros.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.genero && <span className={styles.error}>{errors.genero.message}</span>}
            </div>

            {exibeNomeSocial && (
              <div className={`${styles.fieldGroup} ${styles.nomeSocial}`}>
                <label className={styles.label} htmlFor="nomeSocial">
                  Nome Social
                </label>
                <input
                  id="nomeSocial"
                  type="text"
                  className={styles.input}
                  placeholder="Digite o nome social (opcional)"
                  {...register('nomeSocial')}
                />
                {errors.nomeSocial && (
                  <span className={styles.error}>{errors.nomeSocial.message}</span>
                )}
              </div>
            )}

            <div className={`${styles.fieldGroup} ${styles.corRaca}`}>
              <label className={styles.label} htmlFor="corRaca">
                Cor / Raça *
              </label>
              <select
                id="corRaca"
                className={styles.select}
                defaultValue=""
                {...register('corRaca')}
              >
                <option value="" disabled hidden>
                  Selecione a cor/raça
                </option>
                {listaCorRaca.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.corRaca && <span className={styles.error}>{errors.corRaca.message}</span>}
            </div>

            <div className={`${styles.fieldGroup} ${styles.dataDeNascimento}`}>
              <label className={styles.label}>Data de Nascimento *</label>
              <Controller
                name="dataNascimento"
                control={control}
                render={({ field }) => (
                  <DateField
                    value={field.value || null}
                    onChange={field.onChange}
                    placeholder="DD/MM/AAAA"
                  />
                )}
              />
              {errors.dataNascimento && (
                <span className={styles.error}>{errors.dataNascimento.message}</span>
              )}
            </div>

            {dataNascimentoAluno && !isMenorIdade && (
              <>
                <div className={`${styles.fieldGroup} ${styles.email}`}>
                  <label className={styles.label}>E-mail *</label>
                  <Controller
                    name="responsavelEmail"
                    control={control}
                    render={({ field }) => (
                      <InputEmail value={field.value || ''} onChange={field.onChange} />
                    )}
                  />
                  {errors.responsavelEmail && (
                    <span className={styles.error}>{errors.responsavelEmail.message}</span>
                  )}
                </div>

                <div className={`${styles.fieldGroup} ${styles.telefone}`}>
                  <label className={styles.label}>Telefone *</label>
                  <Controller
                    name="responsavelTelefone"
                    control={control}
                    render={({ field }) => (
                      <InputTel value={field.value || ''} onChange={field.onChange} />
                    )}
                  />
                  {errors.responsavelTelefone && (
                    <span className={styles.error}>{errors.responsavelTelefone.message}</span>
                  )}
                </div>
              </>
            )}

            <div className={`${styles.fieldGroup} ${styles.nacionalidade}`}>
              <label className={styles.label}>Nacionalidade *</label>
              <Controller
                name="nacionalidade"
                control={control}
                render={({ field }) => (
                  <Combobox
                    items={paises}
                    selectedValue={field.value || ''}
                    onSelect={(p) => field.onChange(p ? p.value : '')}
                    placeholder="Selecione ou digite o país..."
                    getItemKey={(p) => p.value}
                    getItemLabel={(p) => p.label}
                    getItemIcon={(p) => p.icon}
                  />
                )}
              />
              {errors.nacionalidade && (
                <span className={styles.error}>{errors.nacionalidade.message}</span>
              )}
            </div>

            {isBrasileiro && (
              <>
                <div className={`${styles.fieldGroup} ${styles.estadoNatal}`}>
                  <label className={styles.label}>Estado Natal *</label>
                  <Controller
                    name="estadoNatal"
                    control={control}
                    render={({ field }) => (
                      <Combobox
                        items={estados}
                        selectedValue={
                          estados.find((e) => e.sigla === field.value)?.nome || field.value || ''
                        }
                        onSelect={(e) => {
                          field.onChange(e ? e.sigla : '');
                          setValue('naturalidade', '');
                        }}
                        placeholder="Selecione ou digite o estado..."
                        getItemKey={(e) => e.id}
                        getItemLabel={(e) => `${e.nome} (${e.sigla})`}
                      />
                    )}
                  />
                  {errors.estadoNatal && (
                    <span className={styles.error}>{errors.estadoNatal.message}</span>
                  )}
                </div>

                <div className={`${styles.fieldGroup} ${styles.cidadeNatal}`}>
                  <label className={styles.label}>Cidade Natal *</label>
                  <Controller
                    name="naturalidade"
                    control={control}
                    render={({ field }) => (
                      <Combobox
                        items={municipios}
                        disabled={!estadoNatalSigla}
                        selectedValue={field.value || ''}
                        onSelect={(m) => field.onChange(m ? m.nome : '')}
                        placeholder={
                          estadoNatalSigla
                            ? 'Selecione ou digite a cidade...'
                            : 'Primeiro selecione o estado'
                        }
                        getItemKey={(m) => m.id}
                        getItemLabel={(m) => m.nome}
                      />
                    )}
                  />
                  {errors.naturalidade && (
                    <span className={styles.error}>{errors.naturalidade.message}</span>
                  )}
                </div>
              </>
            )}
          </div>
          {/* Botão de Avançar da Etapa 1 */}
          <div className={styles.buttonGroup}>
            <button type="button" className={styles.button} onClick={handleNextFromStep1}>
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* ──────────────── ETAPA 2: DADOS DO RESPONSÁVEL (Menor de 18 anos) ──────────────── */}
      {currentStep === 2 && isMenorIdade && (
        <div className={`${styles.stepContainer} ${styles.stepResponsavel}`}>
          <h2 className={styles.sectionTitle}>Cadastro - Dados do Responsável</h2>

          <div className={styles.fieldsWrapper}>
            <div className={`${styles.fieldGroup} ${styles.parentesco}`}>
              <label className={styles.label} htmlFor="responsavelParentesco">
                Parentesco *
              </label>
              <select
                id="responsavelParentesco"
                className={styles.select}
                defaultValue=""
                {...register('responsavelParentesco')}
              >
                <option value="" disabled hidden>
                  Selecione o parentesco
                </option>
                {listaParentescos.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.dataDeNascimento}`}>
              <label className={styles.label}>Data de Nascimento *</label>
              <Controller
                name="responsavelDataNascimento"
                control={control}
                render={({ field }) => (
                  <DateField
                    value={field.value || null}
                    onChange={field.onChange}
                    placeholder="DD/MM/AAAA"
                  />
                )}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.cpfDoResponsavel}`}>
              <label className={styles.label}>CPF do Responsável *</label>
              <Controller
                name="responsavelCpf"
                control={control}
                render={({ field }) => (
                  <InputCPF
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="000.000.000-00"
                  />
                )}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.nomeCompletoDoResponsavel}`}>
              <label htmlFor="responsavelNomeCompleto" className={styles.label}>
                Nome Completo do Responsável *
              </label>
              <input
                id="responsavelNomeCompleto"
                type="text"
                className={styles.input}
                placeholder="Digite o nome completo"
                {...register('responsavelNomeCompleto')}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.genero}`}>
              <label className={styles.label} htmlFor="responsavelGenero">
                Gênero *
              </label>
              <select
                id="responsavelGenero"
                className={styles.select}
                defaultValue=""
                {...register('responsavelGenero')}
              >
                <option value="" disabled hidden>
                  Selecione o gênero
                </option>
                {listaGeneros.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {exibeNomeSocialResp && (
              <div className={`${styles.fieldGroup} ${styles.nomeSocial}`}>
                <label className={styles.label} htmlFor="responsavelNomeSocial">
                  Nome Social
                </label>
                <input
                  id="responsavelNomeSocial"
                  type="text"
                  className={styles.input}
                  placeholder="Digite o nome social (opcional)"
                  {...register('responsavelNomeSocial')}
                />
              </div>
            )}

            <div className={`${styles.fieldGroup} ${styles.telefone}`}>
              <label className={styles.label}>Telefone *</label>
              <Controller
                name="responsavelTelefone"
                control={control}
                render={({ field }) => (
                  <InputTel
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="(00) 00000-0000"
                  />
                )}
              />
            </div>

            <div className={`${styles.fieldGroup} ${styles.email}`}>
              <label className={styles.label}>E-mail *</label>
              <Controller
                name="responsavelEmail"
                control={control}
                render={({ field }) => (
                  <InputEmail
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="email@exemplo.com"
                  />
                )}
              />
            </div>
          </div>
          {/* Botões de Voltar e Concluir da Etapa 2 */}
          <div className={styles.buttonGroup}>
            <button type="button" className={styles.secondaryButton} onClick={handlePrevStep}>
              Voltar
            </button>
            <button type="button" className={styles.button} onClick={handleNextFromStep2}>
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* ──────────────── ETAPA 3: DADOS RESIDENCIAIS ──────────────── */}
      {currentStep === 3 && (
        <div className={`${styles.stepContainer} ${styles.stepResidencia}`}>
          <h2 className={styles.sectionTitle}>Cadastro - Dados Residenciais</h2>

          <div className={styles.fieldsWrapper}>
            <div className={`${styles.fieldGroup} ${styles.zonaDeMoradia}`}>
              <label className={styles.label} htmlFor="zonaMoradia">
                Zona de Moradia *
              </label>
              <select
                id="zonaMoradia"
                className={styles.select}
                defaultValue=""
                {...register('zonaMoradia')}
              >
                <option value="" disabled hidden>
                  Selecione a zona
                </option>
                {listaZonasMoradia.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
              {errors.zonaMoradia && (
                <span className={styles.error}>{errors.zonaMoradia.message}</span>
              )}
            </div>

            <div className={`${styles.fieldGroup} ${styles.cep}`}>
              <label className={styles.label}>CEP *</label>
              <Controller
                name="cep"
                control={control}
                render={({ field }) => (
                  <InputCEP
                    value={field.value || ''}
                    onChange={field.onChange}
                    onAddressFound={handleAddressFound}
                    placeholder="00000-000"
                  />
                )}
              />
              {errors.cep && <span className={styles.error}>{errors.cep.message}</span>}
            </div>

            <div className={`${styles.fieldGroup} ${styles.estado}`}>
              <label htmlFor="estadoResidencial" className={styles.label}>
                Estado *
              </label>
              <input
                id="estadoResidencial"
                type="text"
                className={styles.input}
                readOnly
                placeholder="Preenchido via CEP"
                {...register('estadoResidencial')}
              />
              {errors.estadoResidencial && (
                <span className={styles.error}>{errors.estadoResidencial.message}</span>
              )}
            </div>

            <div className={`${styles.fieldGroup} ${styles.municipio}`}>
              <label htmlFor="municipioResidencial" className={styles.label}>
                Município *
              </label>
              <input
                id="municipioResidencial"
                type="text"
                className={styles.input}
                readOnly
                placeholder="Preenchido via CEP"
                {...register('municipioResidencial')}
              />
              {errors.municipioResidencial && (
                <span className={styles.error}>{errors.municipioResidencial.message}</span>
              )}
            </div>

            <div className={`${styles.fieldGroup} ${styles.bairro}`}>
              <label htmlFor="bairroResidencial" className={styles.label}>
                Bairro *
              </label>
              <input
                id="bairroResidencial"
                type="text"
                className={styles.input}
                placeholder="Preenchido via CEP"
                {...register('bairroResidencial')}
              />
              {errors.bairroResidencial && (
                <span className={styles.error}>{errors.bairroResidencial.message}</span>
              )}
            </div>

            <div className={`${styles.fieldGroup} ${styles.logradouro}`}>
              <label htmlFor="logradouro" className={styles.label}>
                Logradouro *
              </label>
              <input
                id="logradouro"
                type="text"
                className={styles.input}
                placeholder="Rua, Avenida, Alameda..."
                {...register('logradouro')}
              />
              {errors.logradouro && (
                <span className={styles.error}>{errors.logradouro.message}</span>
              )}
            </div>

            <div className={`${styles.fieldGroup} ${styles.numero}`}>
              <label htmlFor="numero" className={styles.label}>
                Número (Opcional)
              </label>
              <input
                id="numero"
                type="text"
                className={styles.input}
                placeholder="Ex: 123"
                {...register('numero')}
              />
              {errors.numero && <span className={styles.error}>{errors.numero.message}</span>}
            </div>

            <div className={`${styles.fieldGroup} ${styles.complemento}`}>
              <label htmlFor="complemento" className={styles.label}>
                Complemento (Opcional)
              </label>
              <input
                id="complemento"
                type="text"
                className={styles.input}
                placeholder="Apto, Bloco, Casa..."
                {...register('complemento')}
              />
              {errors.complemento && (
                <span className={styles.error}>{errors.complemento.message}</span>
              )}
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <button type="button" className={styles.secondaryButton} onClick={handlePrevStep}>
              Voltar
            </button>
            <button type="button" className={styles.button} onClick={handleNextFromStep3}>
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* ──────────────── ETAPA 4: DADOS LOGIN - ALUNO ──────────────── */}
      {currentStep === 4 && (
        <div className={`${styles.stepContainer} ${styles.stepLogin}`}>
          <h2 className={styles.sectionTitle}>Dados Login - Aluno</h2>

          <div className={styles.fieldsWrapper}>
            <section className={styles.loginIdentity} aria-label="Identificação da conta do aluno">
              <div className={styles.loginIdentityField}>
                <label className={styles.loginIdentityLabel} htmlFor="login-aluno-cpf">
                  CPF
                </label>
                <input
                  id="login-aluno-cpf"
                  type="text"
                  className={styles.loginIdentityInput}
                  value={cpfAluno}
                  readOnly
                />
              </div>
              <div className={styles.loginIdentityField}>
                <label className={styles.loginIdentityLabel} htmlFor="login-aluno-nome">
                  Nome
                </label>
                <input
                  id="login-aluno-nome"
                  type="text"
                  className={styles.loginIdentityInput}
                  value={nomeAlunoLogin}
                  readOnly
                />
              </div>
              {isMenorIdade ? (
                <p className={styles.passwordNotice}>
                  O aluno deve estar presente e definir a própria senha. Ela não será criada em nome
                  dele.
                </p>
              ) : (
                <p className={styles.passwordNotice}>
                  Esta conta terá os papéis de aluno e responsável. A mesma senha será usada para os
                  dois acessos.
                </p>
              )}
            </section>

            <CadastrarSenha
              senha={register('senhaAluno')}
              confirmarSenha={register('confirmarSenhaAluno')}
              valorSenha={senhaAluno}
              valorConfirmacao={confirmarSenhaAluno}
              erroSenha={errors.senhaAluno?.message}
              erroConfirmarSenha={errors.confirmarSenhaAluno?.message}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="button" className={styles.secondaryButton} onClick={handlePrevStep}>
              Voltar
            </button>
            {deveCadastrarContaResponsavel ? (
              <button type="button" className={styles.button} onClick={handleNextFromStep4}>
                Continuar
              </button>
            ) : (
              <button
                type="submit"
                className={styles.button}
                disabled={isSubmitting || cadastroConcluido}
              >
                {isSubmitting
                  ? 'Enviando...'
                  : cadastroConcluido
                    ? 'Cadastro concluído'
                    : 'Cadastrar'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ──────────────── ETAPA 5: DADOS LOGIN - RESPONSÁVEL ──────────────── */}
      {currentStep === 5 && deveCadastrarContaResponsavel && (
        <div className={`${styles.stepContainer} ${styles.stepLogin}`}>
          <h2 className={styles.sectionTitle}>Dados Login - Responsável</h2>

          <div className={styles.fieldsWrapper}>
            <section
              className={styles.loginIdentity}
              aria-label="Identificação da conta do responsável"
            >
              <div className={styles.loginIdentityField}>
                <label className={styles.loginIdentityLabel} htmlFor="login-responsavel-cpf">
                  CPF
                </label>
                <input
                  id="login-responsavel-cpf"
                  type="text"
                  className={styles.loginIdentityInput}
                  value={cpfResponsavel}
                  readOnly
                />
              </div>
              <div className={styles.loginIdentityField}>
                <label className={styles.loginIdentityLabel} htmlFor="login-responsavel-nome">
                  Nome para acesso
                </label>
                <input
                  id="login-responsavel-nome"
                  type="text"
                  className={styles.loginIdentityInput}
                  value={nomeResponsavelLogin}
                  readOnly
                />
              </div>
            </section>

            <p className={styles.passwordNotice}>
              O responsável deve estar presente e definir a própria senha. Ela não será criada em
              nome dele.
            </p>

            <CadastrarSenha
              senha={register('senhaResponsavel')}
              confirmarSenha={register('confirmarSenhaResponsavel')}
              valorSenha={senhaResponsavel}
              valorConfirmacao={confirmarSenhaResponsavel}
              erroSenha={errors.senhaResponsavel?.message}
              erroConfirmarSenha={errors.confirmarSenhaResponsavel?.message}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="button" className={styles.secondaryButton} onClick={handlePrevStep}>
              Voltar
            </button>
            <button
              type="submit"
              className={styles.button}
              disabled={isSubmitting || cadastroConcluido}
            >
              {isSubmitting
                ? 'Enviando...'
                : cadastroConcluido
                  ? 'Cadastro concluído'
                  : 'Cadastrar'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

function dataParaAPI(data: Date): string {
  const ano = String(data.getFullYear()).padStart(4, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
