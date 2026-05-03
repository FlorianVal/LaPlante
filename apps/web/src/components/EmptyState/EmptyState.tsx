import { Sprout } from 'lucide-react';
import styles from './EmptyState.module.css';

export function EmptyState() {
  return (
    <div className={styles.container}>
      <Sprout size={48} className={styles.icon} />
      <h2 className={styles.heading}>No plants yet</h2>
      <p className={styles.body}>
        Add your first plant to see the watering timeline.
      </p>
    </div>
  );
}
