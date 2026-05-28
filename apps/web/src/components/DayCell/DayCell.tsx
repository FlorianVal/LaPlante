import type { KeyboardEvent } from 'react';
import { Check, Droplets } from 'lucide-react';
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
        'aria-label': `Marquer ${plantName} comme arrosee`,
        onClick,
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        },
        style: { touchAction: 'manipulation' },
      } : {})}
    >
      {state === 'future' && !onClick && <Droplets className={styles.icon} size={19} strokeWidth={2.4} />}
      {state === 'future' && onClick && (
        <span className={styles.actionContent}>
          <Check size={16} strokeWidth={3} />
          <span>OK</span>
        </span>
      )}
      {state === 'overdue' && onClick && (
        <span className={styles.actionContent}>
          <Check size={16} strokeWidth={3} />
          <span>OK</span>
        </span>
      )}
      {state === 'overdue' && !onClick && <span className={styles.overdueTrail} />}
    </div>
  );
}
