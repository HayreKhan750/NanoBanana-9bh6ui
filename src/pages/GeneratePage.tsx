import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare, FileText, Youtube, Globe, Mic, BookOpen,
  ChevronRight, ChevronLeft, Upload, Sparkles, Loader2,
  FileCode, AlignLeft
} from "lucide-react";
import type { InputType, StylePreset, PresentationMode, GenerationConfig } from "@/types/presentation";
import { INPUT_TYPES, PRESENTATION_MODES, STYLE_PRESETS } from "@/constants/presets";
import { usePresentationGeneration } from "@/hooks/usePresentationGeneration";
import { useAuth } from "@/hooks/useAuth";

const INPUT_ICONS: Record<string, React.ElementType> = {
  prompt: MessageSquare, topic: AlignLeft, pdf: FileText, docx: FileCode,
  research: BookOpen, youtube: Youtube, website: Globe, voice: Mic,
  transcript: FileText, markdown: FileCode,
};

type Step = 1 | 2 | 3;

export default function GeneratePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [selectedInput, setSelectedInput] = useState<InputType>("prompt");
  const [selectedPreset, setSelectedPreset] = useState<StylePreset>("startup");
  const [selectedMode, setSelectedMode] = useState<PresentationMode>("standard");
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");
  const [slideCount, setSlideCount] = useState(10);
  const [tone, setTone] = useState<"professional" | "casual" | "academic" | "creative">("professional");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState(true);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { isGenerating, progress, stage, generate } = usePresentationGeneration();

  const needsUrl = selectedInput === "youtube" || selectedInput === "website";
  const needsFile = ["pdf", "docx", "research", "voice", "transcript", "markdown"].includes(selectedInput);
  const needsPrompt = ["prompt", "topic"].includes(selectedInput);

  async function handleGenerate() {
    const config: GenerationConfig = {
      inputType: selectedInput,
      prompt: prompt || url,
      youtubeUrl: selectedInput === "youtube" ? url : undefined,
      websiteUrl: selectedInput === "website" ? url : undefined,
      stylePreset: selectedPreset,
      presentationMode: selectedMode,
      slideCount,
      includeCharts,
      includeSpeakerNotes,
      includeAnimations: true,
      tone,
      language: "en",
    };

    const pres = await generate(config, user?.id);
    if (pres) navigate(`/studio/${pres.id}`);
  }

  const isStep1Valid = needsPrompt ? prompt.trim().length > 3 : needsUrl ? url.trim().length > 5 : needsFile ? !!fileName : true;

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F", paddingTop: "60px" }}>
      {/* Generation overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(24px)" }}>
          <div className="text-center max-w-sm mx-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl" style={{ background: "linear-gradient(135deg, #F5C518, #F0B429)", animation: "float 3s ease-in-out infinite" }}>
              🍌
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nano Banana AI is working</h3>
            <p className="text-sm mb-8" style={{ color: "#F5C518" }}>{stage}</p>

            <div className="mb-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-white/40">Progress</span>
                <span style={{ color: "#F5C518" }}>{progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="space-y-2 text-left">
              {[
                { label: "Real AI generation (Gemini 3 Flash)", done: progress > 30 },
                { label: "Nano Banana 2 image generation", done: progress > 75 },
                { label: "Cloud saving & finalizing", done: progress > 95 },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{
                    background: s.done ? "rgba(245,197,24,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${s.done ? "rgba(245,197,24,0.3)" : "rgba(255,255,255,0.07)"}`,
                  }}
                >
                  {s.done ? (
                    <span className="text-sm" style={{ color: "#10B981" }}>✓</span>
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white/30" />
                  )}
                  <span className="text-xs text-white/60">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
            <span>New Presentation</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">What's your story?</h1>
          <p className="text-white/50">
            Powered by Gemini 3 Flash + Nano Banana 2 Image AI
            {user ? (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}>
                ✓ Saving to cloud
              </span>
            ) : (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                Local save (sign in to sync)
              </span>
            )}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-3">
              <button
                onClick={() => s < step || (s === 2 && isStep1Valid) ? setStep(s) : undefined}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background: step === s ? "#F5C518" : step > s ? "rgba(245,197,24,0.2)" : "rgba(255,255,255,0.06)",
                  color: step === s ? "#0A0A0F" : step > s ? "#F5C518" : "rgba(255,255,255,0.3)",
                  border: step > s ? "1px solid rgba(245,197,24,0.4)" : "none",
                }}
              >
                {step > s ? "✓" : s}
              </button>
              <span className="text-sm font-medium" style={{ color: step === s ? "white" : "rgba(255,255,255,0.3)" }}>
                {s === 1 ? "Input" : s === 2 ? "Style" : "Generate"}
              </span>
              {s < 3 && <ChevronRight className="w-4 h-4 text-white/20" />}
            </div>
          ))}
        </div>

        {/* Step 1: Input */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Select Input Type</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {INPUT_TYPES.map((input) => {
                  const Icon = INPUT_ICONS[input.id] || MessageSquare;
                  const isSelected = selectedInput === input.id;
                  return (
                    <button
                      key={input.id}
                      onClick={() => setSelectedInput(input.id as InputType)}
                      className="p-4 rounded-xl text-left transition-all"
                      style={{
                        background: isSelected ? "rgba(245,197,24,0.08)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isSelected ? "rgba(245,197,24,0.4)" : "rgba(255,255,255,0.08)"}`,
                        boxShadow: isSelected ? "0 0 20px rgba(245,197,24,0.08)" : "none",
                      }}
                    >
                      <div className="text-xl mb-2">{input.icon}</div>
                      <div className="text-xs font-semibold text-white/80">{input.label}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{input.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {needsPrompt && (
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                  {selectedInput === "topic" ? "Enter your topic" : "Describe your presentation"}
                </label>
                <textarea
                  value={prompt}
                  placeholder={selectedInput === "topic" ? "e.g. The Future of Renewable Energy" : "e.g. Create a compelling startup pitch for an AI-powered fitness app targeting Gen Z — include market data, competitor analysis, and a strong call to action..."}
                  rows={5}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="studio-input w-full px-4 py-3 text-sm resize-none"
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-white/30">More detail = better AI output</span>
                  <span className="text-[10px]" style={{ color: prompt.length > 20 ? "#F5C518" : "rgba(255,255,255,0.3)" }}>{prompt.length} chars</span>
                </div>
              </div>
            )}

            {needsUrl && (
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                  {selectedInput === "youtube" ? "YouTube Video URL" : "Website URL"}
                </label>
                <input
                  type="url"
                  value={url}
                  placeholder={selectedInput === "youtube" ? "https://youtube.com/watch?v=..." : "https://example.com"}
                  className="studio-input w-full px-4 py-3 text-sm"
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            )}

            {needsFile && (
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Upload File</label>
                <div
                  className="p-8 rounded-xl text-center cursor-pointer transition-all"
                  style={{ background: "rgba(255,255,255,0.02)", border: "2px dashed rgba(255,255,255,0.1)" }}
                  onClick={() => fileRef.current?.click()}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(245,197,24,0.3)"; e.currentTarget.style.background = "rgba(245,197,24,0.03)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                >
                  {fileName ? (
                    <p className="text-sm font-medium" style={{ color: "#F5C518" }}>{fileName}</p>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto mb-3 text-white/30" />
                      <p className="text-sm text-white/50">Drop your file here or click to browse</p>
                      <p className="text-xs text-white/30 mt-1">PDF, DOCX, TXT, MD, MP3, WAV · Max 50MB</p>
                    </>
                  )}
                  <input ref={fileRef} type="file" className="hidden"
                    accept={INPUT_TYPES.find((t) => t.id === selectedInput)?.accept || "*"}
                    onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="btn-banana flex items-center gap-2 px-8 py-3 rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue to Style
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Style */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Presentation Style</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`preset-card text-center ${selectedPreset === preset.id ? "selected" : ""}`}
                  >
                    <div className="text-2xl mb-1">{preset.emoji}</div>
                    <div className="text-[10px] font-semibold text-white/70">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Presentation Mode</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESENTATION_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id as PresentationMode)}
                    className="p-4 rounded-xl text-left transition-all"
                    style={{
                      background: selectedMode === mode.id ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${selectedMode === mode.id ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <div className="text-xl mb-1">{mode.icon}</div>
                    <div className="text-xs font-semibold text-white/80">{mode.label}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{mode.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-4">
                <p className="text-xs font-semibold text-white/50 mb-3">Number of Slides</p>
                <div className="flex items-center gap-3">
                  <input type="range" min={5} max={20} value={slideCount} onChange={(e) => setSlideCount(Number(e.target.value))} className="flex-1" style={{ accentColor: "#F5C518" }} />
                  <span className="text-lg font-bold" style={{ color: "#F5C518" }}>{slideCount}</span>
                </div>
              </div>
              <div className="glass-panel p-4">
                <p className="text-xs font-semibold text-white/50 mb-3">Tone</p>
                <div className="grid grid-cols-2 gap-1">
                  {(["professional", "casual", "academic", "creative"] as const).map((t) => (
                    <button key={t} onClick={() => setTone(t)}
                      className="py-2 rounded-lg text-xs font-medium capitalize transition-all"
                      style={{
                        background: tone === t ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.04)",
                        color: tone === t ? "#06B6D4" : "rgba(255,255,255,0.5)",
                        border: `1px solid ${tone === t ? "rgba(6,182,212,0.35)" : "rgba(255,255,255,0.08)"}`,
                      }}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <div className="glass-panel p-4">
                <p className="text-xs font-semibold text-white/50 mb-3">Options</p>
                <div className="space-y-2">
                  {[
                    { label: "Include Charts", value: includeCharts, onChange: setIncludeCharts },
                    { label: "Speaker Notes", value: includeSpeakerNotes, onChange: setIncludeSpeakerNotes },
                  ].map((opt) => (
                    <div key={opt.label} className="flex items-center gap-2">
                      <button onClick={() => opt.onChange(!opt.value)}
                        className="w-10 h-5 rounded-full relative transition-all cursor-pointer flex-shrink-0"
                        style={{ background: opt.value ? "#F5C518" : "rgba(255,255,255,0.1)" }}
                      >
                        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                          style={{ left: opt.value ? "calc(100% - 18px)" : "2px" }} />
                      </button>
                      <span className="text-xs text-white/60">{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(1)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <ChevronLeft className="w-4 h-4" />Back
              </button>
              <button onClick={() => setStep(3)} className="btn-banana flex items-center gap-2 px-8 py-3 rounded-xl font-bold">
                Preview & Generate <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold text-white mb-4">Ready to Generate</h3>

              {/* AI badge */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(245,197,24,0.1)", color: "#F5C518", border: "1px solid rgba(245,197,24,0.2)" }}>
                  🧠 Gemini 3 Flash AI
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.2)" }}>
                  🌅 Nano Banana 2 Images
                </span>
                {user && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}>
                    ☁️ Cloud Saved
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: "Input Type", value: INPUT_TYPES.find((t) => t.id === selectedInput)?.label },
                  { label: "Style", value: `${STYLE_PRESETS.find((p) => p.id === selectedPreset)?.emoji} ${STYLE_PRESETS.find((p) => p.id === selectedPreset)?.name}` },
                  { label: "Mode", value: PRESENTATION_MODES.find((m) => m.id === selectedMode)?.label },
                  { label: "Slides", value: `${slideCount} slides · ~${Math.ceil(slideCount * 1.5)} min` },
                  { label: "Tone", value: tone.charAt(0).toUpperCase() + tone.slice(1) },
                  { label: "Extras", value: [includeCharts && "Charts", includeSpeakerNotes && "Speaker Notes"].filter(Boolean).join(", ") || "None" },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">{item.label}</div>
                    <div className="text-sm font-medium text-white">{item.value}</div>
                  </div>
                ))}
              </div>

              {prompt && (
                <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(245,197,24,0.04)", border: "1px solid rgba(245,197,24,0.15)" }}>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Your Prompt</div>
                  <p className="text-sm text-white/70 italic">"{prompt.length > 150 ? prompt.substring(0, 150) + "..." : prompt}"</p>
                </div>
              )}

              <button onClick={handleGenerate} className="btn-banana w-full flex items-center justify-center gap-3 py-4 rounded-xl text-base font-bold">
                <Sparkles className="w-5 h-5" />
                Generate with Real AI
              </button>
            </div>

            <button onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all mx-auto"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <ChevronLeft className="w-4 h-4" />Back to Style
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
