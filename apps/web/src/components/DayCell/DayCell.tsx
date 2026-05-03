import styles from './DayCell.module.css';

interface DayCellProps {
  state: 'empty' | 'future' | 'overdue';
  isToday: boolean;
  date?: string;
}

export function DayCell({ state, isToday, date }: DayCellProps) {
  const classNames = [
    styles.cell,
    isToday ? styles.today : '',
    state === 'future' ? styles.future : '',
    state === 'overdue' ? styles.overdue : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} {...(date ? { 'data-date': date } : {})}>
      {(state === 'future' || state === 'overdue') && (
        <div className={styles.dot} />
      )}
    </div>
  );
}
