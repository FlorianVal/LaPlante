import { format } from 'date-fns';
import { parseISODate } from '@laplante/shared';

export function formatDayOfMonth(dateStr: string): string {
  return format(parseISODate(dateStr), 'd');
}

export function formatDayOfWeek(dateStr: string): string {
  return format(parseISODate(dateStr), 'EEE');
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}
