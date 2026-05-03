import { Timeline } from './components/Timeline/Timeline';
import { usePlants } from './hooks/usePlants';
import { useCurrentTime } from './hooks/useCurrentTime';
import styles from './App.module.css';

function App() {
  const { plants, loading, error, retry } = usePlants();
  const currentTime = useCurrentTime();

  return (
    <div className={styles.app}>
      <Timeline
        plants={plants}
        loading={loading}
        error={error}
        onRetry={retry}
        currentTime={currentTime}
      />
    </div>
  );
}

export default App;
