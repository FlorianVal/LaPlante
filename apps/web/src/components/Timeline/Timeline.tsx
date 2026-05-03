import { useMemo, useRef, useEffect } from 'react';
import type { PlantResponse, ISODateString } from '@laplante/shared';
import { todayISO, addCalendarDays, compareISODate } from '@laplante/shared';
import { DateHeader } from '../DateHeader/DateHeader';
import { PlantRow } from '../PlantRow/PlantRow';
import { NowMarker } from '../NowMarker/NowMarker';
import { EmptyState } from '../EmptyState/EmptyState';
import { ErrorState } from '../ErrorState/ErrorState';
import { LoadingSkeleton } from '../LoadingSkeleton/LoadingSkeleton';
import styles from './Timeline.module.css';

interface TimelineProps {
  plants: PlantResponse[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  currentTime: Date;
}

const PAST_DAYS = 7;
const FUTURE_DAYS = 7;
const NAME_COLUMN_WIDTH = 160;
const CELL_SIZE = 48;
const CELL_GAP = 2;

function generateDateRange(today: ISODateString): ISODateString[] {
  const dates: ISODateString[] = [];
  for (let i = -PAST_DAYS; i <= FUTURE_DAYS; i++) {
    dates.push(addCalendarDays(today, i));
  }
  return dates;
}

function findTodayIndex(dates: ISODateString[], today: ISODateString): number {
  return dates.findIndex((d) => compareISODate(d, today) === 0);
}

export function Timeline({
  plants,
  loading,
  error,
  onRetry,
  currentTime,
}: TimelineProps) {
  const today = useMemo(() => todayISO(currentTime), [currentTime]);
  const dates = useMemo(() => generateDateRange(today), [today]);
  const todayIndex = useMemo(() => findTodayIndex(dates, today), [dates, today]);
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

  const gridTemplateColumns = `var(--name-column-width) repeat(${dates.length}, var(--cell-size))`;

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (plants.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={styles.viewport}>
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
          />
        ))}
      </div>
      <NowMarker
        todayIndex={todayIndex}
        currentTime={currentTime}
        nameColumnWidth={NAME_COLUMN_WIDTH}
        cellSize={CELL_SIZE}
        cellGap={CELL_GAP}
      />
    </div>
  );
}
