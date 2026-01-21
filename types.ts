
export type User = 'Jorge' | 'William';

export interface TripState {
  ida: boolean;
  regresso: boolean;
}

export interface DayRecord {
  jorge: TripState;
  william: TripState;
}

export interface MonthlyData {
  [dateKey: string]: DayRecord;
}

export interface Holiday {
  day: number;
  month: number;
  name: string;
}
