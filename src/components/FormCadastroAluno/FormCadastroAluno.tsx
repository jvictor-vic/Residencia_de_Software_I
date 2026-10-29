import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alunoSchema, type AlunoFormData } from './schemaAluno';
import { InputCPF } from '../InputCPF/InputCPF';
import { DateField } from '../DateField/DateField';
import { Combobox } from '../Combobox/Combobox';
import styles from './FormCadastroAluno.module.css';

const listaGeneros = ['Homem Cis', 'Homem Trans', 'Mulher Cis', 'Mulher Trans', 'Não-Binário'];
const listaCorRaca = ['Amarela', 'Branca', 'Indígena', 'Parda', 'Preta'];

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
    formState: { errors, isValid },
  } = useForm<AlunoFormData>({
    resolver: zodResolver(alunoSchema),
    mode: 'onChange',
  });

  // Observações condicionais em tempo real
  const generoSelecionado = watch('genero');
  const generosComNomeSocial = ['Homem Trans', 'Mulher Trans', 'Não-Binário'];
  const exibeNomeSocial = generosComNomeSocial.includes(generoSelecionado);

  const nacionalidadeSelecionada = watch('nacionalidade');
  const isBrasileiro = nacionalidadeSelecionada === 'Brasil';

  // Estados para dados externos (Países, Estados e Municípios)
  const [paises, setPaises] = useState<PaisItem[]>([]);
  const [estados, setEstados] = useState<EstadoItem[]>([]);
  const [municipios, setMunicipios] = useState<MunicipioItem[]>([]);

  // 1. Buscar Países e Bandeiras da API
  useEffect(() => {
    fetch('/api/listapaises')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPaises(data);
        }
      })
      .catch((err) => console.error('Erro ao buscar países:', err));
  }, []);

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

  const onSubmit = (data: AlunoFormData) => {
    console.log('Dados da Etapa 1 válidos:', data);
    // Avançar para a próxima etapa do fluxo
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      {/* 1. Nome Completo */}
      <div className={styles.fieldGroup}>
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
        {errors.nomeCompleto && <span className={styles.error}>{errors.nomeCompleto.message}</span>}
      </div>

      {/* 2. Gênero */}
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="genero">
          Gênero *
        </label>
        <select id="genero" className={styles.select} defaultValue="" {...register('genero')}>
          <option value="" disabled hidden>
            Selecione o gênero
          </option>
          {listaGeneros.map((genero) => (
            <option key={genero} value={genero}>
              {genero}
            </option>
          ))}
        </select>
        {errors.genero && <span className={styles.error}>{errors.genero.message}</span>}
      </div>

      {/* 3. Nome Social (Condicional) */}
      {exibeNomeSocial && (
        <div className={styles.fieldGroup}>
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
          {errors.nomeSocial && <span className={styles.error}>{errors.nomeSocial.message}</span>}
        </div>
      )}

      {/* 4. CPF */}
      <div className={styles.fieldGroup}>
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

      {/* 5. Data de Nascimento */}
      <div className={styles.fieldGroup}>
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

      {/* 6. Cor / Raça */}
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="corRaca">
          Cor / Raça *
        </label>
        <select id="corRaca" className={styles.select} defaultValue="" {...register('corRaca')}>
          <option value="" disabled hidden>
            Selecione a cor/raça
          </option>
          {listaCorRaca.map((cor) => (
            <option key={cor} value={cor}>
              {cor}
            </option>
          ))}
        </select>
        {errors.corRaca && <span className={styles.error}>{errors.corRaca.message}</span>}
      </div>

      {/* 7. Nacionalidade (Combobox com Países e Bandeiras) */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Nacionalidade *</label>
        <Controller
          name="nacionalidade"
          control={control}
          render={({ field }) => (
            <Combobox
              items={paises}
              getItemKey={(pais) => pais.value}
              getItemLabel={(pais) => pais.label}
              getItemIcon={(pais) => pais.icon}
              selectedValue={field.value || ''}
              onSelect={(pais) => field.onChange(pais?.value ?? '')}
              placeholder="Selecione ou digite o país..."
            />
          )}
        />
        {errors.nacionalidade && (
          <span className={styles.error}>{errors.nacionalidade.message}</span>
        )}
      </div>

      {/* 8. Estado e Cidade Natal (Condicional se for Brasil - com Combobox) */}
      {isBrasileiro && (
        <>
          {/* Estado Natal (Combobox) */}
          <div className={styles.fieldGroup}>
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
                  onSelect={(estado) => {
                    field.onChange(estado ? estado.sigla : '');
                    setValue('naturalidade', ''); // Reseta a cidade ao trocar de estado
                  }}
                  placeholder="Selecione ou digite o estado..."
                  getItemKey={(estado) => estado.id}
                  getItemLabel={(estado) => `${estado.nome} (${estado.sigla})`}
                />
              )}
            />
            {errors.estadoNatal && (
              <span className={styles.error}>{errors.estadoNatal.message}</span>
            )}
          </div>

          {/* Cidade Natal (Combobox) */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Cidade Natal *</label>
            <Controller
              name="naturalidade"
              control={control}
              render={({ field }) => (
                <Combobox
                  items={municipios}
                  disabled={!estadoNatalSigla}
                  selectedValue={field.value || ''}
                  onSelect={(municipio) => field.onChange(municipio ? municipio.nome : '')}
                  placeholder={
                    estadoNatalSigla
                      ? 'Selecione ou digite a cidade...'
                      : 'Primeiro selecione o estado'
                  }
                  getItemKey={(municipio) => municipio.id}
                  getItemLabel={(municipio) => municipio.nome}
                />
              )}
            />
            {errors.naturalidade && (
              <span className={styles.error}>{errors.naturalidade.message}</span>
            )}
          </div>
        </>
      )}

      {/* Botão Continuar */}
      <button type="submit" className={styles.button} disabled={!isValid}>
        Continuar
      </button>
    </form>
  );
}
