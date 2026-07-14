export type PlantId = string;

export type ISODateString = string;

export type DashboardSummary = {
  overdueCount: number;
  lastWateredOn: ISODateString | null;
};

export type RecurrenceRule = {
  intervalDays: number;
};

export type PlantScheduleSummary = {
  nextDueDate: ISODateString;
  isOverdue: boolean;
  overdueSince: ISODateString | null;
  futureWateringDates: ISODateString[];
};

export type ScheduleWindow = {
  from: ISODateString;
  to: ISODateString;
};

export type BuildScheduleSummaryInput = {
  intervalDays: number;
  lastWateredOn: ISODateString;
  window: ScheduleWindow;
  today?: ISODateString;
};

export type PlantResponse = {
  id: PlantId;
  name: string;
  photoPath: string | null;
  recurrence: RecurrenceRule;
  schedule: PlantScheduleSummary;
};
