import { useState } from "react";
import type { Presentation } from "@/types/presentation";
import SlidePreview from "@/components/SlidePreview";
import { Copy, Trash2, GripVertical } from "lucide-react";

interface PresentationSidebarProps {
  presentation: Presentation;
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onReorderSlides: (from: number, to: number) => void;
}

export default function PresentationSidebar({
  presentation,
  activeSlideIndex,
  onSelectSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onReorderSlides,
}: PresentationSidebarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggingIndex !== null && draggingIndex !== index) {
      onReorderSlides(draggingIndex, index);
    }
    setDraggingIndex(null);
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        width: "200px",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(10,10,15,0.6)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Slides</span>
          <span className="text-xs font-medium" style={{ color: "#F5C518" }}>{presentation.slides.length} total</span>
        </div>
      </div>

      {/* Slide List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {presentation.slides.map((slide, index) => (
          <div
            key={slide.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`group relative rounded-lg cursor-pointer transition-all ${draggingIndex === index ? "opacity-40" : ""}`}
            style={{
              padding: "6px",
              background: activeSlideIndex === index ? "rgba(245,197,24,0.08)" : "transparent",
              border: `1px solid ${activeSlideIndex === index ? "rgba(245,197,24,0.3)" : "transparent"}`,
            }}
            onClick={() => onSelectSlide(index)}
          >
            {/* Drag handle */}
            <div
              className="absolute left-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <GripVertical className="w-3 h-3" />
            </div>

            <div className="flex gap-2 items-start pl-3">
              {/* Slide number */}
              <span
                className="text-[9px] font-mono font-bold mt-1 flex-shrink-0"
                style={{ color: activeSlideIndex === index ? "#F5C518" : "rgba(255,255,255,0.3)" }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Thumbnail */}
              <div className="flex-1 min-w-0">
                <SlidePreview slide={slide} isActive={activeSlideIndex === index} />
              </div>
            </div>

            {/* Slide type label */}
            <div className="px-3 mt-1">
              <span className="text-[9px] text-white/40 block truncate">{slide.title}</span>
            </div>

            {/* Action buttons */}
            {hoveredIndex === index && (
              <div className="absolute top-1 right-1 flex gap-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onDuplicateSlide(index); }}
                  className="w-5 h-5 rounded flex items-center justify-center transition-colors"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                  title="Duplicate"
                >
                  <Copy className="w-2.5 h-2.5 text-white/60" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteSlide(index); }}
                  className="w-5 h-5 rounded flex items-center justify-center transition-colors"
                  style={{ background: "rgba(239,68,68,0.2)" }}
                  title="Delete"
                >
                  <Trash2 className="w-2.5 h-2.5 text-red-400" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <p className="text-[10px] text-white/30">~{presentation.estimatedDuration || Math.ceil((presentation.slides?.length || 0) * 1.5)} min presentation</p>
      </div>
    </div>
  );
}
