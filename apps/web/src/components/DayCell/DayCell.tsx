import styles from './DayCell.module.css';

interface DayCellProps {
  state: 'empty' | 'future' | 'overdue';
  isToday: boolean;
  date?: string;
  onClick?: () => void;
  plantName?: string;
}

export function DayCell({ state, isToday, date, onClick, plantName }: DayCellProps) {
  const classNames = [
    styles.cell,
    isToday ? styles.today : '',
    state === 'future' ? styles.future : '',
    state === 'overdue' ? styles.overdue : '',
    onClick ? styles.clickable : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      {...(date ? { 'data-date': date } : {})}
      {...(onClick ? {
        role: 'button',
        tabIndex: 0,
        'aria-label': `Water ${plantName}`,
        onClick,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        },
        style: { touchAction: 'manipulation' },
      } : {})}
    >
      {(state === 'future' || state === 'overdue') && (
        <div className={styles.dot} />
      )}
    </div>
  );
}
