export interface Habit {
  id: string;
  name: string;
  category: string;
  color: string; // Hex or Tailwind class substring
  createdAt: number;
  isDeleted?: boolean; // New: Soft delete flag
}

export interface DailyLog {
  [dateString: string]: string[]; // Key: YYYY-MM-DD, Value: Array of Habit IDs completed
}

export enum TimeRange {
  WEEK = '1주',
  MONTH = '1개월',
  YEAR = '1년',
}

export interface ChartDataPoint {
  name: string;
  goal: number;
  completed: number;
  amt: number;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string; // Emoji
  score: number; // 0-100 Mock Score
  statusMessage: string;
}