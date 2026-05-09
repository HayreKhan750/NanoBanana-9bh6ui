import { useMemo } from "react";
import type { Slide } from "@/types/presentation";
import { TrendingUp } from "lucide-react";

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

function MiniChart({ data }: { data: Slide["chartData"] }) {
  if (!data) return null;
  const values = data.datasets[0]?.data || [];
  const max = Math.max(...values, 1);

  if (data.type === "bar") {
    return (
      <div className="flex items-end gap-0.5 h-6 mt-1">
        {values.slice(0, 6).map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{ height: `${(v / max) * 100}%`, background: "#F5C518", opacity: 0.7 }}
          />
        ))}
      </div>
    );
  }

  if (data.type === "pie" || data.type === "donut") {
    return (
      <div className="w-6 h-6 rounded-full mt-1" style={{ background: "conic-gradient(#F5C518 0% 45%, #8B5CF6 45% 75%, #06B6D4 75% 93%, #10B981 93% 100%)" }} />
    );
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      <TrendingUp className="w-3 h-3" style={{ color: "#10B981" }} />
      <span className="text-[8px]" style={{ color: "#10B981" }}>
        +{Math.round((values[values.length - 1] / values[0] - 1) * 100)}%
      </span>
    </div>
  );
}

export default function SlidePreview({ slide, isActive, onClick, scale = 1 }: SlidePreviewProps) {
  const accent = useMemo(() => SLIDE_TYPE_ACCENT[slide.type] || "#F5C518", [slide.type]);

  const isTitle = slide.type === "title" || slide.type === "cta";
  const hasBg = slide.visualUrl && (isTitle || slide.type === "section");

  return (
    <div
      onClick={onClick}
      className="slide-thumbnail relative overflow-hidden"
      style={{
        background: slide.backgroundColor || "#0A0A0F",
        borderColor: isActive ? accent : "transparent",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Background image for title slides */}
      {hasBg && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slide.visualUrl})`, opacity: 0.25 }}
        />
      )}

      {/* Accent gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />

      {/* Slide number + type badge */}
      <div className="absolute top-1 right-1 flex items-center gap-1">
        <span
          className="text-[6px] font-bold px-1 rounded"
          style={{ background: `${accent}20`, color: accent }}
        >
          {slide.type.toUpperCase()}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 p-2 h-full flex flex-col justify-center">
        {isTitle ? (
          <div className="text-center">
            <div className="text-[8px] font-bold text-white leading-tight line-clamp-2">{slide.title}</div>
            {slide.subtitle && (
              <div className="text-[6px] mt-0.5 line-clamp-1" style={{ color: "rgba(255,255,255,0.5)" }}>{slide.subtitle}</div>
            )}
          </div>
        ) : (
          <>
            <div className="text-[7px] font-bold text-white mb-1 line-clamp-1">{slide.title}</div>
            <div className="space-y-0.5">
              {slide.content.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-start gap-0.5">
                  <div className="w-0.5 h-0.5 rounded-full mt-0.5 flex-shrink-0" style={{ background: accent }} />
                  <span className="text-[6px] line-clamp-1" style={{ color: "rgba(255,255,255,0.6)" }}>{item}</span>
                </div>
              ))}
            </div>
            {slide.chartData && <MiniChart data={slide.chartData} />}
          </>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}40, transparent)` }}
      />
    </div>
  );
}
