import { Flower2 } from 'lucide-react';
import type { PlantResponse, ISODateString } from '@laplante/shared';
import { compareISODate } from '@laplante/shared';
import { DayCell } from '../DayCell/DayCell';
import styles from './PlantRow.module.css';

interface PlantRowProps {
  plant: PlantResponse;
  dates: ISODateString[];
  today: ISODateString;
}

function getCellState(
  date: ISODateString,
  plant: PlantResponse,
  today: ISODateString
): 'empty' | 'future' | 'overdue' {
  const { schedule } = plant;

  if (schedule.futureWateringDates.includes(date)) {
    return 'future';
  }

  if (
    schedule.isOverdue &&
    schedule.overdueSince &&
    compareISODate(date, schedule.overdueSince) >= 0 &&
    compareISODate(date, today) <= 0
  ) {
    return 'overdue';
  }

  return 'empty';
}

export function PlantRow({ plant, dates, today }: PlantRowProps) {
  return (
    <div className={styles.row}>
      <div className={styles.nameColumn}>
        <div className={styles.iconPlaceholder}>
          {plant.photoPath ? (
            <img
              src={`/photos/${plant.photoPath}`}
              alt={plant.name}
              className={styles.plantPhoto}
            />
          ) : (
            <Flower2 size={20} />
          )}
        </div>
        <span className={styles.name}>{plant.name}</span>
      </div>
      {dates.map((date) => (
        <DayCell
          key={date}
          state={getCellState(date, plant, today)}
          isToday={compareISODate(date, today) === 0}
          date={date}
        />
      ))}
    </div>
  );
}
