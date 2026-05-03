import styles from './DayCell.module.css';

interface DayCellProps {
  state: 'empty' | 'future' | 'overdue';
  isToday: boolean;
}

export function DayCell({ state, isToday }: DayCellProps) {
  const classNames = [
    styles.cell,
    isToday ? styles.today : '',
    state === 'future' ? styles.future : '',
    state === 'overdue' ? styles.overdue : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      {(state === 'future' || state === 'overdue') && (
        <div className={styles.dot} />
      )}
    </div>
  );
}
