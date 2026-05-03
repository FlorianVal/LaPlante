import { describe, expect, it } from "vitest";

import {
  buildScheduleSummary,
  getLatestWateringAnchor,
  getNextDueDate
} from "./recurrence.js";

describe("recurrence", () => {
  it("derives the first due date from lastWateredOn plus intervalDays", () => {
    expect(getNextDueDate("2026-05-01", 7)).toBe("2026-05-08");
  });

  it("late watering resets cadence from the actual wateredOn date", () => {
    const anchor = getLatestWateringAnchor("2026-05-01", ["2026-05-10"]);

    const summary = buildScheduleSummary({
      intervalDays: 7,
      lastWateredOn: anchor,
      today: "2026-05-10",
      window: { from: "2026-05-03", to: "2026-05-31" }
    });

    expect(summary.nextDueDate).toBe("2026-05-17");
  });

  it("multiple missed intervals produce one overdue state without a backlog list", () => {
    const summary = buildScheduleSummary({
      intervalDays: 7,
      lastWateredOn: "2026-04-01",
      today: "2026-05-03",
      window: { from: "2026-04-01", to: "2026-05-31" }
    });

    expect(summary.isOverdue).toBe(true);
    expect(summary.overdueSince).toBe("2026-04-08");
    expect(summary.futureWateringDates).toEqual([
      "2026-05-06",
      "2026-05-13",
      "2026-05-20",
      "2026-05-27"
    ]);
  });

  it("returns windowed future watering dates inside the inclusive window", () => {
    const summary = buildScheduleSummary({
      intervalDays: 7,
      lastWateredOn: "2026-05-01",
      today: "2026-05-03",
      window: { from: "2026-05-03", to: "2026-05-31" }
    });

    expect(summary.futureWateringDates).toEqual([
      "2026-05-08",
      "2026-05-15",
      "2026-05-22",
      "2026-05-29"
    ]);
  });

  it("rejects invalid intervals and reversed windows", () => {
    expect(() =>
      buildScheduleSummary({
        intervalDays: 0,
        lastWateredOn: "2026-05-01",
        today: "2026-05-03",
        window: { from: "2026-05-03", to: "2026-05-31" }
      })
    ).toThrow("intervalDays must be at least 1");

    expect(() =>
      buildScheduleSummary({
        intervalDays: 7,
        lastWateredOn: "2026-05-01",
        today: "2026-05-03",
        window: { from: "2026-06-01", to: "2026-05-31" }
      })
    ).toThrow("window.to must be on or after window.from");
  });
});
