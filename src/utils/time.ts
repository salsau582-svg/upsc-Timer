/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Timezone offset for Asia/Kolkata (UTC + 5:30 = 330 minutes)
export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Returns a Date object shifted into IST context.
 */
export function getISTDate(timestamp = Date.now()): Date {
  const utc = timestamp + new Date(timestamp).getTimezoneOffset() * 60 * 1000;
  return new Date(utc + IST_OFFSET_MS);
}

/**
 * Formats epoch ms into YYYY-MM-DD string in Asia/Kolkata timezone.
 */
export function getISTDateString(timestamp = Date.now()): string {
  const ist = getISTDate(timestamp);
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, '0');
  const d = String(ist.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats epoch ms into 24-hour time string HH:mm:ss in IST.
 */
export function formatISTTime(timestamp = Date.now(), includeSeconds = true): string {
  const ist = getISTDate(timestamp);
  const h = String(ist.getHours()).padStart(2, '0');
  const m = String(ist.getMinutes()).padStart(2, '0');
  if (!includeSeconds) return `${h}:${m}`;
  const s = String(ist.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/**
 * Formats duration in minutes to readable "Xh Ym" or "Ym"
 */
export function formatDuration(minutes: number): string {
  if (isNaN(minutes) || minutes <= 0) return '0m';
  const totalMins = Math.round(minutes);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

/**
 * Formats duration in milliseconds to "HH:mm:ss" for active stopwatch
 */
export function formatStopwatchMs(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':');
}

/**
 * Returns human-readable date in IST, e.g. "Monday, 03 Nov 2026"
 */
export function formatISTHumanDate(timestamp = Date.now()): string {
  const ist = getISTDate(timestamp);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayName = days[ist.getDay()];
  const dayNum = String(ist.getDate()).padStart(2, '0');
  const monthName = months[ist.getMonth()];
  const year = ist.getFullYear();
  return `${dayName}, ${dayNum} ${monthName} ${year}`;
}

/**
 * Calculate elapsed and remaining time today in IST.
 * Returns { elapsedMinutes, remainingMinutes, elapsedPercent }
 */
export function getTodayTimeMetrics(timestamp = Date.now()): {
  elapsedMinutes: number;
  remainingMinutes: number;
  elapsedPercent: number;
} {
  const ist = getISTDate(timestamp);
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const seconds = ist.getSeconds();

  const elapsedMinutes = hours * 60 + minutes + Math.round(seconds / 60);
  const remainingMinutes = Math.max(0, 1440 - elapsedMinutes);
  const elapsedPercent = Math.min(100, Math.round((elapsedMinutes / 1440) * 100));

  return { elapsedMinutes, remainingMinutes, elapsedPercent };
}

/**
 * Converts a date string "YYYY-MM-DD" and time string "HH:mm" in IST to UTC epoch ms.
 */
export function istDateTimeToEpoch(dateStr: string, timeStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hours, mins] = timeStr.split(':').map(Number);
  // Construct UTC date as if it were UTC, then subtract IST offset
  const utcGuess = Date.UTC(y, m - 1, d, hours, mins, 0);
  return utcGuess - IST_OFFSET_MS;
}

/**
 * Extracts "HH:mm" from an epoch timestamp in IST.
 */
export function epochToISTTimeString(timestamp: number): string {
  const ist = getISTDate(timestamp);
  const h = String(ist.getHours()).padStart(2, '0');
  const m = String(ist.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Checks if two time intervals [startA, endA] and [startB, endB] overlap.
 */
export function doIntervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

/**
 * Computes how many minutes of an interval [start, end] belong to a specific IST date (YYYY-MM-DD).
 * Accurately handles activities crossing midnight.
 */
export function getDurationForDate(
  start: number,
  end: number,
  targetDateStr: string
): number {
  if (end <= start) return 0;

  // Day start and end for target date in IST
  const [y, m, d] = targetDateStr.split('-').map(Number);
  const dayStartEpoch = Date.UTC(y, m - 1, d, 0, 0, 0) - IST_OFFSET_MS;
  const dayEndEpoch = Date.UTC(y, m - 1, d + 1, 0, 0, 0) - IST_OFFSET_MS;

  const overlapStart = Math.max(start, dayStartEpoch);
  const overlapEnd = Math.min(end, dayEndEpoch);

  if (overlapStart >= overlapEnd) return 0;
  return Math.round((overlapEnd - overlapStart) / (1000 * 60));
}

/**
 * Generates array of 7 dates for the week containing `targetDateStr` (Monday to Sunday).
 */
export function getWeekDaysForDate(targetDateStr: string): string[] {
  const [y, m, d] = targetDateStr.split('-').map(Number);
  const dateUtc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  // In JS getUTCDay: 0 is Sun, 1 is Mon, 2 is Tue ... 6 is Sat
  const dayOfWeek = dateUtc.getUTCDay();
  // We want Monday as 0:
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(dateUtc);
    dayDate.setUTCDate(dateUtc.getUTCDate() + diffToMonday + i);
    const yr = dayDate.getUTCFullYear();
    const mo = String(dayDate.getUTCMonth() + 1).padStart(2, '0');
    const dt = String(dayDate.getUTCDate()).padStart(2, '0');
    days.push(`${yr}-${mo}-${dt}`);
  }
  return days;
}
