import type { Slide } from "@/types/presentation";
import {
  BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { 
  Lightbulb, Target, Zap, TrendingUp, Users, Settings, 
  CheckCircle2, ArrowRight, Star, Layers, Award, Rocket,
  BarChart3, PieChart, Globe, Shield, Clock, Heart
} from "lucide-react";

interface SlideCanvasProps {
  slide: Slide;
  onTitleChange?: (val: string) => void;
  onSubtitleChange?: (val: string) => void;
  isEditing?: boolean;
}

const CHART_COLORS = ["#F5C518", "#8B5CF6", "#06B6D4", "#10B981", "#EC4899", "#F97316"];

// Icon mapping for visual variety
const ICONS = [Lightbulb, Target, Zap, TrendingUp, Users, Settings, CheckCircle2, Star, Layers, Award, Rocket, BarChart3, PieChart, Globe, Shield, Clock, Heart];
const getIcon = (index: number) => ICONS[index % ICONS.length];

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

// ─── TITLE SLIDE: Cinematic hero with gradient overlay ───────────────────────
function TitleSlide({ slide, onTitleChange, onSubtitleChange, isEditing }: {
  slide: Slide; onTitleChange?: (v: string) => void; onSubtitleChange?: (v: string) => void; isEditing?: boolean;
}) {
  const accent = slide.accentColor || "#F5C518";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: `linear-gradient(135deg, #0A0A1A 0%, #1A1A3A 50%, #0A0A1A 100%)` }}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full blur-3xl" style={{ background: `${accent}15` }} />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full blur-3xl" style={{ background: "#8B5CF615" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border opacity-5" style={{ borderColor: accent }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-16 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold mb-6 uppercase tracking-widest"
          style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
          <Zap className="w-3 h-3" />
          Nano Banana AI
        </div>
        
        {isEditing ? (
          <input type="text" defaultValue={slide.title} onChange={(e) => onTitleChange?.(e.target.value)}
            className="block w-full text-5xl font-black bg-transparent border-none outline-none text-white text-center leading-tight mb-4"
            style={{ caretColor: accent }} />
        ) : (
          <h1 className="text-5xl font-black text-white leading-tight mb-4">{slide.title}</h1>
        )}
        
        {slide.subtitle && (
          <p className="text-lg font-medium text-white/60 mb-8">{slide.subtitle}</p>
        )}
        
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-0.5" style={{ background: `linear-gradient(to right, transparent, ${accent})` }} />
          <Star className="w-4 h-4" style={{ color: accent }} />
          <div className="w-16 h-0.5" style={{ background: `linear-gradient(to left, transparent, ${accent})` }} />
        </div>
      </div>
    </div>
  );
}

