import { parse, isValid, startOfDay, isFriday, isWeekend, format, addDays, differenceInMinutes, parseISO, set } from 'date-fns';
import { RawLog, DailyRecord, DayStatus, ShiftConfig } from '../types';
import { FRIDAY_EARLY_MINUTES, QUOTA_EARLY_LEAVE_COUNT, QUOTA_EARLY_LEAVE_MINUTES } from '../constants';

// Regex to find date/time patterns like "01/15/26 6:19:15PM" or "01/15/26  6:19:15PM"
// Matches MM/DD/YY followed by H:MM:SS(AM/PM)
const DATETIME_REGEX = /(\d{2})\/(\d{2})\/(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})(AM|PM)/g;

export const parseRawInput = (input: string): RawLog[] => {
  const logs: RawLog[] = [];
  const matches = input.matchAll(DATETIME_REGEX);

  for (const match of matches) {
    const [fullStr, month, day, yearShort, hour, minute, second, meridiem] = match;
    
    // Construct a parseable string for date-fns or standard Date
    // assuming 'yearShort' 25 means 2025, 26 means 2026.
    const yearFull = parseInt(yearShort) < 50 ? `20${yearShort}` : `19${yearShort}`;
    
    // date-fns format string for "01/15/2026 6:19:15PM" is "MM/dd/yyyy h:mm:ssa"
    const dateString = `${month}/${day}/${yearFull} ${hour}:${minute}:${second}${meridiem}`;
    
    const parsedDate = parse(dateString, 'MM/dd/yyyy h:mm:ssa', new Date());

    if (isValid(parsedDate)) {
      logs.push({
        empId: 'unknown', // Parsing logic could be improved to find ID near the date, but usually grouped by file
        timestamp: parsedDate,
        rawString: fullStr
      });
    }
  }

  // Sort logs by time ascending
  return logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

export const analyzeAttendance = (
  logs: RawLog[], 
  shift: ShiftConfig, 
  range?: { start?: Date, end?: Date }
): DailyRecord[] => {
  // Group by Date String (YYYY-MM-DD)
  const groupedByDate: Record<string, Date[]> = {};
  
  logs.forEach(log => {
    const dayKey = format(log.timestamp, 'yyyy-MM-dd');
    if (!groupedByDate[dayKey]) groupedByDate[dayKey] = [];
    groupedByDate[dayKey].push(log.timestamp);
  });

  // Determine Range (Start Date to End Date)
  let startDate: Date;
  let endDate: Date;
  
  const sortedDates = Object.keys(groupedByDate).sort();
  const hasLogs = sortedDates.length > 0;

  // Determine Start Date: Explicit range > First log > null
  if (range?.start) {
    startDate = startOfDay(range.start);
  } else if (hasLogs) {
    startDate = parseISO(sortedDates[0]);
  } else {
    // If no logs and no start date provided, return empty
    return [];
  }

  // Determine End Date: Explicit range > Last log > Start Date
  if (range?.end) {
    endDate = startOfDay(range.end);
  } else if (hasLogs) {
    endDate = parseISO(sortedDates[sortedDates.length - 1]);
  } else {
     endDate = startDate;
  }
  
  if (startDate > endDate) return [];

  const results: DailyRecord[] = [];
  
  // Helper to track monthly quotas
  // Key: "YYYY-MM", Value: count of allowed early leaves
  const monthlyQuotaUsage: Record<string, number> = {};

  let currentDate = startDate;
  while (currentDate <= endDate) {
    const dayKey = format(currentDate, 'yyyy-MM-dd');
    const timestamps = groupedByDate[dayKey] || [];
    const isWknd = isWeekend(currentDate);
    
    const record: DailyRecord = {
      date: currentDate,
      checkIn: null,
      checkOut: null,
      dayOfWeek: currentDate.getDay(),
      isFriday: isFriday(currentDate),
      status: [],
      lateMinutes: 0,
      earlyMinutes: 0,
      notes: []
    };

    if (timestamps.length > 0) {
      // Sort to find First and Last
      timestamps.sort((a, b) => a.getTime() - b.getTime());

      if (timestamps.length === 1) {
        // Single log logic
        const singleLog = timestamps[0];
        // Heuristic: If before 12:00 PM -> Likely CheckIn, missing CheckOut
        // If >= 12:00 PM -> Likely CheckOut, missing CheckIn
        const noon = set(currentDate, { hours: 12, minutes: 0, seconds: 0 });
        
        if (singleLog < noon) {
          record.checkIn = singleLog;
          record.checkOut = null;
          record.status.push(DayStatus.MISSING_OUT);
          record.notes.push("Không có dữ liệu giờ ra");
        } else {
          record.checkIn = null;
          record.checkOut = singleLog;
          record.status.push(DayStatus.MISSING_IN);
          record.notes.push("Không có dữ liệu giờ vào");
        }
      } else {
        // >= 2 logs: First is In, Last is Out
        record.checkIn = timestamps[0];
        record.checkOut = timestamps[timestamps.length - 1];
      }

      // --- 1. Check Late Arrival (Only if CheckIn exists) ---
      if (record.checkIn) {
        const [sh, sm] = shift.startTime.split(':').map(Number);
        const expectedStart = set(currentDate, { hours: sh, minutes: sm, seconds: 0 });
        const lateThreshold = set(currentDate, { hours: sh, minutes: sm + shift.graceMinutes, seconds: 0 });

        if (record.checkIn > lateThreshold) {
          record.status.push(DayStatus.LATE);
          record.lateMinutes = differenceInMinutes(record.checkIn, expectedStart);
          record.notes.push(`Đi muộn ${record.lateMinutes} phút (Quy định: >${shift.startTime} + ${shift.graceMinutes}p)`);
        }
      }

      // --- 2. Check Early Leave (Only if CheckOut exists) ---
      if (record.checkOut) {
        // Calculate Expected End Time
        const [eh, em] = shift.endTime.split(':').map(Number);
        let expectedEnd = set(currentDate, { hours: eh, minutes: em, seconds: 0 });
        
        let noteSuffix = "";

        // Friday Rule: Leave 1 hour early
        if (record.isFriday) {
           expectedEnd = set(currentDate, { hours: eh - 1, minutes: em, seconds: 0 });
           noteSuffix = " (Thứ 6 về sớm 1h)";
        }

        // Check if left early
        if (record.checkOut < expectedEnd) {
          const diff = differenceInMinutes(expectedEnd, record.checkOut);
          record.earlyMinutes = diff;

          // Check Quota
          const monthKey = format(currentDate, 'yyyy-MM');
          const usedQuota = monthlyQuotaUsage[monthKey] || 0;

          if (diff <= QUOTA_EARLY_LEAVE_MINUTES && usedQuota < QUOTA_EARLY_LEAVE_COUNT) {
            record.status.push(DayStatus.EARLY_ALLOWED);
            monthlyQuotaUsage[monthKey] = usedQuota + 1;
            record.notes.push(`Về sớm ${diff} phút (Trong hạn mức)${noteSuffix}`);
          } else {
            record.status.push(DayStatus.EARLY_VIOLATION);
            if (diff > QUOTA_EARLY_LEAVE_MINUTES) {
                record.notes.push(`Về sớm ${diff} phút (Vượt quá 1.5h)${noteSuffix}`);
            } else {
                record.notes.push(`Về sớm ${diff} phút (Hết quota tháng)${noteSuffix}`);
            }
          }
        }
      }

    } else {
      // No logs found (Absent or Weekend)
      if (!isWknd) {
        record.status.push(DayStatus.ABSENT);
        record.notes.push("Không có dữ liệu chấm công");
      } else {
        record.status.push(DayStatus.WEEKEND);
      }
    }

    results.push(record);
    currentDate = addDays(currentDate, 1);
  }

  return results;
};