import type { ISODateString } from '@laplante/shared';
import { compareISODate } from '@laplante/shared';
import { formatDayOfMonth, formatDayOfWeek } from '../../lib/dates';
import styles from './DateHeader.module.css';

interface DateHeaderProps {
  dates: ISODateString[];
  today: ISODateString;
}

export function DateHeader({ dates, today }: DateHeaderProps) {
  return (
    <div className={styles.row}>
      <div className={styles.cornerCell}>
        <span>Plantes</span>
      </div>
      {dates.map((date) => {
        const isToday = compareISODate(date, today) === 0;
        return (
          <div
            key={date}
            data-date={date}
            className={`${styles.cell} ${isToday ? styles.today : ''}`}
          >
            {isToday && <span className={styles.todayLabel}>Auj.</span>}
            <span className={styles.dayOfMonth}>
              {formatDayOfMonth(date)}
            </span>
            <span className={styles.dayOfWeek}>
              {formatDayOfWeek(date)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
