"use client";

import * as React from "react";
import { Gauge, Minimize2, RotateCcw, SlidersHorizontal } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const PANEL_ID = "knobs-panel";

type RangeKnobDefinition = {
  id: string;
  kind: "range";
  label: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
};

type StepsKnobDefinition = {
  id: string;
  kind: "steps";
  label: string;
  defaultValue: string;
  options: readonly {
    label: string;
    value: string;
  }[];
};

type ToggleKnobDefinition = {
  id: string;
  kind: "toggle";
  label: string;
  defaultValue: boolean;
};

type KnobDefinition =
  | RangeKnobDefinition
  | StepsKnobDefinition
  | ToggleKnobDefinition;

type KnobValue = KnobDefinition["defaultValue"];
type KnobValues = Record<string, KnobValue>;

const KNOB_DEFINITIONS = [
  {
    id: "slow-transitions",
    kind: "toggle",
    label: "Slow transitions",
    defaultValue: false,
  },
] as const satisfies readonly KnobDefinition[];

function getDefaultKnobValues(): KnobValues {
  return Object.fromEntries(
    KNOB_DEFINITIONS.map((definition) => [
      definition.id,
      definition.defaultValue,
    ]),
  );
}

function KnobControl({
  definition,
  value,
  onValueChange,
  onReset,
}: {
  definition: KnobDefinition;
  value: KnobValue;
  onValueChange: (value: KnobValue) => void;
  onReset: () => void;
}) {
  const isChanged = value !== definition.defaultValue;
  const resetButton = (
    <Button
      aria-label={`Reset ${definition.label}`}
      disabled={!isChanged}
      onClick={onReset}
      size="icon-xs"
      title={`Reset ${definition.label}`}
      type="button"
      variant="ghost"
    >
      <RotateCcw data-icon="inline-start" />
    </Button>
  );

  switch (definition.kind) {
    case "range": {
      const rangeValue =
        typeof value === "number" ? value : definition.defaultValue;
      const inputId = `${definition.id}-range`;

      return (
        <div
          className={cn(
            "-mx-2 flex flex-col gap-2 rounded-md px-2 py-1.5",
            isChanged && "bg-muted/50",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              {resetButton}
              <label className="text-sm font-medium" htmlFor={inputId}>
                {definition.label}
              </label>
            </div>
            <output className="font-mono text-muted-foreground tabular-nums">
              {rangeValue}
            </output>
          </div>
          <input
            className="w-full accent-primary"
            id={inputId}
            max={definition.max}
            min={definition.min}
            onChange={(event) =>
              onValueChange(event.currentTarget.valueAsNumber)
            }
            step={definition.step}
            type="range"
            value={rangeValue}
          />
        </div>
      );
    }
    case "steps": {
      const selectedValue =
        typeof value === "string" ? value : definition.defaultValue;

      return (
        <div
          className={cn(
            "-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-1.5",
            isChanged && "bg-muted/50",
          )}
        >
          <div className="flex items-center gap-1">
            {resetButton}
            <span className="text-sm font-medium">{definition.label}</span>
          </div>
          <ToggleGroup
            aria-label={definition.label}
            onValueChange={(nextValue) => {
              if (nextValue) {
                onValueChange(nextValue);
              }
            }}
            size="sm"
            spacing={0}
            type="single"
            value={selectedValue}
            variant="outline"
          >
            {definition.options.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      );
    }
    case "toggle": {
      const isPressed =
        typeof value === "boolean" ? value : definition.defaultValue;

      return (
        <div
          className={cn(
            "-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-1.5",
            isChanged && "bg-muted/50",
          )}
        >
          <div className="flex items-center gap-1">
            {resetButton}
            <span className="text-sm font-medium">{definition.label}</span>
          </div>
          <Toggle
            aria-label={definition.label}
            className="transition-none"
            onPressedChange={(pressed) => onValueChange(pressed)}
            pressed={isPressed}
            size="sm"
            variant="outline"
          >
            <Gauge />
          </Toggle>
        </div>
      );
    }
  }
}

export function KnobsPanel() {
  const [values, setValues] = React.useState<KnobValues>(
    getDefaultKnobValues,
  );
  const [isOpen, setIsOpen] = React.useState(false);
  const slowTransitions = values["slow-transitions"] === true;

  React.useEffect(() => {
    const root = document.documentElement;

    if (slowTransitions) {
      root.dataset.debugTransitions = "slow";
    } else {
      delete root.dataset.debugTransitions;
    }

    return () => {
      delete root.dataset.debugTransitions;
    };
  }, [slowTransitions]);

  const updateKnobValue = (id: string, value: KnobValue) => {
    setValues((currentValues) => ({
      ...currentValues,
      [id]: value,
    }));
  };

  if (!isOpen) {
    return (
      <Button
        aria-controls={PANEL_ID}
        aria-expanded={false}
        aria-label="Open knobs panel"
        className="fixed right-4 bottom-4 z-50 shadow-lg"
        onClick={() => setIsOpen(true)}
        size="icon-sm"
        title="Open knobs panel"
        variant="outline"
      >
        <SlidersHorizontal data-icon="inline-start" />
      </Button>
    );
  }

  return (
    <Card
      className="fixed right-4 bottom-4 z-50 w-72 gap-3 shadow-lg"
      id={PANEL_ID}
      size="sm"
    >
      <CardHeader>
        <CardTitle>Knobs</CardTitle>
        <CardAction>
          <Button
            aria-controls={PANEL_ID}
            aria-expanded={true}
            aria-label="Collapse knobs panel"
            onClick={() => setIsOpen(false)}
            size="icon-xs"
            title="Collapse knobs panel"
            variant="ghost"
          >
            <Minimize2 data-icon="inline-start" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {KNOB_DEFINITIONS.map((definition) => (
          <KnobControl
            definition={definition}
            key={definition.id}
            onReset={() =>
              updateKnobValue(definition.id, definition.defaultValue)
            }
            onValueChange={(value) => updateKnobValue(definition.id, value)}
            value={values[definition.id]}
          />
        ))}
      </CardContent>
    </Card>
  );
}
