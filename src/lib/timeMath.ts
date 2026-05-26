// src/lib/timeMath.ts
// Core math for the Start Time / End Time -> Total Hours -> Estimated Pay feature.
// Times are stored internally as "h:mm AM/PM" strings (12-hour). All math goes
// through minutes-since-midnight so it is exact. Verified by a test suite against
// the user's real timesheet data (overnight rollover, midnight/noon, bad input).

/** Parse "11:30 AM" / "5:00 PM" / "17:00" -> minutes since midnight (0..1439), or null. */
export function parseTimeToMinutes(input: string | null | undefined): number | null {
  if (!input || typeof input !== 'string') return null;
  const s = input.trim().toUpperCase();

  // 12-hour with AM/PM
  let m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (m) {
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ap = m[3];
    if (h < 1 || h > 12 || min > 59) return null;
    if (ap === 'AM') { if (h === 12) h = 0; }
    else { if (h !== 12) h += 12; }
    return h * 60 + min;
  }

  // 24-hour "HH:MM" (accepted as fallback)
  m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    const h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (h > 23 || min > 59) return null;
    return h * 60 + min;
  }

  return null;
}

/** Difference in minutes from start to end, rolling over midnight if end <= start. */
export function diffMinutes(startStr: string, endStr: string): number | null {
  const a = parseTimeToMinutes(startStr);
  const b = parseTimeToMinutes(endStr);
  if (a === null || b === null) return null;
  let diff = b - a;
  if (diff < 0) diff += 24 * 60; // overnight shift
  return diff;
}

/** Format total minutes as the user's "5h 30m" convention (5.30 = 5h 30m). */
export function formatHM(totalMin: number | null): string {
  if (totalMin === null) return '';
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

/** Exact decimal hours for pay math (h:mm interpretation). */
export function totalHoursDecimal(totalMin: number | null): number {
  if (totalMin === null) return 0;
  return totalMin / 60;
}

/** Estimated pay = exact decimal hours * rate. Exact math (user chose $64.67 over $64.60). */
export function computePay(totalMin: number | null, hourlyRate: number): number {
  if (totalMin === null || !hourlyRate) return 0;
  return (totalMin / 60) * hourlyRate;
}

/**
 * Given a row's field values, find the Start Time and End Time fields and
 * compute Total Hours (in minutes) for the row, or null if either is missing/invalid.
 * `fields` is the table's field list; `row` is the row data object.
 */
export function computeRowMinutes(
  fields: Array<{ id: string; type: string }>,
  row: Record<string, any>
): number | null {
  const startField = fields.find(f => f.type === 'Start Time');
  const endField = fields.find(f => f.type === 'End Time');
  if (!startField || !endField) return null;
  const startVal = row[startField.id];
  const endVal = row[endField.id];
  if (!startVal || !endVal) return null;
  return diffMinutes(startVal, endVal);
}