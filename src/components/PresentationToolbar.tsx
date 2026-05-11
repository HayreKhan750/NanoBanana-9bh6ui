import type { Presentation } from "@/types/presentation";
import { Download, Eye, EyeOff, BarChart2, Play, ZoomIn, ZoomOut } from "lucide-react";
import { STYLE_PRESETS } from "@/constants/presets";

interface PresentationToolbarProps {
  presentation: Presentation;
  showNotes: boolean;
  showCoach: boolean;
  zoom: number;
  onToggleNotes: () => void;
  onToggleCoach: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onExport: () => void;
  onPresent: () => void;
}

export default function PresentationToolbar({
  presentation,
  showNotes,
  showCoach,
  zoom,
  onToggleNotes,
  onToggleCoach,
  onZoomIn,
  onZoomOut,
  onExport,
  onPresent,
}: PresentationToolbarProps) {
  const preset = STYLE_PRESETS.find((p) => p.id === presentation.theme);

  return (
    <div
      className="flex items-center px-4 py-2.5 gap-4 flex-wrap"
      style={{
        background: "rgba(10,10,15,0.95)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Presentation info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white truncate">{presentation.title || "Untitled"}</div>
          <div className="flex items-center gap-2 text-[10px] text-white/40">
            <span>{presentation.slides?.length || 0} slides</span>
            <span>·</span>
            <span>{presentation.estimatedDuration || Math.ceil((presentation.slides?.length || 0) * 1.5)} min</span>
          </div>
        </div>
        {preset && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span>{preset.emoji}</span>
            <span className="hidden sm:inline">{preset.name}</span>
          </div>
        )}
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomOut}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-mono text-white/40 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={onZoomIn}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.1)" }} />

      {/* Toggle buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleNotes}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: showNotes ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.05)",
            color: showNotes ? "#06B6D4" : "rgba(255,255,255,0.5)",
            border: `1px solid ${showNotes ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          {showNotes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          Notes
        </button>

        <button
          onClick={onToggleCoach}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: showCoach ? "rgba(245,197,24,0.15)" : "rgba(255,255,255,0.05)",
            color: showCoach ? "#F5C518" : "rgba(255,255,255,0.5)",
            border: `1px solid ${showCoach ? "rgba(245,197,24,0.3)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Coach
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.1)" }} />

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>

        <button
          onClick={onPresent}
          className="btn-banana flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs"
        >
          <Play className="w-3.5 h-3.5" />
          Present
        </button>
      </div>
    </div>
  );
}
