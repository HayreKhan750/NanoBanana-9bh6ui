import type { Slide } from "@/types/presentation";
import {
  BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

interface SlideCanvasProps {
  slide: Slide;
  onTitleChange?: (val: string) => void;
  onSubtitleChange?: (val: string) => void;
  isEditing?: boolean;
}

const CHART_COLORS = ["#F5C518", "#8B5CF6", "#06B6D4", "#10B981", "#EC4899", "#F97316"];

function ChartRenderer({ data }: { data: NonNullable<Slide["chartData"]> }) {
  if (data.type === "bar") {
    const chartData = data.labels.map((label, i) => ({ name: label, value: data.datasets[0]?.data[i] ?? 0 }));
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#1A1A2E", border: "none", borderRadius: 6, color: "white", fontSize: 11 }} />
          <Bar dataKey="value" fill={data.datasets[0]?.color || "#F5C518"} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  if (data.type === "pie" || data.type === "donut") {
    const chartData = data.labels.map((label, i) => ({ name: label, value: data.datasets[0]?.data[i] ?? 0 }));
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPie>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={data.type === "donut" ? 35 : 0} outerRadius={55} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={{ stroke: "rgba(255,255,255,0.2)" }}>
            {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: "#1A1A2E", border: "none", borderRadius: 6, color: "white", fontSize: 11 }} />
        </RechartsPie>
      </ResponsiveContainer>
    );
  }
  if (data.type === "line") {
    const chartData = data.labels.map((label, i) => ({ name: label, value: data.datasets[0]?.data[i] ?? 0 }));
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#1A1A2E", border: "none", borderRadius: 6, color: "white", fontSize: 11 }} />
          <Line type="monotone" dataKey="value" stroke={data.datasets[0]?.color || "#F5C518"} strokeWidth={2} dot={{ fill: data.datasets[0]?.color || "#F5C518", r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }
  return null;
}

// ─── TITLE SLIDE: Full-bleed image, large overlaid text ───────────────────
function TitleSlide({ slide, onTitleChange, onSubtitleChange, isEditing }: {
  slide: Slide; onTitleChange?: (v: string) => void; onSubtitleChange?: (v: string) => void; isEditing?: boolean;
}) {
  const accent = slide.accentColor || "#F5C518";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end text-center" style={{ background: slide.backgroundColor || "#050510" }}>
      {/* Full-bleed AI image */}
      {slide.visualUrl && (
        <img src={slide.visualUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.55 }} />
      )}
      {/* Gradient overlay for text legibility */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)" }} />

      {/* Text content */}
      <div className="relative z-10 w-full px-12 pb-12 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold mb-4 uppercase tracking-widest"
          style={{ background: `${accent}25`, color: accent, border: `1px solid ${accent}40` }}>
          ✦ Nano Banana AI
        </div>
        {isEditing ? (
          <input type="text" defaultValue={slide.title} onChange={(e) => onTitleChange?.(e.target.value)}
            className="block w-full text-4xl font-black bg-transparent border-none outline-none text-white leading-tight mb-3"
            style={{ caretColor: accent }} />
        ) : (
          <h1 className="text-4xl font-black text-white leading-tight mb-3">{slide.title}</h1>
        )}
        {slide.subtitle && (
          <p className="text-base font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>{slide.subtitle}</p>
        )}
        <div className="w-16 h-0.5 mt-4" style={{ background: accent }} />
      </div>
    </div>
  );
}

