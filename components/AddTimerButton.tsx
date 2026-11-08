"use client";

import { PlusIcon } from "./icons";
import { MAX_TIMERS } from "@/lib/types";

interface Props {
  canAdd: boolean;
  hasStartedAny: boolean;
  count: number;
  onClick: () => void;
}

export function AddTimerButton({ canAdd, hasStartedAny, count, onClick }: Props) {
  if (!hasStartedAny) return null;

  const atMax = count >= MAX_TIMERS;

  return (
    <button
      onClick={onClick}
      disabled={!canAdd || atMax}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted"
    >
      <PlusIcon width={16} height={16} />
      {atMax ? `${MAX_TIMERS} / ${MAX_TIMERS} timers` : "Add timer"}
    </button>
  );
}