// ─── PROCESS FLOW SLIDE: Kimi-style horizontal timeline with icons ───────────
function ProcessFlowSlide({ slide }: { slide: Slide }) {
  const accent = slide.accentColor || "#06B6D4";
  const steps = slide.content.slice(0, 5); // Max 5 steps
  
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: `linear-gradient(180deg, #0F172A 0%, #1E293B 100%)` }}>
      {/* Header */}
      <div className="px-10 pt-8 pb-4">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: accent }}>
          Process Overview
        </div>
        <h2 className="text-2xl font-black text-white leading-tight">{slide.title}</h2>
        <div className="w-12 h-0.5 mt-3" style={{ background: accent }} />
      </div>

      {/* Process Flow */}
      <div className="flex-1 flex items-center justify-center px-8 pb-8">
        <div className="flex items-start gap-2">
          {steps.map((step, i) => {
            const Icon = getIcon(i);
            const isLast = i === steps.length - 1;
            
            return (
              <div key={i} className="flex items-center">
                {/* Step Card */}
                <div className="flex flex-col items-center text-center w-36">
                  {/* Icon Circle */}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 relative"
                    style={{ 
                      background: `linear-gradient(135deg, ${accent}20, ${accent}05)`,
                      border: `2px solid ${accent}40`,
                      boxShadow: `0 8px 32px ${accent}20`
                    }}>
                    <Icon className="w-7 h-7" style={{ color: accent }} />
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                      style={{ background: accent, color: "#0F172A" }}>
                      {i + 1}
                    </div>
                  </div>
                  
                  {/* Step Title - extract first part before colon or use full text */}
                  <h3 className="text-xs font-bold text-white mb-1.5 leading-tight">
                    {step.includes(':') ? step.split(':')[0] : step.split(' ').slice(0, 3).join(' ')}
                  </h3>
                  
                  {/* Step Description */}
                  <p className="text-[10px] text-white/50 leading-relaxed">
                    {step.includes(':') ? step.split(':')[1]?.trim() : step.split(' ').slice(3).join(' ') || ''}
                  </p>
                </div>

                {/* Arrow Connector */}
                {!isLast && (
                  <div className="flex items-center mx-1 mt-[-40px]">
                    <div className="w-8 h-0.5" style={{ background: `linear-gradient(to right, ${accent}60, ${accent}20)` }} />
                    <ArrowRight className="w-4 h-4 -ml-1" style={{ color: `${accent}60` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer accent */}
      <div className="h-1" style={{ background: `linear-gradient(to right, ${accent}, #8B5CF6, #EC4899)` }} />
    </div>
  );
}

// ─── ICON GRID SLIDE: 2x2 or 2x3 grid with large icons ──────────────────────
function IconGridSlide({ slide }: { slide: Slide }) {
  const accent = slide.accentColor || "#8B5CF6";
  const items = slide.content.slice(0, 6);
  const cols = items.length <= 4 ? 2 : 3;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#0A0A1A" }}>
      {/* Header */}
      <div className="px-10 pt-8 pb-4">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: accent }}>
          Key Components
        </div>
        <h2 className="text-2xl font-black text-white leading-tight">{slide.title}</h2>
      </div>

      {/* Grid */}
      <div className="flex-1 px-10 pb-8">
        <div className={`grid gap-4 h-full`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {items.map((item, i) => {
            const Icon = getIcon(i);
            const colors = ["#F5C518", "#06B6D4", "#10B981", "#EC4899", "#8B5CF6", "#F97316"];
            const itemColor = colors[i % colors.length];
            
            return (
              <div key={i} className="rounded-2xl p-5 flex flex-col relative overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${itemColor}08, transparent)`,
                  border: `1px solid ${itemColor}20`
                }}>
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl" 
                  style={{ background: `${itemColor}10` }} />
                
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${itemColor}15`, border: `1px solid ${itemColor}30` }}>
                  <Icon className="w-6 h-6" style={{ color: itemColor }} />
                </div>
                
                {/* Title */}
                <h3 className="text-sm font-bold text-white mb-1.5">
                  {item.includes(':') ? item.split(':')[0] : item.split(' ').slice(0, 4).join(' ')}
                </h3>
                
                {/* Description */}
                <p className="text-[10px] text-white/50 leading-relaxed flex-1">
                  {item.includes(':') ? item.split(':')[1]?.trim() : item.split(' ').slice(4).join(' ') || 'Explore this key concept in depth.'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── COMPARISON SLIDE: Side-by-side columns ─────────────────────────────────
function ComparisonSlide({ slide }: { slide: Slide }) {
  const accent = slide.accentColor || "#F5C518";
  const midpoint = Math.ceil(slide.content.length / 2);
  const leftItems = slide.content.slice(0, midpoint);
  const rightItems = slide.content.slice(midpoint);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#0A0A1A" }}>
      {/* Header */}
      <div className="px-10 pt-8 pb-4 text-center">
        <h2 className="text-2xl font-black text-white leading-tight">{slide.title}</h2>
        <div className="w-16 h-0.5 mx-auto mt-3" style={{ background: accent }} />
      </div>

      {/* Comparison Grid */}
      <div className="flex-1 flex gap-6 px-10 pb-8">
        {/* Left Column */}
        <div className="flex-1 rounded-2xl p-6" style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(239, 68, 68, 0.2)" }}>
              <span className="text-red-400 font-black">✕</span>
            </div>
            <span className="text-sm font-bold text-red-400">Before / Problem</span>
          </div>
          <div className="space-y-2">
            {leftItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5">
                <span className="text-red-400/60 mt-0.5">•</span>
                <span className="text-xs text-white/70">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider with arrow */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-0.5 flex-1 bg-white/10" />
          <div className="w-10 h-10 rounded-full flex items-center justify-center my-2" style={{ background: accent, boxShadow: `0 0 20px ${accent}40` }}>
            <ArrowRight className="w-5 h-5 text-black" />
          </div>
          <div className="w-0.5 flex-1 bg-white/10" />
        </div>

        {/* Right Column */}
        <div className="flex-1 rounded-2xl p-6" style={{ background: "rgba(34, 197, 94, 0.05)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(34, 197, 94, 0.2)" }}>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-sm font-bold text-green-400">After / Solution</span>
          </div>
          <div className="space-y-2">
            {rightItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5">
                <CheckCircle2 className="w-3 h-3 text-green-400/60 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-white/70">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AGENDA SLIDE: Visual timeline ──────────────────────────────────────────
function AgendaSlide({ slide }: { slide: Slide }) {
  const accent = slide.accentColor || "#06B6D4";
  return (
    <div className="absolute inset-0 flex" style={{ background: `linear-gradient(135deg, #0F172A 0%, #1E293B 100%)` }}>
      {/* Left accent */}
      <div className="w-1.5 flex-shrink-0" style={{ background: `linear-gradient(to bottom, ${accent}, transparent)` }} />

      <div className="flex-1 flex flex-col justify-center px-10 py-8">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: accent }}>
          Today&apos;s Agenda
        </div>
        <h2 className="text-2xl font-black text-white mb-6 leading-tight">{slide.title}</h2>

        {/* Timeline items */}
        <div className="space-y-3">
          {slide.content.map((item, i) => {
            const Icon = getIcon(i);
            return (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl transition-all hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
                  <Icon className="w-5 h-5" style={{ color: accent }} />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-white">{item}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full" 
                  style={{ background: `${accent}15`, color: accent }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decorative */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10"
        style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }} />
    </div>
  );
}

// ─── DATA SLIDE: Chart with insights ────────────────────────────────────────
function DataSlide({ slide }: { slide: Slide }) {
  const accent = slide.accentColor || "#10B981";
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: `linear-gradient(180deg, #0F172A 0%, #1E293B 100%)` }}>
      <div className="flex-shrink-0 px-10 pt-8 pb-4">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: accent }}>
          Data Insights
        </div>
        <h2 className="text-xl font-black text-white leading-tight">{slide.title}</h2>
      </div>

      <div className="flex-1 flex gap-6 px-10 pb-8 min-h-0">
        {slide.chartData && (
          <div className="flex-1 p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-[10px] font-bold mb-3" style={{ color: accent }}>
              {slide.chartData.datasets[0]?.label || 'Chart'}
            </div>
            <div style={{ height: "calc(100% - 28px)" }}>
              <ChartRenderer data={slide.chartData} />
            </div>
          </div>
        )}

        <div className="w-52 flex flex-col gap-2 flex-shrink-0">
          <div className="text-[9px] font-black uppercase tracking-wider mb-1 text-white/40">Key Takeaways</div>
          {slide.content.slice(0, 4).map((item, i) => {
            const Icon = getIcon(i);
            return (
              <div key={i} className="p-3 rounded-xl flex items-start gap-2" 
                style={{ background: `${accent}08`, border: `1px solid ${accent}15` }}>
                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: accent }} />
                <span className="text-[10px] text-white/70 leading-snug">{item}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION SLIDE: Bold divider ────────────────────────────────────────────
function SectionSlide({ slide }: { slide: Slide }) {
  const accent = slide.accentColor || "#8B5CF6";
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, #0A0A1A, #1A1A3A)` }}>
      {/* Decorative rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] rounded-full border opacity-5" style={{ borderColor: accent }} />
        <div className="absolute w-[300px] h-[300px] rounded-full border opacity-10" style={{ borderColor: accent }} />
        <div className="absolute w-[200px] h-[200px] rounded-full border opacity-15" style={{ borderColor: accent }} />
      </div>

      <div className="relative z-10 text-center px-16">
        <div className="text-7xl font-black mb-4 opacity-20" style={{ color: accent }}>
          {String(slide.order || 1).padStart(2, "0")}
        </div>
        <div className="w-16 h-1 mx-auto mb-5" style={{ background: accent }} />
        <h2 className="text-3xl font-black text-white leading-tight">{slide.title}</h2>
        {slide.subtitle && <p className="text-sm mt-4 text-white/50">{slide.subtitle}</p>}
      </div>
    </div>
  );
}

// ─── QUOTE SLIDE ─────────────────────────────────────────────────────────────
function QuoteSlide({ slide }: { slide: Slide }) {
  const accent = slide.accentColor || "#EC4899";
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, #0A0A1A, #1A0A20)` }}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, ${accent}08, transparent 60%)` }} />
      
      <div className="relative z-10 text-center px-16 max-w-3xl">
        <div className="text-8xl font-black leading-none mb-0" style={{ color: accent, opacity: 0.3 }}>"</div>
        <p className="text-2xl font-bold text-white italic leading-relaxed -mt-8 mb-6">
          {slide.title}
        </p>
        <div className="w-12 h-0.5 mx-auto mb-4" style={{ background: accent }} />
        {slide.content[0] && (
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
            — {slide.content[0]}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── CTA SLIDE ───────────────────────────────────────────────────────────────
function CTASlide({ slide }: { slide: Slide }) {
  const accent = slide.accentColor || "#F5C518";
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, #0A0A1A, #1A1A3A)` }}>
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl" style={{ background: `${accent}10` }} />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-3xl" style={{ background: "#8B5CF610" }} />

      <div className="relative z-10 text-center px-16">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-white/40">
          Take Action
        </div>
        <h2 className="text-3xl font-black text-white leading-tight mb-4">{slide.title}</h2>
        {slide.subtitle && <p className="text-base mb-6 text-white/60">{slide.subtitle}</p>}
        
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {slide.content.slice(0, 4).map((item, i) => (
            <span key={i} className="text-xs font-semibold px-4 py-2 rounded-full"
              style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
              {item}
            </span>
          ))}
        </div>
        
        <button className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm transition-transform hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${accent}, #F0B429)`, color: "#0A0A0A", boxShadow: `0 8px 32px ${accent}40` }}>
          Get Started Now
          <Rocket className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── CONCEPT SLIDE: Default with visual styling ─────────────────────────────
function ConceptSlide({ slide, isEditing, onTitleChange }: {
  slide: Slide; isEditing?: boolean; onTitleChange?: (v: string) => void;
}) {
  const accent = slide.accentColor || "#F5C518";

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: `linear-gradient(180deg, #0A0A1A 0%, #151525 100%)` }}>
      {/* Header */}
      <div className="px-10 pt-8 pb-4">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: accent }}>
          {slide.type === 'infographic' ? 'How It Works' : slide.type === 'summary' ? 'Key Insights' : 'Deep Dive'}
        </div>
        {isEditing ? (
          <input type="text" defaultValue={slide.title} onChange={(e) => onTitleChange?.(e.target.value)}
            className="text-2xl font-black text-white bg-transparent border-none outline-none leading-tight"
            style={{ caretColor: accent }} />
        ) : (
          <h2 className="text-2xl font-black text-white leading-tight">{slide.title}</h2>
        )}
        <div className="w-12 h-0.5 mt-3" style={{ background: accent }} />
      </div>

      {/* Content as visual cards */}
      <div className="flex-1 px-10 pb-8">
        <div className="grid grid-cols-2 gap-3 h-full">
          {slide.content.map((item, i) => {
            const Icon = getIcon(i);
            const colors = ["#F5C518", "#06B6D4", "#10B981", "#EC4899", "#8B5CF6", "#F97316"];
            const itemColor = colors[i % colors.length];
            
            return (
              <div key={i} className="rounded-xl p-4 flex items-start gap-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${itemColor}15`, border: `1px solid ${itemColor}25` }}>
                  <Icon className="w-5 h-5" style={{ color: itemColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black" style={{ color: itemColor }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-xs text-white/80 leading-relaxed mt-0.5">{item}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${accent}15, transparent 70%)` }} />
    </div>
  );
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────────────
export default function SlideCanvas({ slide, onTitleChange, onSubtitleChange, isEditing = false }: SlideCanvasProps) {
  const slideType = slide.type || 'concept';
  
  // Determine which renderer to use based on slide type and content
  const contentCount = slide.content?.length || 0;
  
  switch (slideType) {
    case 'title':
      return <div className="slide-canvas w-full"><TitleSlide slide={slide} onTitleChange={onTitleChange} onSubtitleChange={onSubtitleChange} isEditing={isEditing} /></div>;
    
    case 'agenda':
      return <div className="slide-canvas w-full"><AgendaSlide slide={slide} /></div>;
    
    case 'timeline':
    case 'infographic':
      // Use process flow for timeline/infographic types
      return <div className="slide-canvas w-full"><ProcessFlowSlide slide={slide} /></div>;
    
    case 'comparison':
      return <div className="slide-canvas w-full"><ComparisonSlide slide={slide} /></div>;
    
    case 'data':
      return <div className="slide-canvas w-full"><DataSlide slide={slide} /></div>;
    
    case 'section':
      return <div className="slide-canvas w-full"><SectionSlide slide={slide} /></div>;
    
    case 'quote':
      return <div className="slide-canvas w-full"><QuoteSlide slide={slide} /></div>;
    
    case 'cta':
      return <div className="slide-canvas w-full"><CTASlide slide={slide} /></div>;
    
    case 'concept':
    case 'summary':
    default:
      // For concept slides with 4-6 items, use icon grid
      if (contentCount >= 4 && contentCount <= 6) {
        return <div className="slide-canvas w-full"><IconGridSlide slide={slide} /></div>;
      }
      // For concept slides with 3-5 sequential items, use process flow
      if (contentCount >= 3 && contentCount <= 5 && slide.title?.toLowerCase().includes('step')) {
        return <div className="slide-canvas w-full"><ProcessFlowSlide slide={slide} /></div>;
      }
      // Default to enhanced concept slide
      return <div className="slide-canvas w-full"><ConceptSlide slide={slide} isEditing={isEditing} onTitleChange={onTitleChange} /></div>;
  }
}
