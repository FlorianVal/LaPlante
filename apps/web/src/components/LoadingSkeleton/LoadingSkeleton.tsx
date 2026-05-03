import styles from './LoadingSkeleton.module.css';

export function LoadingSkeleton() {
  const skeletonCellCount = 15;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.headerNameCell} />
        {Array.from({ length: skeletonCellCount }).map((_, i) => (
          <div key={i} className={styles.headerSkeletonCell} />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, rowIdx) => (
        <div key={rowIdx} className={styles.row}>
          <div className={styles.nameSkeleton} />
          {Array.from({ length: skeletonCellCount }).map((_, cellIdx) => (
            <div key={cellIdx} className={styles.cellSkeleton} />
          ))}
        </div>
      ))}
    </div>
  );
}
