import { useMemo } from "react";
import type { Slide } from "@/types/presentation";

interface SlidePreviewProps {
  slide: Slide;
  isActive?: boolean;
  onClick?: () => void;
  scale?: number;
}

const SLIDE_TYPE_ACCENT: Record<string, string> = {
  title: "#F5C518",
  agenda: "#06B6D4",
  section: "#8B5CF6",
  concept: "#F5C518",
  data: "#10B981",
  infographic: "#F97316",
  quote: "#EC4899",
  comparison: "#8B5CF6",
  timeline: "#06B6D4",
  summary: "#F5C518",
  cta: "#F5C518",
};

const TYPE_LABELS: Record<string, string> = {
  title: "TITLE",
  agenda: "AGENDA",
  section: "SECTION",
  concept: "CONCEPT",
  data: "DATA",
  infographic: "INFO",
  quote: "QUOTE",
  comparison: "COMPARE",
  timeline: "TIMELINE",
  summary: "SUMMARY",
  cta: "CTA",
};

export default function SlidePreview({ slide, isActive, onClick }: SlidePreviewProps) {
  const accent = useMemo(() => SLIDE_TYPE_ACCENT[slide.type] || "#F5C518", [slide.type]);
  const hasImage = !!slide.visualUrl;

  return (
    <div
      className={`slide-thumbnail ${isActive ? "active" : ""}`}
      onClick={onClick}
      style={{
        background: slide.backgroundColor || "#0A0A0F",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* AI-generated background image */}
      {hasImage && (
        <img
          src={slide.visualUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: slide.type === "title" || slide.type === "cta" ? 0.6 : 0.35 }}
        />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: hasImage
            ? "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)"
            : `linear-gradient(135deg, ${slide.backgroundColor || "#0A0A0F"}, rgba(0,0,0,0.5))`,
        }}
      />

      {/* Accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }} />

      {/* Type badge */}
      <div
        className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider"
        style={{ background: `${accent}25`, color: accent, border: `1px solid ${accent}40` }}
      >
        {TYPE_LABELS[slide.type] || slide.type?.toUpperCase() || "SLIDE"}
      </div>

      {/* Slide number */}
      <div className="absolute top-1.5 right-1.5 text-[8px] font-mono text-white/30">
        {String(slide.order).padStart(2, "0")}
      </div>

      {/* Content preview */}
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <p
          className="text-white font-bold leading-tight truncate"
          style={{ fontSize: "9px" }}
        >
          {slide.title}
        </p>
        {slide.content.length > 0 && (
          <p className="text-white/40 truncate mt-0.5" style={{ fontSize: "7px" }}>
            {slide.content[0]}
          </p>
        )}
      </div>

      {/* No-image placeholder grid */}
      {!hasImage && (
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="grid grid-cols-3 gap-0.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-4 h-3 rounded-sm" style={{ background: accent }} />
            ))}
          </div>
        </div>
      )}

      {/* Chart mini indicator for data slides */}
      {slide.type === "data" && slide.chartData && !hasImage && (
        <div className="absolute inset-x-2 top-8 bottom-6 flex items-end gap-0.5 justify-center">
          {slide.chartData.datasets[0]?.data.slice(0, 5).map((v, i) => {
            const max = Math.max(...slide.chartData!.datasets[0].data, 1);
            return (
              <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${(v / max) * 60}%`, background: accent, opacity: 0.6 }} />
            );
          })}
        </div>
      )}
    </div>
  );
}
