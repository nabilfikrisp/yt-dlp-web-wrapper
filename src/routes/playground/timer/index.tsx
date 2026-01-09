import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type {
  TimerConfig,
  TimerUpdate,
} from "@/features/playground/types/timer.types";
import { startTimerAction } from "@/server/actions/playground-timer.actions";

export const Route = createFileRoute("/playground/timer/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [timerState, setTimerState] = useState<TimerUpdate | null>(null);

  const startTimerStream = async (config: TimerConfig) => {
    for await (const update of await startTimerAction({ data: config })) {
      setTimerState(update);
    }
  };

  return (
    <div>
      {timerState !== null ? (
        <>
          <div>elapsed: {timerState.elapsed}</div>
          <div>remaining: {timerState.remaining}</div>
          <div>total: {timerState.total}</div>
          <Button>Stop Timer</Button>
        </>
      ) : (
        <Button
          onClick={() => startTimerStream({ duration: 60, interval: 1000 })}
        >
          Start 60 sec
        </Button>
      )}
    </div>
  );
}
