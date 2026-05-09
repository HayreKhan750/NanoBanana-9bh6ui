import { useState } from "react";
import { Download, X, FileText, File, Code, ImageIcon, Loader2, CheckCircle } from "lucide-react";
import type { Presentation } from "@/types/presentation";
import { exportToPPTX, exportToPDF, exportToJSON } from "@/lib/pptExport";
import { toast } from "sonner";

interface ExportDialogProps {
  presentation: Presentation;
  onClose: () => void;
}

const EXPORT_OPTIONS = [
  {
    id: "pptx",
    label: "PowerPoint (PPTX)",
    description: "Full presentation with real layouts, speaker notes, charts",
    icon: FileText,
    color: "#F97316",
    badge: "Recommended",
    fn: exportToPPTX,
  },
  {
    id: "pdf",
    label: "HTML / PDF",
    description: "Static export for print or sharing (open & print to PDF)",
    icon: File,
    color: "#EF4444",
    badge: null,
    fn: exportToPDF,
  },
  {
    id: "json",
    label: "JSON Data",
    description: "Raw presentation data for developers",
    icon: Code,
    color: "#06B6D4",
    badge: null,
    fn: exportToJSON,
  },
  {
    id: "png",
    label: "PNG Slides",
    description: "Individual high-resolution slide images",
    icon: ImageIcon,
    color: "#8B5CF6",
    badge: "Coming Soon",
    fn: null,
  },
];

export default function ExportDialog({ presentation, onClose }: ExportDialogProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);

  async function handleExport(option: typeof EXPORT_OPTIONS[0]) {
    if (!option.fn || exporting) return;
    setExporting(option.id);
    try {
      await option.fn(presentation);
      setCompleted((prev) => [...prev, option.id]);
      toast.success(`${option.label} exported successfully!`);
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass-panel w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Export Presentation</h3>
            <p className="text-xs text-white/40">{presentation.title} · {presentation.slides.length} slides</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: "rgba(255,255,255,0.06)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Export Options */}
        <div className="space-y-2">
          {EXPORT_OPTIONS.map((opt) => {
            const isExporting = exporting === opt.id;
            const isDone = completed.includes(opt.id);
            const isDisabled = opt.badge === "Coming Soon" || (!!exporting && exporting !== opt.id);
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                onClick={() => handleExport(opt)}
                disabled={isDisabled}
                className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all disabled:opacity-40"
                style={{
                  background: isDone ? `${opt.color}08` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isDone ? `${opt.color}30` : "rgba(255,255,255,0.08)"}`,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => { if (!isDisabled) { e.currentTarget.style.background = `${opt.color}08`; e.currentTarget.style.borderColor = `${opt.color}30`; } }}
                onMouseLeave={(e) => { if (!isDone) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; } }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${opt.color}15` }}>
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: opt.color }} /> :
                   isDone ? <CheckCircle className="w-4 h-4" style={{ color: opt.color }} /> :
                   <Icon className="w-4 h-4" style={{ color: opt.color }} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-white">{opt.label}</span>
                    {opt.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: opt.badge === "Recommended" ? "rgba(245,197,24,0.15)" : "rgba(255,255,255,0.06)", color: opt.badge === "Recommended" ? "#F5C518" : "rgba(255,255,255,0.4)" }}>
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/40">{opt.description}</p>
                </div>

                {!isExporting && !isDone && <Download className="w-4 h-4 text-white/20 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        <p className="text-center text-[10px] text-white/20 mt-5">Generated by Nano Banana AI Presentation Studio</p>
      </div>
    </div>
  );
}
