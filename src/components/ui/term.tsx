"use client";

import { useRef, useState, type MouseEvent, type PointerEvent } from "react";

import type { AgentMdxComponentDocs } from "@/lib/agent-mdx-component-docs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Props for an inline term with a short definition shown on focus, hover, or touch activation. */
export type TermProps = {
  /** The term displayed in the document and used as the focusable trigger. */
  children: string;

  /** A short definition shown in the tooltip. */
  definition: string;
};

export const termMdxDocs = {
  description:
    "Use to provide a definition of jargon, acronyms, technical concepts, or domain-specific terms that readers may not know. Renders in a tooltip. Define only the first occurrence in plain language.",
  flow: "inline",
  defaults: {},
  guidance: [
    "Use Term for a specialized or unfamiliar term at its first occurrence in a report.",
    "Keep the definition short and useful. Write later occurrences as plain text.",
    "Keep essential information in the surrounding prose because the definition is supplementary.",
  ],
  examples: [
    {
      title: "Define a term on first use",
      mdx: 'A <Term definition="A structured description of a service interface.">contract</Term> helps readers understand the API. Later references to the contract stay plain text.',
    },
  ],
} as const satisfies AgentMdxComponentDocs<TermProps>;

export function Term({ children, definition }: TermProps) {
  const [open, setOpen] = useState(false);
  const touchPointerDown = useRef(false);
  const lastTouchPointerUp = useRef<number | null>(null);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    touchPointerDown.current = event.pointerType === "touch";

    if (touchPointerDown.current) {
      event.preventDefault();
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (touchPointerDown.current) {
      event.preventDefault();
      lastTouchPointerUp.current = event.timeStamp;
      setOpen((currentOpen) => !currentOpen);
    }

    touchPointerDown.current = false;
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const followsTouch =
      lastTouchPointerUp.current !== null &&
      event.timeStamp - lastTouchPointerUp.current < 1000;

    lastTouchPointerUp.current = null;

    if (followsTouch) {
      event.preventDefault();
    }
  };

  const handlePointerCancel = () => {
    touchPointerDown.current = false;
  };

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onClick={handleClick}
          className="inline cursor-help rounded-sm border-0 bg-transparent p-0 font-inherit text-inherit underline decoration-dotted decoration-primary/60 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>{definition}</TooltipContent>
    </Tooltip>
  );
}
