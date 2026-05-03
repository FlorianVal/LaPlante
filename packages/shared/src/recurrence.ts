import { addCalendarDays, compareISODate, todayISO } from "./dates.js";
import type {
  BuildScheduleSummaryInput,
  ISODateString,
  PlantScheduleSummary
} from "./types.js";

export function getNextDueDate(
  lastWateredOn: ISODateString,
  intervalDays: number
): ISODateString {
  assertIntervalDays(intervalDays);
  return addCalendarDays(lastWateredOn, intervalDays);
}

export function getLatestWateringAnchor(
  createdLastWateredOn: ISODateString,
  wateringEvents: ISODateString[]
): ISODateString {
  return wateringEvents.reduce((latest, eventDate) => {
    return compareISODate(eventDate, latest) > 0 ? eventDate : latest;
  }, createdLastWateredOn);
}

export function buildScheduleSummary(
  input: BuildScheduleSummaryInput
): PlantScheduleSummary {
  assertIntervalDays(input.intervalDays);
  assertWindow(input.window.from, input.window.to);

  const currentDay = input.today ?? todayISO();
  const nextDueDate = getNextDueDate(input.lastWateredOn, input.intervalDays);
  const isOverdue = compareISODate(nextDueDate, currentDay) < 0;
  const futureWateringDates = getFutureWateringDates({
    firstDueDate: nextDueDate,
    intervalDays: input.intervalDays,
    from: input.window.from,
    to: input.window.to,
    today: currentDay
  });

  return {
    nextDueDate,
    isOverdue,
    overdueSince: isOverdue ? nextDueDate : null,
    futureWateringDates
  };
}

function getFutureWateringDates(input: {
  firstDueDate: ISODateString;
  intervalDays: number;
  from: ISODateString;
  to: ISODateString;
  today: ISODateString;
}): ISODateString[] {
  const dates: ISODateString[] = [];
  let cursor = input.firstDueDate;

  while (compareISODate(cursor, input.to) <= 0) {
    if (
      compareISODate(cursor, input.from) >= 0 &&
      compareISODate(cursor, input.today) >= 0
    ) {
      dates.push(cursor);
    }

    cursor = addCalendarDays(cursor, input.intervalDays);
  }

  return dates;
}

function assertIntervalDays(intervalDays: number): void {
  if (!Number.isInteger(intervalDays) || intervalDays < 1) {
    throw new Error("intervalDays must be at least 1");
  }
}

function assertWindow(from: ISODateString, to: ISODateString): void {
  if (compareISODate(to, from) < 0) {
    throw new Error("window.to must be on or after window.from");
  }
}
