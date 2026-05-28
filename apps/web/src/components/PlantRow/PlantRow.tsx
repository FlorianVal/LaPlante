import { Flower2 } from 'lucide-react';
import type { PlantResponse, ISODateString } from '@laplante/shared';
import { compareISODate } from '@laplante/shared';
import { DayCell } from '../DayCell/DayCell';
import styles from './PlantRow.module.css';

interface PlantRowProps {
  plant: PlantResponse;
  dates: ISODateString[];
  today: ISODateString;
  onConfirmWatering?: (plantId: string) => void;
  onPlantClick?: (plantId: string) => void;
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

export function PlantRow({ plant, dates, today, onConfirmWatering, onPlantClick }: PlantRowProps) {
  const scheduleLabel = plant.schedule.isOverdue
    ? 'En retard'
    : `Tous les ${plant.recurrence.intervalDays} j`;

  return (
    <div className={styles.row}>
      <div
        className={`${styles.nameColumn} ${onPlantClick ? styles.clickable : ''}`}
        onClick={onPlantClick ? () => onPlantClick(plant.id) : undefined}
        role={onPlantClick ? 'button' : undefined}
        tabIndex={onPlantClick ? 0 : undefined}
        aria-label={onPlantClick ? `Voir le profil de ${plant.name}` : undefined}
        onKeyDown={onPlantClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPlantClick(plant.id);
          }
        } : undefined}
      >
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
        <div className={styles.plantText}>
          <span className={styles.name}>{plant.name}</span>
          <span className={`${styles.meta} ${plant.schedule.isOverdue ? styles.overdueMeta : ''}`}>
            {scheduleLabel}
          </span>
        </div>
      </div>
      {dates.map((date) => {
        const cellState = getCellState(date, plant, today);
        const isToday = compareISODate(date, today) === 0;
        return (
          <DayCell
            key={date}
            state={cellState}
            isToday={isToday}
            date={date}
            onClick={(cellState === 'overdue' || cellState === 'future') && isToday && onConfirmWatering ? () => onConfirmWatering(plant.id) : undefined}
            plantName={plant.name}
          />
        );
      })}
    </div>
  );
}
