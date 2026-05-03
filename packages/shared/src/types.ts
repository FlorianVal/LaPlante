export type PlantId = string;

export type ISODateString = string;

export type RecurrenceRule = {
  intervalDays: number;
};

export type PlantScheduleSummary = {
  nextDueDate: ISODateString;
  isOverdue: boolean;
  overdueSince: ISODateString | null;
  futureWateringDates: ISODateString[];
};

export type PlantResponse = {
  id: PlantId;
  name: string;
  photoPath: string | null;
  recurrence: RecurrenceRule;
  schedule: PlantScheduleSummary;
};
