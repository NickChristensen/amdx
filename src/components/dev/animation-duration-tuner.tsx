"use client";

import * as React from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DEFAULT_DURATION = 200;
const MAX_DURATION = 2000;
const RANGE_STEP = 25;

function clampDuration(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(MAX_DURATION, Math.max(0, Math.round(value)));
}

export function AnimationDurationTuner() {
  const [duration, setDuration] = React.useState(DEFAULT_DURATION);

  React.useEffect(() => {
    document.documentElement.style.setProperty(
      "--collapsible-duration",
      `${duration}ms`,
    );

    return () => {
      document.documentElement.style.removeProperty("--collapsible-duration");
    };
  }, [duration]);

  const updateDuration = (value: number) => {
    setDuration(clampDuration(value));
  };

  return (
    <Card className="fixed right-4 bottom-4 z-50 w-72 gap-3 shadow-lg" size="sm">
      <CardHeader>
        <CardTitle>Collapse duration</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <label className="flex items-center justify-between gap-3 text-sm font-medium" htmlFor="collapse-duration-range">
          Duration
          <output
            aria-live="polite"
            className="font-mono text-muted-foreground tabular-nums"
            htmlFor="collapse-duration-range"
          >
            {duration}ms
          </output>
        </label>
        <input
          aria-describedby="collapse-duration-range-help"
          className="w-full accent-primary"
          id="collapse-duration-range"
          max={MAX_DURATION}
          min={0}
          onChange={(event) => updateDuration(event.currentTarget.valueAsNumber)}
          step={RANGE_STEP}
          type="range"
          value={duration}
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground" htmlFor="collapse-duration-input">
            Exact value
          </label>
          <input
            className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 font-mono text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            id="collapse-duration-input"
            max={MAX_DURATION}
            min={0}
            onChange={(event) => updateDuration(event.currentTarget.valueAsNumber)}
            step={1}
            type="number"
            value={duration}
          />
          <span className="text-sm text-muted-foreground">ms</span>
        </div>
        <p className="sr-only" id="collapse-duration-range-help">
          Choose a collapse animation duration from 0 to 2000 milliseconds.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setDuration(DEFAULT_DURATION)} size="sm" variant="outline">
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
}
