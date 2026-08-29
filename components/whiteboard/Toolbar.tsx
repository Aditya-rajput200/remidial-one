"use client";

import {
  Eraser,
  Flashlight,
  Hand,
  Highlighter,
  Loader2,
  Minus,
  MousePointer2,
  Pencil,
  Presentation,
  Redo2,
  Sparkles,
  Square,
  Undo2,
  Upload,
} from "lucide-react";
import clsx from "clsx";
import { useWhiteboardStore, type WhiteboardTool } from "./state/whiteboardStore";

// Keys mirror WhiteboardPanel's SHORTCUT_TOOLS map — shown here so the
// shortcuts are discoverable instead of hidden trivia.
const DRAW_TOOLS: { id: WhiteboardTool; label: string; key: string; icon: typeof MousePointer2 }[] = [
  { id: "select", label: "Select", key: "V", icon: MousePointer2 },
  { id: "pan", label: "Pan", key: "H", icon: Hand },
  { id: "pen", label: "Pen", key: "P", icon: Pencil },
  { id: "highlighter", label: "Highlighter", key: "G", icon: Highlighter },
  { id: "eraser", label: "Eraser", key: "E", icon: Eraser },
  { id: "rectangle", label: "Rectangle", key: "R", icon: Square },
  { id: "line", label: "Line", key: "L", icon: Minus },
  { id: "laser", label: "Laser pointer", key: "K", icon: Flashlight },
];

const STROKE_COLORS = ["#111111", "#DC2626", "#2563EB", "#16A34A", "#EA580C"];

type Props = {
  canEdit: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onInsertFile: () => void;
  isMentor?: boolean;
  isGeneratingNotes?: boolean;
  onGenerateNotes?: () => void;
  isPresenting?: boolean;
  onTogglePresent?: () => void;
};

function ToolButton({
  label,
  shortcut,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "flex h-10 w-10 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-30",
        active ? "bg-[#C4EE40] text-black shadow-sm" : "text-black/60 hover:bg-black/[0.06] hover:text-black",
      )}
    >
      {children}
    </button>
  );
}

export function Toolbar({
  canEdit,
  onUndo,
  onRedo,
  onInsertFile,
  isMentor,
  isGeneratingNotes,
  onGenerateNotes,
  isPresenting,
  onTogglePresent,
}: Props) {
  const tool = useWhiteboardStore((s) => s.tool);
  const setTool = useWhiteboardStore((s) => s.setTool);
  const strokeColor = useWhiteboardStore((s) => s.strokeColor);
  const setStrokeColor = useWhiteboardStore((s) => s.setStrokeColor);
  const strokeWidth = useWhiteboardStore((s) => s.strokeWidth);
  const setStrokeWidth = useWhiteboardStore((s) => s.setStrokeWidth);

  const showStrokeOptions = tool === "pen" || tool === "highlighter" || tool === "rectangle" || tool === "line";

  return (
    // Floats centered above the canvas, Excalidraw-style, instead of taking
    // up a fixed side column — the board itself renders full-bleed behind it.
    <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-3">
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-black/[0.06] bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur">
        <div className="flex items-center gap-1">
          {DRAW_TOOLS.map(({ id, label, key, icon: Icon }) => (
            <ToolButton
              key={id}
              label={label}
              shortcut={key}
              active={tool === id}
              disabled={!canEdit}
              onClick={() => setTool(id)}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
            </ToolButton>
          ))}
        </div>

        <div className="mx-1 h-6 w-px shrink-0 bg-black/[0.08]" />

        <ToolButton label="Add image or PDF" disabled={!canEdit} onClick={onInsertFile}>
          <Upload className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
        </ToolButton>

        <div className="mx-1 h-6 w-px shrink-0 bg-black/[0.08]" />

        <div className="flex items-center gap-1">
          <ToolButton label="Undo" shortcut="Ctrl+Z" disabled={!canEdit} onClick={onUndo}>
            <Undo2 className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </ToolButton>
          <ToolButton label="Redo" shortcut="Ctrl+Shift+Z" disabled={!canEdit} onClick={onRedo}>
            <Redo2 className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </ToolButton>
        </div>

        {onTogglePresent && (
          <>
            <div className="mx-1 h-6 w-px shrink-0 bg-black/[0.08]" />
            <ToolButton
              label={isPresenting ? "Stop presenting" : "Present"}
              active={isPresenting}
              disabled={!canEdit}
              onClick={onTogglePresent}
            >
              <Presentation className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
            </ToolButton>
          </>
        )}

        {isMentor && onGenerateNotes && (
          <>
            <div className="mx-1 h-6 w-px shrink-0 bg-black/[0.08]" />
            <ToolButton
              label="Generate class notes"
              disabled={isGeneratingNotes}
              onClick={onGenerateNotes}
            >
              {isGeneratingNotes ? (
                <Loader2 className="h-[18px] w-[18px] animate-spin" strokeWidth={1.75} aria-hidden />
              ) : (
                <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              )}
            </ToolButton>
          </>
        )}

        {showStrokeOptions && (
          <>
            <div className="mx-1 h-6 w-px shrink-0 bg-black/[0.08]" />
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                {STROKE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Color ${color}`}
                    aria-pressed={strokeColor === color}
                    onClick={() => setStrokeColor(color)}
                    className={clsx(
                      "h-5 w-5 rounded-full ring-2 ring-offset-2 transition-shadow",
                      strokeColor === color ? "ring-[#7A9C1F]" : "ring-transparent",
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-20 accent-[#7A9C1F]"
                aria-label="Stroke width"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
