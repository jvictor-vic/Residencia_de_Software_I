import React, { useEffect, useMemo, useState } from 'react';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  value?: Date | null;
  minDate: Date;
  maxDate: Date;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Augosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];
const WEEKDAY_LABELS_SUN = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

function isSameDay(a?: Date, b?: Date): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function buildMonthGrid(month: Date): Date[] {
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

export function DatePicker({
  value,
  minDate,
  maxDate,
  containerRef,
  onSelect,
  onClose,
}: DatePickerProps) {
  const [displayedMonth, setDisplayedMonth] = useState<Date>(() => startOfDay(value || new Date()));
  const [navView, setNavView] = useState<'days' | 'months' | 'years'>('days');
  const [yearAnchor, setYearAnchor] = useState<number>(() => (value || new Date()).getFullYear());
  const today = useMemo(() => startOfDay(new Date()), []);
  const weeks = useMemo(() => {
    const grid = buildMonthGrid(displayedMonth);
    const rows: Date[][] = [];
    for (let index = 0; index < grid.length; index += 7) {
      rows.push(grid.slice(index, index + 7));
    }
    return rows;
  }, [displayedMonth]);

  useEffect(() => {
    if (value) {
      setDisplayedMonth(startOfDay(value));
      setYearAnchor(value.getFullYear());
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [containerRef, onClose]);

  const selectDay = (date: Date) => {
    onSelect(date);
  };

  return (
    <div className={styles.calendarPopoverCard}>
      {navView === 'days' && (
        <div className={styles.calendarHeader}>
          <button
            type="button"
            onClick={() => setDisplayedMonth((month) => addMonths(month, -1))}
            className={styles.navButton}
            aria-label="Mês Anterior"
          >
            &lsaquo;
          </button>

          <div className={styles.headerTitleGroup}>
            <button
              type="button"
              onClick={() => setNavView('months')}
              className={styles.titleButton}
              aria-label="Escolher Mês"
            >
              {MONTH_NAMES[displayedMonth.getMonth()]}
            </button>
            <span className={styles.titleDivider}>|</span>
            <button
              type="button"
              onClick={() => {
                setYearAnchor(displayedMonth.getFullYear());
                setNavView('years');
              }}
              className={styles.titleButton}
              aria-label="Escolher Ano"
            >
              {displayedMonth.getFullYear()}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setDisplayedMonth((month) => addMonths(month, 1))}
            className={styles.navButton}
            aria-label="Próximo mês"
          >
            &rsaquo;
          </button>
        </div>
      )}

      {navView === 'days' && (
        <div>
          <div className={styles.weekdaysGrid}>
            {WEEKDAY_LABELS_SUN.map((label, index) => (
              <div key={`${label}-${index}`} className={styles.weekdayCell}>
                {label}
              </div>
            ))}
          </div>

          <div className={styles.daysGridContainer}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className={styles.weekRow}>
                {week.map((date) => {
                  const outsideMonth = !isSameMonth(date, displayedMonth);
                  const isToday = isSameDay(date, today);
                  const isSelected = value ? isSameDay(value, date) : false;
                  const isDayDisabled = date > maxDate || date < minDate;

                  return (
                    <div key={date.toISOString()} className={styles.dayCellWrapper}>
                      <button
                        type="button"
                        disabled={isDayDisabled}
                        onClick={() => selectDay(date)}
                        className={[
                          styles.dayButton,
                          outsideMonth ? styles.outsideMonth : '',
                          isSelected ? styles.selectedDay : '',
                          isToday && !isSelected ? styles.todayButton : '',
                          isDayDisabled ? styles.disabledDay : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {date.getDate()}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {navView === 'months' && (
        <div>
          <div className={styles.pickerHeader}>
            <span className={styles.pickerTitle}>Selecione o mês</span>
            <button type="button" className={styles.backButton} onClick={() => setNavView('days')}>
              Voltar
            </button>
          </div>
          <div className={styles.monthsGrid}>
            {MONTH_NAMES.map((name, index) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setDisplayedMonth(new Date(displayedMonth.getFullYear(), index, 1));
                  setNavView('days');
                }}
                className={[
                  styles.pickerItem,
                  index === displayedMonth.getMonth() ? styles.pickerItemActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {name.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}

      {navView === 'years' && (
        <div>
          <div className={styles.pickerHeader}>
            <button
              type="button"
              onClick={() => setYearAnchor((year) => year - 12)}
              className={styles.navButton}
              aria-label="Anos anteriores"
            >
              &lsaquo;
            </button>
            <span className={styles.pickerTitle}>
              {yearAnchor - 5} - {yearAnchor + 6}
            </span>
            <button
              type="button"
              onClick={() => setYearAnchor((year) => year + 12)}
              className={styles.navButton}
              aria-label="Anos posteriores"
            >
              &rsaquo;
            </button>
          </div>
          <div className={styles.monthsGrid}>
            {Array.from({ length: 12 }, (_, index) => yearAnchor - 5 + index).map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => {
                  setDisplayedMonth(new Date(year, displayedMonth.getMonth(), 1));
                  setNavView('months');
                }}
                className={[
                  styles.pickerItem,
                  year === displayedMonth.getFullYear() ? styles.pickerItemActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
