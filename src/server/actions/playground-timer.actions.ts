import { createServerFn } from "@tanstack/react-start";
import type {
  TimerConfig,
  TimerUpdate,
} from "@/features/playground/types/timer.types";

export const startTimerAction = createServerFn()
  .inputValidator((config: TimerConfig) => config)
  .handler(async function* ({ data }) {
    const { duration, interval = 1000 } = data;
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    let now = Date.now();

    while (now < endTime) {
      now = Date.now();
      const elapsedTotalMs = now - startTime;
      const remainingMs = endTime - now;

      yield {
        elapsed: Math.min(duration, Math.floor(elapsedTotalMs / 1000)),
        remaining: Math.max(0, Math.ceil(remainingMs / 1000)),
        total: duration,
      } as TimerUpdate;

      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    yield {
      elapsed: duration,
      remaining: 0,
      total: duration,
    } as TimerUpdate;
  });
