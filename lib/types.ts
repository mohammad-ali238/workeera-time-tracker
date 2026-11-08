export type TimerStatus = "idle" | "running" | "paused" | "stopped";

export interface TimerEntry {
  start: number; // epoch ms
  end: number; // epoch ms
  note?: string;
  manual?: boolean;
}

export interface TimerSettings {
  projectName: string;
  clientName: string;
  timezone: string;
  currency: string;
  hourlyRate: number;
  deadline?: string;
  maxMinutes?: number;
  autoStop: boolean;
}

export interface Timer {
  id: string;
  settings: TimerSettings;
  status: TimerStatus;
  startedAt: number | null;
  accumulatedMs: number;
  entries: TimerEntry[];
  createdAt: number;
}

export const MAX_TIMERS = 5;