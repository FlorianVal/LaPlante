import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { parseISODate } from '@laplante/shared';

export function formatDayOfMonth(dateStr: string): string {
  return format(parseISODate(dateStr), 'd');
}

export function formatDayOfWeek(dateStr: string): string {
  return format(parseISODate(dateStr), 'EEE', { locale: fr });
}
