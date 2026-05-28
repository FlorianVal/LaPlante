import { useState, useCallback } from 'react';
import type { PlantResponse } from '@laplante/shared';
import { Plus } from 'lucide-react';
import { Timeline } from './components/Timeline/Timeline';
import { AddPlantModal } from './components/AddPlantModal/AddPlantModal';
import { PlantProfileModal } from './components/PlantProfileModal/PlantProfileModal';
import { Toast } from './components/Toast/Toast';
import { usePlants } from './hooks/usePlants';
import { useCurrentTime } from './hooks/useCurrentTime';
import styles from './App.module.css';

function App() {
  const { plants, loading, error, retry, refresh } = usePlants();
  const currentTime = useCurrentTime();
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<PlantResponse | null>(null);

  const handlePlantCreated = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const handleToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  const handleEmptyStateClick = useCallback(() => {
    setModalOpen(true);
  }, []);

  return (
    <div className={styles.app}>
      <Timeline
        plants={plants}
        loading={loading}
        error={error}
        onRetry={retry}
        currentTime={currentTime}
        onEmptyStateClick={handleEmptyStateClick}
        onRefresh={refresh}
        onToastError={handleToast}
        onPlantClick={setSelectedPlant}
      />
      <button
        className={styles.fab}
        onClick={() => setModalOpen(true)}
        aria-label="Add plant"
      >
        <Plus size={20} />
      </button>
      {modalOpen && (
        <AddPlantModal
          onClose={() => setModalOpen(false)}
          onCreated={handlePlantCreated}
          onToast={handleToast}
        />
      )}
      {selectedPlant && (
        <PlantProfileModal
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
        />
      )}
      <Toast message={toastMessage} />
    </div>
  );
}

export default App;
