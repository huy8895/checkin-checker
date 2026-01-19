import { ShiftConfig, ShiftType } from './types';

export const SHIFTS: Record<ShiftType, ShiftConfig> = {
  [ShiftType.SHIFT_1]: {
    id: ShiftType.SHIFT_1,
    name: 'Ca 1 (08:00 - 18:00)',
    startTime: '08:00',
    endTime: '18:00',
    graceMinutes: 15,
  },
  [ShiftType.SHIFT_2]: {
    id: ShiftType.SHIFT_2,
    name: 'Ca 2 (08:30 - 18:30)',
    startTime: '08:30',
    endTime: '18:30',
    graceMinutes: 10,
  },
  [ShiftType.SHIFT_3]: {
    id: ShiftType.SHIFT_3,
    name: 'Ca 3 (09:00 - 19:00)',
    startTime: '09:00',
    endTime: '19:00',
    graceMinutes: 10,
  },
};

export const QUOTA_EARLY_LEAVE_COUNT = 3;
export const QUOTA_EARLY_LEAVE_MINUTES = 90; // 1.5 hours
export const FRIDAY_EARLY_MINUTES = 60; // 1 hour earlier on Fridays
