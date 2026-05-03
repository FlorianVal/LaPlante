import { useMemo, useState, useCallback } from 'react';
import { getMockPlants } from './lib/mock-data';
import { Timeline } from './components/Timeline/Timeline';
import styles from './App.module.css';

function App() {
  const [plants] = useState(() => getMockPlants());
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const handleRetry = useCallback(() => {
    // No-op for now, will be wired to API in Plan 02
  }, []);

  const currentTime = useMemo(() => new Date(), []);

  return (
    <div className={styles.app}>
      <Timeline
        plants={plants}
        loading={loading}
        error={error}
        onRetry={handleRetry}
        currentTime={currentTime}
      />
    </div>
  );
}

export default App;
