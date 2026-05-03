import { addDays, compareAsc, format, isValid, parseISO } from "date-fns";

import type { ISODateString } from "./types.js";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseISODate(value: string): Date {
  if (!ISO_DATE_PATTERN.test(value)) {
    throw new Error("Expected YYYY-MM-DD date");
  }

  const parsed = parseISO(value);
  if (!isValid(parsed) || format(parsed, "yyyy-MM-dd") !== value) {
    throw new Error("Expected YYYY-MM-DD date");
  }

  return parsed;
}

export function formatISODate(date: Date): ISODateString {
  return format(date, "yyyy-MM-dd");
}

export function addCalendarDays(date: ISODateString, days: number): ISODateString {
  return formatISODate(addDays(parseISODate(date), days));
}

export function compareISODate(a: ISODateString, b: ISODateString): number {
  return compareAsc(parseISODate(a), parseISODate(b));
}

export function todayISO(now = new Date()): ISODateString {
  return formatISODate(now);
}
