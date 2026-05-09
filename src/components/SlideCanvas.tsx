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

const SLIDE_GRADIENTS: Record<string, string> = {
  title: "linear-gradient(135deg, #0A0A1A 0%, #1A0A2E 50%, #0A1A2E 100%)",
  agenda: "linear-gradient(135deg, #071428 0%, #0F1F3D 100%)",
  section: "linear-gradient(135deg, #1A0A2E 0%, #2E0A1A 100%)",
  concept: "linear-gradient(135deg, #0A0A0F 0%, #0F0F20 100%)",
  data: "linear-gradient(135deg, #071428 0%, #071E14 100%)",
  infographic: "linear-gradient(135deg, #1A0D00 0%, #200A00 100%)",
  quote: "linear-gradient(135deg, #0D0720 0%, #1A0730 100%)",
  cta: "linear-gradient(135deg, #0A0A0F 0%, #1A0A2E 100%)",
  summary: "linear-gradient(135deg, #100A00 0%, #1A1000 100%)",
  default: "linear-gradient(135deg, #0A0A0F 0%, #141420 100%)",
};

const ACCENT_COLORS: Record<string, string> = {
  title: "#F5C518",
  agenda: "#06B6D4",
  section: "#8B5CF6",
  concept: "#F5C518",
  data: "#10B981",
  infographic: "#F97316",
  quote: "#EC4899",
  cta: "#F5C518",
  summary: "#F5C518",
  default: "#F5C518",
};

function ChartRenderer({ data }: { data: NonNullable<Slide["chartData"]> }) {
  const colors = ["#F5C518", "#8B5CF6", "#06B6D4", "#10B981", "#EC4899", "#F97316"];

  if (data.type === "bar") {
    const chartData = data.labels.map((label, i) => ({
      name: label,
      value: data.datasets[0]?.data[i] ?? 0,
    }));
    return (
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} />
          <Bar dataKey="value" fill="#F5C518" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (data.type === "pie" || data.type === "donut") {
    const chartData = data.labels.map((label, i) => ({
      name: label,
      value: data.datasets[0]?.data[i] ?? 0,
    }));
    return (
      <ResponsiveContainer width="100%" height={160}>
        <RechartsPie>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={data.type === "donut" ? 40 : 0}
            outerRadius={65}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}%`}
            labelLine={{ stroke: "rgba(255,255,255,0.3)" }}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} />
        </RechartsPie>
      </ResponsiveContainer>
    );
  }

  if (data.type === "line") {
    const chartData = data.labels.map((label, i) => ({
      name: label,
      value: data.datasets[0]?.data[i] ?? 0,
    }));
    return (
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData}>
          <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#1A1A2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} />
          <Line type="monotone" dataKey="value" stroke="#F5C518" strokeWidth={2} dot={{ fill: "#F5C518", r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return null;
}

function TitleSlide({ slide, accent, onTitleChange, onSubtitleChange, isEditing }: {
  slide: Slide; accent: string; onTitleChange?: (v: string) => void; onSubtitleChange?: (v: string) => void; isEditing?: boolean;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-16">
      {slide.visualUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slide.visualUrl})`, opacity: 0.15 }}
        />
      )}
      <div className="relative z-10 max-w-3xl">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}30` }}
        >
          ✦ Nano Banana AI Presentation
        </div>
        {isEditing ? (
          <input
            type="text"
            defaultValue={slide.title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            className="block w-full text-center text-5xl font-bold bg-transparent border-none outline-none text-white mb-4"
            style={{ caretColor: accent }}
          />
        ) : (
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">{slide.title}</h1>
        )}
        {slide.subtitle && (
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>{slide.subtitle}</p>
        )}
      </div>
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
    </div>
  );
}

function AgendaSlide({ slide, accent }: { slide: Slide; accent: string }) {
  return (
    <div className="absolute inset-0 flex gap-8 p-12">
      <div className="flex-1">
        <h2 className="text-3xl font-bold text-white mb-8">{slide.title}</h2>
        <div className="space-y-3">
          {slide.content.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-white/80 text-base">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataSlide({ slide, accent }: { slide: Slide; accent: string }) {
  return (
    <div className="absolute inset-0 flex gap-6 p-12">
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-6">{slide.title}</h2>
        <div className="space-y-2 mb-4">
          {slide.content.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: accent }} />
              <span className="text-white/75 text-sm">{item}</span>
            </div>
          ))}
        </div>
        {slide.chartData && (
          <div className="mt-auto">
            <div className="text-xs font-medium mb-2" style={{ color: accent }}>
              {slide.chartData.datasets[0]?.label}
            </div>
            <ChartRenderer data={slide.chartData} />
          </div>
        )}
      </div>
    </div>
  );
}

function ConceptSlide({ slide, accent }: { slide: Slide; accent: string }) {
  const isLayout2 = slide.layoutVariant === 2;
  return (
    <div className={`absolute inset-0 flex ${isLayout2 ? "flex-row" : "flex-col"} p-12 gap-8`}>
      {isLayout2 && slide.visualUrl && (
        <div className="w-2/5 rounded-xl overflow-hidden flex-shrink-0">
          <img src={slide.visualUrl} alt="" className="w-full h-full object-cover opacity-60" />
        </div>
      )}
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-white mb-6 leading-tight">{slide.title}</h2>
        <div className="space-y-3">
          {slide.content.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                style={{ background: `${accent}25`, color: accent }}
              >
                {i + 1}
              </span>
              <span className="text-white/80 text-sm leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CTASlide({ slide, accent }: { slide: Slide; accent: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-16">
      {slide.visualUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slide.visualUrl})`, opacity: 0.12 }}
        />
      )}
      <div className="relative z-10">
        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">{slide.title}</h2>
        {slide.subtitle && (
          <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>{slide.subtitle}</p>
        )}
        <div className="flex flex-col items-center gap-2 mb-8">
          {slide.content.map((item, i) => (
            <span key={i} className="text-sm font-medium" style={{ color: accent }}>{item}</span>
          ))}
        </div>
        <div
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
          style={{ background: `linear-gradient(135deg, ${accent}, #F0B429)`, color: "#0A0A0F" }}
        >
          Get Started Today →
        </div>
      </div>
    </div>
  );
}

