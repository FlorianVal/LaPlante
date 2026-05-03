import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { X, ImagePlus } from 'lucide-react';
import { createPlant } from '../../lib/api';
import styles from './AddPlantModal.module.css';

interface AddPlantModalProps {
  onClose: () => void;
  onCreated: () => Promise<void>;
  onToast: (message: string) => void;
}

const PRESETS = [3, 7, 14] as const;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5_000_000; // 5 MB

export function AddPlantModal({ onClose, onCreated, onToast }: AddPlantModalProps) {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameBlurred, setNameBlurred] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [intervalDays, setIntervalDays] = useState(7);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Name validation on blur
  useEffect(() => {
    if (nameBlurred && name.trim() === '') {
      setNameError('Plant needs a name');
    } else {
      setNameError(null);
    }
  }, [name, nameBlurred]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoError(null);

    if (!file) {
      setPhotoFile(null);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoError('Please choose a JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setPhotoError('Photo is too large. Please choose an image under 5 MB.');
      return;
    }

    setPhotoFile(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePresetClick = (days: number) => {
    setIntervalDays(days);
    setIsCustom(false);
    setCustomValue('');
  };

  const handleCustomFocus = () => {
    setIsCustom(true);
  };

  const handleCustomChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1 && num <= 90) {
      setIntervalDays(num);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (name.trim() === '') {
      setNameError('Plant needs a name');
      setNameBlurred(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('intervalDays', String(intervalDays));
      if (photoFile) formData.append('photo', photoFile);

      await createPlant(formData);
      await onCreated();
      onToast('Plant added');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = name.trim() !== '' && !submitting;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add a plant</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              className={`${styles.input} ${nameError ? styles.inputError : ''}`}
              placeholder="e.g. Monstera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setNameBlurred(true)}
              autoFocus
            />
            {nameError && <span className={styles.errorText}>{nameError}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Photo</label>
            <div
              className={`${styles.photoArea} ${photoError ? styles.photoAreaError : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className={styles.photoPreview} />
              ) : (
                <div className={styles.photoPrompt}>
                  <ImagePlus size={24} />
                  <span>Choose a photo</span>
                  <span className={styles.photoHint}>JPG, PNG or WebP. Max 5 MB.</span>
                </div>
              )}
            </div>
            {photoPreview && (
              <button
                type="button"
                className={styles.changePhoto}
                onClick={() => fileInputRef.current?.click()}
              >
                Change photo
              </button>
            )}
            {photoError && <span className={styles.errorText}>{photoError}</span>}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Water every</label>
            <div className={styles.recurrenceRow}>
              {PRESETS.map((days) => (
                <button
                  key={days}
                  type="button"
                  className={`${styles.preset} ${!isCustom && intervalDays === days ? styles.presetActive : ''}`}
                  onClick={() => handlePresetClick(days)}
                >
                  {days} days
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={90}
                className={`${styles.input} ${styles.customInput} ${isCustom ? styles.presetActive : ''}`}
                placeholder="Custom"
                value={customValue}
                onChange={handleCustomChange}
                onFocus={handleCustomFocus}
              />
            </div>
          </div>

          {error && <div className={styles.formError}>{error}</div>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!canSubmit}
            >
              Add plant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
