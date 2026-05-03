import type { PlantResponse } from '@laplante/shared';
import { todayISO, addCalendarDays } from '@laplante/shared';

/**
 * Returns hardcoded mock plants matching the UI-SPEC contract.
 * Uses todayISO and addCalendarDays to compute dates relative to today.
 */
export function getMockPlants(): PlantResponse[] {
  const today = todayISO();

  // Visible window: today - 7 to today + 7
  const windowFrom = addCalendarDays(today, -7);
  const windowTo = addCalendarDays(today, 7);

  function filterToWindow(dates: string[]): string[] {
    return dates.filter((d) => d >= windowFrom && d <= windowTo);
  }

  function generateFutureDates(nextDue: string, interval: number): string[] {
    const dates: string[] = [];
    let current = nextDue;
    while (current <= windowTo) {
      dates.push(current);
      current = addCalendarDays(current, interval);
    }
    return filterToWindow(dates);
  }

  // Fern: intervalDays 3, last watered 2 days ago, next due in 1 day
  const fernNextDue = addCalendarDays(today, 1);
  const fern = {
    id: 'mock-fern',
    name: 'Fern',
    photoPath: null,
    recurrence: { intervalDays: 3 },
    schedule: {
      nextDueDate: fernNextDue,
      isOverdue: false,
      overdueSince: null,
      futureWateringDates: generateFutureDates(fernNextDue, 3),
    },
  };

  // Cactus: intervalDays 14, last watered 10 days ago, next due in 4 days
  const cactusNextDue = addCalendarDays(today, 4);
  const cactus = {
    id: 'mock-cactus',
    name: 'Cactus',
    photoPath: null,
    recurrence: { intervalDays: 14 },
    schedule: {
      nextDueDate: cactusNextDue,
      isOverdue: false,
      overdueSince: null,
      futureWateringDates: generateFutureDates(cactusNextDue, 14),
    },
  };

  // Orchid: intervalDays 5, last watered 8 days ago, overdue since 3 days ago
  const orchidOverdueSince = addCalendarDays(today, -3);
  const orchidNextDue = addCalendarDays(today, 2);
  const orchid = {
    id: 'mock-orchid',
    name: 'Orchid',
    photoPath: null,
    recurrence: { intervalDays: 5 },
    schedule: {
      nextDueDate: orchidNextDue,
      isOverdue: true,
      overdueSince: orchidOverdueSince,
      futureWateringDates: generateFutureDates(orchidNextDue, 5),
    },
  };

  // Snake Plant: intervalDays 7, last watered 7 days ago, next due today
  const snakePlantNextDue = today;
  const snakePlant = {
    id: 'mock-snake-plant',
    name: 'Snake Plant',
    photoPath: null,
    recurrence: { intervalDays: 7 },
    schedule: {
      nextDueDate: snakePlantNextDue,
      isOverdue: false,
      overdueSince: null,
      futureWateringDates: generateFutureDates(snakePlantNextDue, 7),
    },
  };

  // Aloe Vera: intervalDays 4, last watered 1 day ago, next due in 3 days
  const aloeVeraNextDue = addCalendarDays(today, 3);
  const aloeVera = {
    id: 'mock-aloe-vera',
    name: 'Aloe Vera',
    photoPath: null,
    recurrence: { intervalDays: 4 },
    schedule: {
      nextDueDate: aloeVeraNextDue,
      isOverdue: false,
      overdueSince: null,
      futureWateringDates: generateFutureDates(aloeVeraNextDue, 4),
    },
  };

  return [fern, cactus, orchid, snakePlant, aloeVera];
}
