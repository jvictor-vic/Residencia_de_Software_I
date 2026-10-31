import { useState, useMemo, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';

import styles from './Combobox.module.css';

interface ComboboxProps<T> {
  placeholder: string;
  items: T[];
  getItemKey: (item: T) => string | number;
  getItemLabel: (item: T) => string;
  getItemIcon?: (item: T) => string | undefined;
  selectedValue: string;
  onSelect: (item: T | null) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function Combobox<T>({
  placeholder,
  items,
  getItemKey,
  getItemLabel,
  getItemIcon,
  selectedValue,
  onSelect,
  disabled = false,
  loading = false,
}: ComboboxProps<T>) {
  const [query, setQuery] = useState(selectedValue);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sincroniza o input caso o valor mude externamente
  useEffect(() => {
    setQuery(selectedValue);
  }, [selectedValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // usar memoização para filtrar os items com base na query digitada
  const filteredItems = useMemo(() => {
    if (!query || query === selectedValue) return items;

    const normalize = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const normalizedQuery = normalize(query);

    return items.filter((item) => normalize(getItemLabel(item)).includes(normalizedQuery));
  }, [query, items, selectedValue, getItemLabel]);

  // Reseta o índice destacado quando a lista filtrada mudar
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [query]);

  // Navegação por Teclado
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
        const selected = filteredItems[highlightedIndex];
        setQuery(getItemLabel(selected));
        onSelect(selected);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={query}
          disabled={disabled || loading}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (e.target.value === '') {
              onSelect(null);
            }
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
        {loading && <span className={styles.loader}>Carregando...</span>}
      </div>

      {isOpen && (
        <ul className={styles.dropdown} ref={listRef}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const isHighlighted = index === highlightedIndex;
              const icon = getItemIcon ? getItemIcon(item) : undefined;

              return (
                <li
                  key={getItemKey(item)}
                  className={`${styles.option} ${isHighlighted ? styles.highlighted : ''}`}
                  onClick={() => {
                    setQuery(getItemLabel(item));
                    onSelect(item);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {icon && <span className={styles.optionIcon}>{icon}</span>}
                  <span>{getItemLabel(item)}</span>
                </li>
              );
            })
          ) : (
            <li className={styles.noResults}>Nenhum resultado encontrado</li>
          )}
        </ul>
      )}
    </div>
  );
}