// ─── CONCEPT / INFOGRAPHIC / SUMMARY SLIDE: Image left, content right ──────
function ConceptSlide({ slide, isEditing, onTitleChange }: {
  slide: Slide; isEditing?: boolean; onTitleChange?: (v: string) => void;
}) {
  const accent = slide.accentColor || "#F5C518";
  const hasImage = !!slide.visualUrl;

  return (
    <div className="absolute inset-0 flex" style={{ background: slide.backgroundColor || "#0A0A0F" }}>
      {/* Left: AI image panel */}
      {hasImage && (
        <div className="w-[42%] relative flex-shrink-0 overflow-hidden">
          <img src={slide.visualUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, rgba(0,0,0,0.7) 100%)" }} />
          {/* Accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: accent }} />
        </div>
      )}

      {/* Right: content */}
      <div className={`flex flex-col justify-center px-8 py-8 ${hasImage ? "flex-1" : "flex-1 px-12"}`}>
        {/* Slide type badge */}
        <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: accent }}>
          {slide.type === 'infographic' ? '⚡ HOW IT WORKS' : slide.type === 'summary' ? '💡 KEY INSIGHT' : '🔍 DEEP DIVE'}
        </div>
        {isEditing ? (
          <input type="text" defaultValue={slide.title} onChange={(e) => onTitleChange?.(e.target.value)}
            className="text-xl font-black text-white bg-transparent border-none outline-none mb-4 leading-tight"
            style={{ caretColor: accent }} />
        ) : (
          <h2 className="text-xl font-black text-white mb-4 leading-tight">{slide.title}</h2>
        )}
        <div className="w-8 h-0.5 mb-5" style={{ background: accent }} />

        {/* Content items — NOT bullet points, styled as concept cards */}
        <div className="space-y-2.5">
          {slide.content.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)", borderLeft: `2px solid ${accent}50` }}>
              <span className="text-[11px] font-black mt-0.5 flex-shrink-0" style={{ color: accent }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[11px] text-white/80 leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)` }} />
    </div>
  );
}

// ─── AGENDA SLIDE: Clean visual timeline ────────────────────────────────────
function AgendaSlide({ slide }: { slide: Slide }) {
  const accent = slide.accentColor || "#06B6D4";
  return (
    <div className="absolute inset-0 flex" style={{ background: slide.backgroundColor || "#071428" }}>
      {/* Left color accent strip */}
      <div className="w-1.5 flex-shrink-0" style={{ background: `linear-gradient(to bottom, ${accent}, transparent)` }} />

      <div className="flex-1 flex flex-col justify-center px-10 py-8">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: accent }}>📋 AGENDA</div>
        <h2 className="text-2xl font-black text-white mb-6 leading-tight">{slide.title}</h2>

        <div className="grid grid-cols-2 gap-2">
          {slide.content.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.07)` }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <span className="text-[11px] text-white/80 leading-snug">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: `radial-gradient(${accent} 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
    </div>
  );
}

// ─── DATA SLIDE: Chart dominant, insight overlay ────────────────────────────
function DataSlide({ slide }: { slide: Slide }) {
  const accent = slide.accentColor || "#10B981";
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: slide.backgroundColor || "#071428" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-10 pt-8 pb-4">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: accent }}>📊 DATA</div>
        <h2 className="text-xl font-black text-white leading-tight">{slide.title}</h2>
        <div className="w-8 h-0.5 mt-2" style={{ background: accent }} />
      </div>

      {/* Body: chart + insights */}
      <div className="flex-1 flex gap-6 px-10 pb-8 min-h-0">
        {/* Chart area */}
        {slide.chartData && (
          <div className="flex-1 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-[10px] font-bold mb-2" style={{ color: accent }}>
              {slide.chartData.datasets[0]?.label}
            </div>
            <div style={{ height: "calc(100% - 24px)" }}>
              <ChartRenderer data={slide.chartData} />
            </div>
          </div>
        )}

        {/* Key insights */}
        <div className="w-48 flex flex-col gap-2 flex-shrink-0">
          <div className="text-[9px] font-black uppercase tracking-wider mb-1 text-white/40">Key Insights</div>
          {slide.content.slice(0, 4).map((item, i) => (
            <div key={i} className="p-2.5 rounded-lg flex-1" style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}>
              <span className="text-[10px] text-white/80 leading-snug">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION SLIDE: Bold typographic break ──────────────────────────────────
function SectionSlide({ slide }: { slide: Slide }) {
  const accent = slide.accentColor || "#8B5CF6";
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: slide.backgroundColor || "#0A0A0F" }}>
      {slide.visualUrl && (
        <img src={slide.visualUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))" }} />
      <div className="relative z-10 text-center px-16">
        <div className="text-6xl font-black mb-2 opacity-15" style={{ color: accent, letterSpacing: "-0.04em" }}>
          {String(slide.order).padStart(2, "0")}
        </div>
        <div className="w-12 h-0.5 mx-auto mb-4" style={{ background: accent }} />
        <h2 className="text-3xl font-black text-white leading-tight">{slide.title}</h2>
        {slide.subtitle && <p className="text-sm mt-3 text-white/50">{slide.subtitle}</p>}
      </div>
    </div>
  );
}

// ─── QUOTE SLIDE: Atmospheric image + bold quote ─────────────────────────────
function QuoteSlide({ slide }: { slide: Slide }) {
  const accent = slide.accentColor || "#EC4899";
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: slide.backgroundColor || "#0D0720" }}>
      {slide.visualUrl && (
        <img src={slide.visualUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8))" }} />
      <div className="relative z-10 text-center px-14 max-w-3xl mx-auto">
        <div className="text-6xl font-black leading-none mb-2" style={{ color: accent, opacity: 0.5 }}>"</div>
        <p className="text-xl font-bold text-white italic leading-relaxed mb-5">"{slide.title}"</p>
        <div className="w-10 h-0.5 mx-auto mb-4" style={{ background: accent }} />
        {slide.content[0] && (
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>
            — {slide.content[0]}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── CTA SLIDE: Full-bleed image, bold CTA ───────────────────────────────────
function CTASlide({ slide }: { slide: Slide }) {
  const accent = slide.accentColor || "#F5C518";
  return (
    <div className="absolute inset-0" style={{ background: slide.backgroundColor || "#050510" }}>
      {slide.visualUrl && (
        <img src={slide.visualUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 70%)" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-14">
        <div className="text-[9px] font-black uppercase tracking-[0.3em] mb-4 text-white/40">GET STARTED</div>
        <h2 className="text-3xl font-black text-white leading-tight mb-3">{slide.title}</h2>
        {slide.subtitle && <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>{slide.subtitle}</p>}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {slide.content.map((item, i) => (
            <span key={i} className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
              {item}
            </span>
          ))}
        </div>
        <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm"
          style={{ background: `linear-gradient(135deg, ${accent}, #F0B429)`, color: "#0A0A0F" }}>
          Begin Your Journey →
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function SlideCanvas({ slide, onTitleChange, onSubtitleChange, isEditing = false }: SlideCanvasProps) {
  if (slide.type === "title") {
    return (
      <div className="slide-canvas w-full">
        <TitleSlide slide={slide} onTitleChange={onTitleChange} onSubtitleChange={onSubtitleChange} isEditing={isEditing} />
      </div>
    );
  }
  if (slide.type === "agenda") {
    return <div className="slide-canvas w-full"><AgendaSlide slide={slide} /></div>;
  }
  if (slide.type === "data") {
    return <div className="slide-canvas w-full"><DataSlide slide={slide} /></div>;
  }
  if (slide.type === "section") {
    return <div className="slide-canvas w-full"><SectionSlide slide={slide} /></div>;
  }
  if (slide.type === "quote") {
    return <div className="slide-canvas w-full"><QuoteSlide slide={slide} /></div>;
  }
  if (slide.type === "cta") {
    return <div className="slide-canvas w-full"><CTASlide slide={slide} /></div>;
  }
  // concept, infographic, summary
  return (
    <div className="slide-canvas w-full">
      <ConceptSlide slide={slide} isEditing={isEditing} onTitleChange={onTitleChange} />
    </div>
  );
}
