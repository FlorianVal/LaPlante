import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import styles from './Toast.module.css';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [entering, setEntering] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);

  useEffect(() => {
    if (message && message !== currentMessage) {
      setCurrentMessage(message);
      setEntering(true);
      setVisible(true);

      const enterTimer = setTimeout(() => setEntering(false), 200);
      const dismissTimer = setTimeout(() => {
        setEntering(false);
        setVisible(false);
        setTimeout(() => setCurrentMessage(null), 200);
      }, 3000);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(dismissTimer);
      };
    }
  }, [message]);

  if (!currentMessage) return null;

  return (
    <div className={`${styles.toast} ${entering ? styles.entering : ''} ${!visible ? styles.exiting : ''}`}>
      <Check size={16} />
      <span>{currentMessage}</span>
    </div>
  );
}
