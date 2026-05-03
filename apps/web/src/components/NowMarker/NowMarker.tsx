import { formatTime } from '../../lib/dates';
import styles from './NowMarker.module.css';

interface NowMarkerProps {
  todayIndex: number;
  currentTime: Date;
  nameColumnWidth: number;
  cellSize: number;
  cellGap: number;
}

export function NowMarker({
  todayIndex,
  currentTime,
  nameColumnWidth,
  cellSize,
  cellGap,
}: NowMarkerProps) {
  const leftOffset =
    nameColumnWidth + todayIndex * (cellSize + cellGap) + cellSize / 2;

  return (
    <div className={styles.marker} style={{ left: leftOffset }}>
      <div className={styles.timeBadge}>{formatTime(currentTime)}</div>
      <div className={styles.line} />
    </div>
  );
}
