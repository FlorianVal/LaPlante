import { useEffect } from 'react';
import { X, Flower2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { PlantResponse } from '@laplante/shared';
import { parseISODate } from '@laplante/shared';
import styles from './PlantProfileModal.module.css';

interface PlantProfileModalProps {
  plant: PlantResponse;
  onClose: () => void;
}

function formatDateFR(dateStr: string): string {
  return format(parseISODate(dateStr), 'EEE d MMM yyyy', { locale: fr });
}

function formatDayMonth(dateStr: string): string {
  return format(parseISODate(dateStr), 'd MMM', { locale: fr });
}

export function PlantProfileModal({ plant, onClose }: PlantProfileModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const { schedule, recurrence } = plant;
  const nextDates = schedule.futureWateringDates.slice(0, 4);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{plant.name}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        <div className={styles.photoSection}>
          {plant.photoPath ? (
            <img
              src={`/photos/${plant.photoPath}`}
              alt={plant.name}
              className={styles.photoImage}
            />
          ) : (
            <Flower2 size={64} />
          )}
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Frequence</span>
            <span className={styles.infoValue}>
              Tous les {recurrence.intervalDays} jours
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Statut</span>
            <span className={`${styles.infoValue} ${schedule.isOverdue ? styles.statusOverdue : styles.statusOk}`}>
              {schedule.isOverdue ? 'En retard' : 'A jour'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Prochain arrosage</span>
            <span className={styles.infoValue}>
              {formatDateFR(schedule.nextDueDate)}
            </span>
          </div>
          {schedule.isOverdue && schedule.overdueSince && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>En retard depuis</span>
              <span className={`${styles.infoValue} ${styles.statusOverdue}`}>
                {formatDateFR(schedule.overdueSince)}
              </span>
            </div>
          )}
        </div>

        {nextDates.length > 0 && (
          <div className={styles.futureSection}>
            <p className={styles.futureTitle}>Prochains arrosages</p>
            <div className={styles.futureList}>
              {nextDates.map((date) => (
                <span key={date} className={styles.futureChip}>
                  {formatDayMonth(date)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
