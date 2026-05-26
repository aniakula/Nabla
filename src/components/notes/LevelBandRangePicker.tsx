"use client";

import { LEVEL_BAND_ORDER, type LevelBand } from "@/types/curriculum";
import { useState } from "react";

const BAND_META: Record<LevelBand, { label: string; grades: string }> = {
  elementary: { label: "Elementary", grades: "K–5" },
  middle_school: { label: "Middle", grades: "6–8" },
  high_school: { label: "High School", grades: "9–12" },
  advanced: { label: "Advanced", grades: "AP+" },
};

type ActiveHandle = "start" | "end" | null;
type Mode = "range" | "single";

type Props = {
  startIdx: number;
  endIdx: number;
  onChange: (startIdx: number, endIdx: number) => void;
};

export function LevelBandRangePicker({ startIdx, endIdx, onChange }: Props) {
  const [mode, setMode] = useState<Mode>("range");
  const [activeHandle, setActiveHandle] = useState<ActiveHandle>(null);

  // ── Mode switching ──────────────────────────────────────────────────────────
  function switchMode(next: Mode) {
    if (next === mode) return;
    setActiveHandle(null);
    if (next === "single") {
      // Collapse to the current lower bound
      onChange(startIdx, startIdx);
    } else {
      // Restore full range
      onChange(0, 3);
    }
    setMode(next);
  }

  // ── Single-mode click: immediate one-step selection ─────────────────────────
  function handleSingleClick(idx: number) {
    onChange(idx, idx);
  }

  // ── Range-mode click: two-phase handle selection ────────────────────────────
  function handleRangeClick(idx: number) {
    const isStartNode = idx === startIdx;
    const isEndNode = idx === endIdx;
    const collapsed = startIdx === endIdx;

    if (activeHandle === null) {
      if (isStartNode) setActiveHandle("start");
      else if (isEndNode) setActiveHandle("end");
      return;
    }

    if (activeHandle === "start") {
      if (isStartNode) {
        setActiveHandle(collapsed ? "end" : null);
        return;
      }
      if (isEndNode && !collapsed) {
        setActiveHandle("end");
        return;
      }
      onChange(Math.min(idx, endIdx), endIdx);
      return;
    }

    if (activeHandle === "end") {
      if (isEndNode) {
        setActiveHandle(collapsed ? "start" : null);
        return;
      }
      if (isStartNode && !collapsed) {
        setActiveHandle("start");
        return;
      }
      onChange(startIdx, Math.max(idx, startIdx));
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setActiveHandle(null);
    }
  }

  const isSingle = mode === "single";

  return (
    <div onBlur={handleBlur}>
      {/* Header row: label + mode toggle */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Level{isSingle ? "" : " range"}
          </p>
          {!isSingle && activeHandle && (
            <p className="font-mono text-[10px] text-coral">
              Moving{" "}
              <span className="font-semibold">
                {activeHandle === "start" ? "lower" : "upper"} bound
              </span>
              {" "}— click a level
            </p>
          )}
          {isSingle && (
            <p className="font-mono text-[10px] text-ink-muted">
              click any level to select
            </p>
          )}
        </div>

        {/* Mode toggle pills */}
        <div className="flex shrink-0 gap-1 rounded-xl border-2 border-ink/20 bg-cream p-0.5">
          {(["range", "single"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`rounded-lg px-2.5 py-1 font-mono text-[10px] font-semibold capitalize transition-all ${
                mode === m
                  ? "bg-coral text-offwhite shadow-cartoon-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Track */}
      <div className="relative">
        {/* Background track line */}
        <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[1.15rem] h-1 rounded-full bg-ink/15" />

        {/* Active range / single-selection fill */}
        {isSingle ? (
          // Single mode: just a dot marker, no fill
          <div
            className="pointer-events-none absolute top-[0.9rem] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-coral transition-all duration-150"
            style={{
              left: `calc(12.5% + ${(startIdx / 3) * 75}%)`,
            }}
          />
        ) : (
          // Range mode: fill between handles
          <div
            className="pointer-events-none absolute top-[1.15rem] h-1 rounded-full bg-coral transition-all duration-150"
            style={{
              left: `calc(12.5% + ${(startIdx / 3) * 75}%)`,
              right: `calc(12.5% + ${((3 - endIdx) / 3) * 75}%)`,
            }}
          />
        )}

        {/* Four columns — each is its own click target */}
        <div className="grid grid-cols-4">
          {LEVEL_BAND_ORDER.map((band, idx) => {
            const isStart = idx === startIdx;
            const isEnd = idx === endIdx;
            const isHandle = isStart || isEnd;
            const inRange = idx >= startIdx && idx <= endIdx;
            const isActiveHandle =
              (activeHandle === "start" && isStart) ||
              (activeHandle === "end" && isEnd);

            // ── Dot style ──────────────────────────────────────────────────
            let dotClass =
              "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-150 ";

            if (isSingle) {
              // Single mode: selected node is highlighted, others are dim
              if (isStart) {
                dotClass +=
                  "border-ink bg-coral scale-110 shadow-[0_0_0_3px_rgba(255,155,113,0.35)]";
              } else {
                dotClass += "border-ink/30 bg-offwhite";
              }
            } else {
              // Range mode
              if (isActiveHandle) {
                dotClass +=
                  "border-coral bg-coral scale-125 shadow-[0_0_0_3px_rgba(255,155,113,0.35)]";
              } else if (isHandle) {
                dotClass += "border-ink bg-coral";
              } else if (inRange) {
                dotClass += "border-ink/40 bg-coral/40";
              } else {
                dotClass += "border-ink/30 bg-offwhite";
              }
            }

            // Cursor: always pointer in single mode; in range mode, only pointer
            // on handles when no handle is active, or always when one is active
            const canClick =
              isSingle ||
              activeHandle !== null ||
              isHandle;
            const cursorClass = canClick ? "cursor-pointer" : "cursor-default";

            return (
              <button
                key={band}
                type="button"
                onClick={() =>
                  isSingle ? handleSingleClick(idx) : handleRangeClick(idx)
                }
                className={`${cursorClass} flex flex-col items-center gap-2.5 pb-0 pt-1 focus-visible:outline-none`}
                aria-label={`${BAND_META[band].label} (${BAND_META[band].grades})${
                  !isSingle && isHandle
                    ? isStart && isEnd
                      ? " — single point"
                      : isStart
                        ? " — lower bound"
                        : " — upper bound"
                    : ""
                }`}
                aria-pressed={isSingle ? isStart : isHandle ? isActiveHandle : undefined}
              >
                <div className={dotClass}>
                  {/* White centre dot on handles */}
                  {(isSingle ? isStart : isHandle) && (
                    <span className="h-2 w-2 rounded-full bg-offwhite" />
                  )}
                </div>

                <div className="flex flex-col items-center">
                  <span
                    className={`font-display text-xs font-semibold transition-colors ${
                      isSingle
                        ? isStart
                          ? "text-coral"
                          : "text-ink-muted"
                        : inRange
                          ? isActiveHandle
                            ? "text-coral"
                            : "text-ink"
                          : "text-ink-muted"
                    }`}
                  >
                    {BAND_META[band].label}
                  </span>
                  <span className="font-mono text-[10px] text-ink-muted">
                    {BAND_META[band].grades}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <p className="mt-3 font-mono text-xs text-ink-muted">
        Selected:{" "}
        <span className="font-semibold text-ink">
          {isSingle || startIdx === endIdx
            ? BAND_META[LEVEL_BAND_ORDER[startIdx]].label
            : `${BAND_META[LEVEL_BAND_ORDER[startIdx]].label} → ${BAND_META[LEVEL_BAND_ORDER[endIdx]].label}`}
        </span>
        {!isSingle && activeHandle === null && (
          <span className="ml-2 text-ink-muted/60">— click a handle to adjust</span>
        )}
      </p>
    </div>
  );
}

/** Convert [startIdx, endIdx] to a comma-separated level_band string for the DB */
export function levelBandRangeToString(startIdx: number, endIdx: number): string {
  return LEVEL_BAND_ORDER.slice(startIdx, endIdx + 1).join(",");
}
