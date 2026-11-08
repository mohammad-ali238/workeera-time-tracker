const FALLBACK_TIMEZONES = [
  "UTC",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Kathmandu",
  "Asia/Dhaka",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Africa/Cairo",
  "Africa/Lagos",
  "Africa/Johannesburg",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "America/Mexico_City",
  "Australia/Sydney",
  "Australia/Perth",
  "Pacific/Auckland",
];

export function getAllTimezones(): string[] {
  try {
    const intl = Intl as unknown as {
      supportedValuesOf?: (key: string) => string[];
    };
    const list = intl.supportedValuesOf?.("timeZone");
    if (Array.isArray(list) && list.length > 0) return list;
  } catch {
    // ignore
  }
  return FALLBACK_TIMEZONES;
}