import { Link } from "react-router-dom";
import { Zap, Sparkles, ChevronRight, Play, ArrowRight, FileText, Youtube, Mic, Globe, MessageSquare, BarChart2, Download, Brain } from "lucide-react";
import { STYLE_PRESETS } from "@/constants/presets";

const STATS = [
  { value: "10x", label: "Faster than manual slides" },
  { value: "50+", label: "Style presets" },
  { value: "15", label: "Presentation modes" },
  { value: "∞", label: "Creative possibilities" },
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI Storytelling Engine",
    description: "Emotionally structured narratives with logical flow, pacing control, and audience engagement optimization.",
    color: "#F5C518",
  },
  {
    icon: Sparkles,
    title: "Cinematic Visual Generation",
    description: "AI-generated illustrations, infographics, and diagrams tailored to each slide's theme and purpose.",
    color: "#8B5CF6",
  },
  {
    icon: BarChart2,
    title: "Data Visualization AI",
    description: "Upload CSV, Excel or JSON — instantly converted to beautiful animated charts and infographics.",
    color: "#06B6D4",
  },
  {
    icon: MessageSquare,
    title: "Speaker Notes AI",
    description: "Auto-generated presenter notes with timing cues, emphasis markers, and audience engagement prompts.",
    color: "#10B981",
  },
  {
    icon: Download,
    title: "Professional Export",
    description: "Export as PPTX, PDF, PNG slides, or HTML presentations with full layout and theme preservation.",
    color: "#F97316",
  },
  {
    icon: Zap,
    title: "Real-Time Editing",
    description: "Drag-and-drop slide editor with AI refinement, instant previews, and auto-save functionality.",
    color: "#EC4899",
  },
];

const INPUT_SHOWCASE = [
  { icon: MessageSquare, label: "Text Prompt", color: "#F5C518" },
  { icon: FileText, label: "PDF / DOCX", color: "#06B6D4" },
  { icon: Youtube, label: "YouTube URL", color: "#EF4444" },
  { icon: Globe, label: "Website URL", color: "#10B981" },
  { icon: Mic, label: "Voice Input", color: "#8B5CF6" },
  { icon: FileText, label: "Research Paper", color: "#F97316" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F", paddingTop: "60px" }}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1920&h=1080&fit=crop)" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,15,0.3), #0A0A0F)" }} />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #F5C518, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #8B5CF6, transparent)" }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black shadow-banana-glow"
              style={{ background: "linear-gradient(135deg, #F5C518, #F0B429)" }}
            >
              🍌
            </div>
            <div className="text-left">
              <div className="font-black text-xl text-white leading-none">Nano Banana</div>
              <div className="text-xs text-white/40">AI Presentation Studio</div>
            </div>
          </div>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8"
            style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.3)", color: "#F5C518" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen AI Presentation Studio
          </div>

          {/* Headline */}
          <h1 className="text-6xl lg:text-8xl font-black mb-6 leading-none tracking-tight">
            <span className="gradient-text-banana">Nano Banana</span>
            <br />
            <span className="text-white">AI Presentation</span>
            <br />
            <span className="text-white">Studio</span>
          </h1>

          <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            Generate cinematic, emotionally-structured presentations from prompts, PDFs, YouTube videos, voice recordings, and more. Not just slides — storytelling experiences.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              to="/generate"
              className="btn-banana flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold"
            >
              <Zap className="w-5 h-5" />
              Generate Free Presentation
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/studio/demo"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-medium text-white transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            >
              <Play className="w-5 h-5" />
              View Demo Presentation
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.value} className="glass-panel p-4 text-center">
                <div className="text-3xl font-black gradient-text-banana">{stat.value}</div>
                <div className="text-xs text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio Preview */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-3">The Ultimate Presentation Studio</h2>
            <p className="text-white/50">Real-time editing, AI refinement, and cinematic slide rendering</p>
          </div>
          <div className="relative rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&h=700&fit=crop"
              alt="Studio Preview"
              className="w-full object-cover opacity-50"
              style={{ maxHeight: "500px" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Link
                  to="/studio/demo"
                  className="btn-banana inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold mb-4"
                >
                  <Play className="w-5 h-5" />
                  Launch Studio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Input Types */}
      <section className="py-16 px-6" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-3">Any Input. One Click. Perfect Slides.</h2>
          <p className="text-white/50 mb-12">10 different input types. One unified AI engine.</p>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
            {INPUT_SHOWCASE.map((input) => (
              <div
                key={input.label}
                className="glass-panel glass-panel-hover p-4 text-center"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: `${input.color}15` }}
                >
                  <input.icon className="w-5 h-5" style={{ color: input.color }} />
                </div>
                <span className="text-xs font-medium text-white/70">{input.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-3">Built for Cinematic Impact</h2>
            <p className="text-white/50">Every feature designed to elevate your presentation game</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="glass-panel glass-panel-hover p-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}15` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Presets Showcase */}
      <section className="py-16 px-6" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-3">15 Cinematic Style Presets</h2>
            <p className="text-white/50">From Startup Pitch Deck to TED Talk — every style covered</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {STYLE_PRESETS.map((preset) => (
              <div key={preset.id} className="preset-card text-center">
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-xl"
                  style={{ background: `${preset.primaryColor}20` }}
                >
                  {preset.emoji}
                </div>
                <div className="text-xs font-semibold text-white/80">{preset.name}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{preset.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-panel p-12 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 blur-3xl opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #F5C518, transparent)" }} />
            <div className="relative z-10">
              <div className="text-5xl mb-6">🍌</div>
              <h2 className="text-4xl font-black text-white mb-4">Start Creating Cinematic Presentations</h2>
              <p className="text-white/50 mb-8">Join thousands of creators using Nano Banana AI to transform ideas into stunning presentations.</p>
              <Link
                to="/generate"
                className="btn-banana inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-lg font-bold"
              >
                <Zap className="w-5 h-5" />
                Generate Your First Presentation
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">🍌</span>
          <span className="font-bold text-white">Nano Banana AI Presentation Studio</span>
        </div>
        <p className="text-xs text-white/30">Powered by advanced AI · Crafted for cinematic storytelling</p>
      </footer>
    </div>
  );
}
