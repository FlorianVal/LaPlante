import { AlertTriangle } from 'lucide-react';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className={styles.container}>
      <AlertTriangle size={48} className={styles.icon} />
      <h2 className={styles.heading}>Could not load plants</h2>
      <p className={styles.body}>
        Check that the server is running and try again.
      </p>
      <button className={styles.retryButton} onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
