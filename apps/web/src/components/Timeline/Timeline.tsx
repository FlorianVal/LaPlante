import { useMemo, useRef, useEffect, useCallback } from 'react';
import type { PlantResponse, ISODateString } from '@laplante/shared';
import { todayISO, addCalendarDays, compareISODate } from '@laplante/shared';
import { Droplets, Sprout } from 'lucide-react';
import { DateHeader } from '../DateHeader/DateHeader';
import { PlantRow } from '../PlantRow/PlantRow';
import { EmptyState } from '../EmptyState/EmptyState';
import { ErrorState } from '../ErrorState/ErrorState';
import { LoadingSkeleton } from '../LoadingSkeleton/LoadingSkeleton';
import { confirmWatering } from '../../lib/api';
import styles from './Timeline.module.css';

interface TimelineProps {
  plants: PlantResponse[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  currentTime: Date;
  onEmptyStateClick?: () => void;
  onRefresh: () => void;
  onToastError: (message: string) => void;
  onPlantClick?: (plant: PlantResponse) => void;
}

const PAST_DAYS = 7;
const FUTURE_DAYS = 7;

function generateDateRange(today: ISODateString): ISODateString[] {
  const dates: ISODateString[] = [];
  for (let i = -PAST_DAYS; i <= FUTURE_DAYS; i++) {
    dates.push(addCalendarDays(today, i));
  }
  return dates;
}

function plantNeedsWaterToday(plant: PlantResponse, today: ISODateString): boolean {
  return (
    plant.schedule.isOverdue ||
    plant.schedule.futureWateringDates.some((date) => compareISODate(date, today) === 0)
  );
}

export function Timeline({
  plants,
  loading,
  error,
  onRetry,
  currentTime,
  onEmptyStateClick,
  onRefresh,
  onToastError,
  onPlantClick,
}: TimelineProps) {
  const today = useMemo(() => todayISO(currentTime), [currentTime]);
  const dates = useMemo(() => generateDateRange(today), [today]);
  const overdueCount = useMemo(
    () => plants.filter((plant) => plant.schedule.isOverdue).length,
    [plants]
  );
  const dueTodayCount = useMemo(
    () => plants.filter((plant) => plantNeedsWaterToday(plant, today)).length,
    [plants, today]
  );
  const gridRef = useRef<HTMLDivElement>(null);

  // Scroll to center on today when data first loads or re-loads after midnight
  useEffect(() => {
    if (!loading && plants.length > 0) {
      // Use requestAnimationFrame to ensure the grid is painted
      requestAnimationFrame(() => {
        const todayStr = todayISO();
        const todayCell = gridRef.current?.querySelector(
          `[data-date="${todayStr}"]`
        );
        todayCell?.scrollIntoView({ behavior: 'instant', inline: 'center' } as ScrollIntoViewOptions);
      });
    }
  }, [loading, plants]);

  const handleConfirmWatering = useCallback(async (plantId: string) => {
    try {
      await confirmWatering(plantId);
      onRefresh();
    } catch {
      onToastError('Could not record watering. Please try again.');
    }
  }, [onRefresh, onToastError]);

  const gridTemplateColumns = `var(--name-column-width) repeat(${dates.length}, var(--cell-width))`;

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (plants.length === 0) {
    return <EmptyState onClick={onEmptyStateClick} />;
  }

  return (
    <div className={styles.viewport}>
      <header className={styles.toolbar}>
        <div>
          <p className={styles.kicker}>Maison</p>
          <h1 className={styles.title}>Arrosage des plantes</h1>
        </div>
        <div className={styles.statusGroup} aria-label="Etat du jour">
          <div className={styles.statusPill}>
            <Droplets size={18} />
            <span>{dueTodayCount}</span>
            <small>a faire</small>
          </div>
          <div className={`${styles.statusPill} ${overdueCount > 0 ? styles.warning : ''}`}>
            <Sprout size={18} />
            <span>{plants.length}</span>
            <small>plantes</small>
          </div>
        </div>
      </header>

      <div className={styles.timelineShell}>
        <div
          ref={gridRef}
          className={styles.grid}
          style={{ gridTemplateColumns }}
        >
          <DateHeader dates={dates} today={today} />
          {plants.map((plant) => (
            <PlantRow
              key={plant.id}
              plant={plant}
              dates={dates}
              today={today}
              onConfirmWatering={handleConfirmWatering}
              onPlantClick={onPlantClick ? () => onPlantClick(plant) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
