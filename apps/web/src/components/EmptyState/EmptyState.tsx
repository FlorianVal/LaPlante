import { Sprout } from 'lucide-react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  onClick?: () => void;
}

export function EmptyState({ onClick }: EmptyStateProps) {
  return (
    <div className={styles.container} onClick={onClick} role={onClick ? 'button' : undefined}>
      <Sprout size={48} className={styles.icon} />
      <h2 className={styles.heading}>No plants yet</h2>
      <p className={styles.body}>
        Add your first plant to see the watering timeline.
      </p>
      {onClick && (
        <span className={styles.action}>Add your first plant</span>
      )}
    </div>
  );
}
