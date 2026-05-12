export function assertDateParts(parts) {
  if (!parts || typeof parts !== 'object') {
    throw new TypeError('dateParts must be an object: { year, month, day }');
  }

  const { year, month, day } = parts;
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new TypeError('year, month, and day must be integers');
  }

  if (month < 1 || month > 12) {
    throw new RangeError('month must be between 1 and 12');
  }

  if (day < 1 || day > 31) {
    throw new RangeError('day must be between 1 and 31');
  }
}

export function normalizeCalendarId(calendar) {
  if (typeof calendar !== 'string') {
    throw new TypeError('calendar must be a string');
  }

  return calendar.trim().toLowerCase();
}
