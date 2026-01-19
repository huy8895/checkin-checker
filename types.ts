export enum ShiftType {
  SHIFT_1 = 'SHIFT_1', // 8h -> 18h
  SHIFT_2 = 'SHIFT_2', // 8h30 -> 18h30
  SHIFT_3 = 'SHIFT_3', // 9h -> 19h
}

export interface ShiftConfig {
  id: ShiftType;
  name: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  graceMinutes: number;
}

export interface RawLog {
  empId: string;
  timestamp: Date;
  rawString: string;
}

export enum DayStatus {
  NORMAL = 'Normal',
  LATE = 'Late',
  EARLY_ALLOWED = 'Early (Quota Used)',
  EARLY_VIOLATION = 'Early (Violation)', // > 1.5h or > 3 times
  ABSENT = 'Absent',
  WEEKEND = 'Weekend',
  MISSING_IN = 'Missing Check-In',
  MISSING_OUT = 'Missing Check-Out'
}

export interface DailyRecord {
  date: Date; // 00:00:00 time
  checkIn: Date | null;
  checkOut: Date | null;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday...
  isFriday: boolean;
  status: DayStatus[];
  lateMinutes: number;
  earlyMinutes: number;
  notes: string[];
}

export interface AnalysisSummary {
  totalLate: number;
  totalEarlyAllowed: number;
  totalEarlyViolation: number;
  totalAbsent: number;
}