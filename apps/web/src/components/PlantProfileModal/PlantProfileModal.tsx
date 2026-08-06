import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { X, Flower2, ImagePlus, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { PlantResponse } from '@laplante/shared';
import { parseISODate } from '@laplante/shared';
import { updatePlant } from '../../lib/api';
import { photoUrl } from '../../lib/photos';
import styles from './PlantProfileModal.module.css';

interface PlantProfileModalProps {
  plant: PlantResponse;
  onClose: () => void;
  onUpdated: () => Promise<void>;
  onToast: (message: string) => void;
}

const PRESETS = [3, 7, 14] as const;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5_000_000; // 5 MB

function formatDateFR(dateStr: string): string {
  return format(parseISODate(dateStr), 'EEE d MMM yyyy', { locale: fr });
}

function formatDayMonth(dateStr: string): string {
  return format(parseISODate(dateStr), 'd MMM', { locale: fr });
}

export function PlantProfileModal({ plant, onClose, onUpdated, onToast }: PlantProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(plant.name);
  const [editNameError, setEditNameError] = useState<string | null>(null);
  const [editNameBlurred, setEditNameBlurred] = useState(false);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [editPhotoError, setEditPhotoError] = useState<string | null>(null);
  const [editIntervalDays, setEditIntervalDays] = useState(plant.recurrence.intervalDays);
  const [editIsCustom, setEditIsCustom] = useState(
    !PRESETS.includes(plant.recurrence.intervalDays as (typeof PRESETS)[number])
  );
  const [editCustomValue, setEditCustomValue] = useState(
    PRESETS.includes(plant.recurrence.intervalDays as (typeof PRESETS)[number])
      ? ''
      : String(plant.recurrence.intervalDays)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URL on unmount or when photo changes
  useEffect(() => {
    return () => {
      if (editPhotoPreview && editPhotoFile) URL.revokeObjectURL(editPhotoPreview);
    };
  }, [editPhotoPreview, editPhotoFile]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditing) {
          handleCancelEdit();
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isEditing]);

  // Name validation on blur
  useEffect(() => {
    if (editNameBlurred && editName.trim() === '') {
      setEditNameError('La plante a besoin d\'un nom');
    } else {
      setEditNameError(null);
    }
  }, [editName, editNameBlurred]);

  const handleCancelEdit = () => {
    // Reset all edit state to initial plant values
    setEditName(plant.name);
    setEditNameError(null);
    setEditNameBlurred(false);
    if (editPhotoPreview && editPhotoFile) URL.revokeObjectURL(editPhotoPreview);
    setEditPhotoFile(null);
    setEditPhotoPreview(null);
    setEditPhotoError(null);
    setEditIntervalDays(plant.recurrence.intervalDays);
    setEditIsCustom(!PRESETS.includes(plant.recurrence.intervalDays as (typeof PRESETS)[number]));
    setEditCustomValue(
      PRESETS.includes(plant.recurrence.intervalDays as (typeof PRESETS)[number])
        ? ''
        : String(plant.recurrence.intervalDays)
    );
    setSubmitting(false);
    setError(null);
    setIsEditing(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setEditPhotoError(null);

    if (!file) return; // keep existing photo

    if (!ALLOWED_TYPES.includes(file.type)) {
      setEditPhotoError('Choisissez une image JPG, PNG ou WebP.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setEditPhotoError('Photo trop volumineuse. Choisissez une image de moins de 5 Mo.');
      return;
    }

    if (editPhotoPreview && editPhotoFile) URL.revokeObjectURL(editPhotoPreview);
    setEditPhotoFile(file);
    setEditPhotoPreview(URL.createObjectURL(file));
  };

  const handlePresetClick = (days: number) => {
    setEditIntervalDays(days);
    setEditIsCustom(false);
    setEditCustomValue('');
  };

  const handleCustomFocus = () => {
    setEditIsCustom(true);
  };

  const handleCustomChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditCustomValue(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1 && num <= 90) {
      setEditIntervalDays(num);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (editName.trim() === '') {
      setEditNameError('La plante a besoin d\'un nom');
      setEditNameBlurred(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', editName.trim());
      formData.append('intervalDays', String(editIntervalDays));
      if (editPhotoFile) formData.append('photo', editPhotoFile);

      await updatePlant(plant.id, formData);
      await onUpdated();
      onToast('Plante modifiée');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = editName.trim() !== '' && !submitting;
  const { schedule, recurrence } = plant;
  const nextDates = schedule.futureWateringDates.slice(0, 4);

  return (
    <div className={styles.backdrop} onClick={isEditing ? undefined : onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Modifier {plant.name}</h2>
              <button className={styles.closeButton} onClick={onClose} aria-label="Fermer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Nom</label>
                <input
                  type="text"
                  className={`${styles.input} ${editNameError ? styles.inputError : ''}`}
                  placeholder="ex. Monstera"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => setEditNameBlurred(true)}
                  autoFocus
                />
                {editNameError && <span className={styles.errorText}>{editNameError}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Photo</label>
                <div
                  className={`${styles.photoArea} ${editPhotoError ? styles.photoAreaError : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {editPhotoPreview ? (
                    <img src={editPhotoPreview} alt="Apercu" className={styles.photoPreview} />
                  ) : plant.photoPath ? (
                    <img
                      src={photoUrl(plant.photoPath)}
                      alt={plant.name}
                      className={styles.photoPreview}
                    />
                  ) : (
                    <div className={styles.photoPrompt}>
                      <ImagePlus size={24} />
                      <span>Choisir une photo</span>
                      <span className={styles.photoHint}>JPG, PNG ou WebP. Max 5 Mo.</span>
                    </div>
                  )}
                </div>
                {(editPhotoPreview || plant.photoPath) && (
                  <button
                    type="button"
                    className={styles.changePhoto}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Changer la photo
                  </button>
                )}
                {editPhotoError && <span className={styles.errorText}>{editPhotoError}</span>}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Arroser tous les</label>
                <div className={styles.recurrenceRow}>
                  {PRESETS.map((days) => (
                    <button
                      key={days}
                      type="button"
                      className={`${styles.preset} ${!editIsCustom && editIntervalDays === days ? styles.presetActive : ''}`}
                      onClick={() => handlePresetClick(days)}
                    >
                      {days} jours
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={90}
                    className={`${styles.input} ${styles.customInput} ${editIsCustom ? styles.presetActive : ''}`}
                    placeholder="Custom"
                    value={editCustomValue}
                    onChange={handleCustomChange}
                    onFocus={handleCustomFocus}
                  />
                </div>
              </div>

              {error && <div className={styles.formError}>{error}</div>}

              <div className={styles.actions}>
                <button type="button" className={styles.cancelButton} onClick={handleCancelEdit}>
                  Annuler
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={!canSubmit}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>{plant.name}</h2>
              <div className={styles.headerActions}>
                <button
                  className={styles.editButton}
                  onClick={() => setIsEditing(true)}
                  aria-label="Modifier la plante"
                >
                  <Pencil size={16} />
                  Modifier
                </button>
                <button className={styles.closeButton} onClick={onClose} aria-label="Fermer">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className={styles.photoSection}>
              {plant.photoPath ? (
                <img
                  src={photoUrl(plant.photoPath)}
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
          </>
        )}
      </div>
    </div>
  );
}
