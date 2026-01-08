export type TimerUpdate = {
  elapsed: number;
  remaining: number;
  total: number;
};

export interface TimerConfig {
  duration: number; // seconds
  interval: number; // milliseconds
}