export default function SlideCanvas({ slide, onTitleChange, onSubtitleChange, isEditing = false }: SlideCanvasProps) {
  const bg = SLIDE_GRADIENTS[slide.type] || SLIDE_GRADIENTS.default;
  const accent = ACCENT_COLORS[slide.type] || "#F5C518";

  return (
    <div
      className="slide-canvas w-full"
      style={{ background: bg }}
    >
      {/* Ambient light */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 opacity-20 blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${accent} 0%, transparent 70%)` }}
      />

      {slide.type === "title" && (
        <TitleSlide slide={slide} accent={accent} onTitleChange={onTitleChange} onSubtitleChange={onSubtitleChange} isEditing={isEditing} />
      )}
      {slide.type === "agenda" && <AgendaSlide slide={slide} accent={accent} />}
      {slide.type === "data" && <DataSlide slide={slide} accent={accent} />}
      {slide.type === "cta" && <CTASlide slide={slide} accent={accent} />}
      {(slide.type === "concept" || slide.type === "summary" || slide.type === "infographic") && (
        <ConceptSlide slide={slide} accent={accent} />
      )}
      {slide.type === "section" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-7xl font-black mb-4 opacity-10" style={{ color: accent }}>
              {String(slide.order).padStart(2, "0")}
            </div>
            <h2 className="text-4xl font-bold text-white">{slide.title}</h2>
          </div>
        </div>
      )}
      {slide.type === "quote" && (
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <div className="text-center max-w-2xl">
            <div className="text-8xl font-black mb-4 leading-none" style={{ color: accent, opacity: 0.3 }}>"</div>
            <p className="text-2xl font-medium text-white italic leading-relaxed mb-6">"{slide.title}"</p>
            {slide.content[0] && (
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>— {slide.content[0]}</p>
            )}
          </div>
        </div>
      )}

      {/* Slide order indicator */}
      <div
        className="absolute bottom-3 right-4 text-xs font-mono"
        style={{ color: "rgba(255,255,255,0.2)" }}
      >
        {slide.order}
      </div>
    </div>
  );
}
