import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { loadFromCloud, loadLocal } from "@/lib/presentationApi";
import type { Presentation, SlideType, AnimationType } from "@/types/presentation";
import { useSlideEditor } from "@/hooks/useSlideEditor";
import { useAuth } from "@/hooks/useAuth";
import PresentationSidebar from "@/components/PresentationSidebar";
import SlideCanvas from "@/components/SlideCanvas";
import AIRefinementPanel from "@/components/AIRefinementPanel";
import PresentationToolbar from "@/components/PresentationToolbar";
import ExportDialog from "@/components/ExportDialog";
import { Loader2, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";

function getDemoPresentation(): Presentation {
  return {
    id: "demo",
    title: "The Future of AI-Powered Work",
    subtitle: "A Nano Banana AI Demo Presentation",
    theme: "futuristic",
    mode: "ted",
    inputType: "prompt",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalSlides: 8,
    estimatedDuration: 12,
    coachScore: {
      overall: 92, readability: 95, visualBalance: 88, storytelling: 94, engagement: 91, pacing: 93,
      suggestions: [
        "Consider adding a compelling personal story to slide 2",
        "Slide 5 could benefit from a data visualization",
        "The conclusion could be more emotionally resonant",
        "Try varying sentence length for better rhythm",
      ],
    },
    slides: [
      { id: "s1", order: 1, type: "title" as SlideType, title: "The Future of AI-Powered Work", subtitle: "How Intelligent Systems Will Transform Every Industry · 2025", content: [], speakerNotes: "Welcome everyone. Take a moment to let the title breathe. Make strong eye contact. Pause 3 seconds.", animationType: "cinematic" as AnimationType, layoutVariant: 1, accentColor: "#F5C518", backgroundColor: "#050510", visualUrl: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1280&h=720&fit=crop" },
      { id: "s2", order: 2, type: "agenda" as SlideType, title: "Our Journey Today", content: ["The AI Revolution is Here", "Real-World Transformations", "Key Industries Affected", "The Human-AI Partnership", "Ethical Considerations", "Opportunities Ahead", "Call to Action"], speakerNotes: "Walk through agenda briefly. Emphasize the 'journey' metaphor.", animationType: "stagger" as AnimationType, layoutVariant: 1, accentColor: "#06B6D4", backgroundColor: "#071428" },
      { id: "s3", order: 3, type: "concept" as SlideType, title: "The AI Revolution is Already Here", content: ["120M+ jobs will be transformed by AI by 2025", "80% of businesses now use AI in some form", "Productivity gains of 40% reported in AI-enabled teams", "The question is no longer IF, but HOW FAST"], speakerNotes: "Lead with the statistic that surprises them most.", animationType: "slide" as AnimationType, layoutVariant: 2, accentColor: "#F5C518", backgroundColor: "#0A0A0F", visualUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1280&h=720&fit=crop" },
      { id: "s4", order: 4, type: "data" as SlideType, title: "AI Adoption is Accelerating", content: ["Enterprise AI investment grew 300% in 2024", "AI startups raised $67B in funding last year", "ROI from AI projects: average 3.7x return", "Time-to-value decreased from 18 months to 4 months"], speakerNotes: "Let the chart speak first.", animationType: "zoom" as AnimationType, layoutVariant: 1, accentColor: "#10B981", backgroundColor: "#071428", chartData: { type: "bar", labels: ["2020", "2021", "2022", "2023", "2024"], datasets: [{ label: "AI Investment ($B)", data: [12, 24, 38, 52, 67] }] } },
      { id: "s5", order: 5, type: "concept" as SlideType, title: "Industries Being Transformed", content: ["Healthcare: AI diagnostics achieving 99.1% accuracy", "Finance: 70% of trades now AI-assisted", "Education: Personalized learning for 500M+ students", "Manufacturing: Predictive maintenance saving $630B annually"], speakerNotes: "Tell one specific story from each industry.", animationType: "stagger" as AnimationType, layoutVariant: 1, accentColor: "#8B5CF6", backgroundColor: "#0A0A0F" },
      { id: "s6", order: 6, type: "infographic" as SlideType, title: "The Human-AI Partnership Model", content: ["Humans provide: Creativity, Empathy, Context, Ethics", "AI provides: Scale, Speed, Pattern Recognition, Consistency", "Together: Capabilities neither could achieve alone", "The goal is augmentation, not replacement"], speakerNotes: "This is the emotional pivot point.", animationType: "fade" as AnimationType, layoutVariant: 2, accentColor: "#F5C518", backgroundColor: "#100A00" },
      { id: "s7", order: 7, type: "summary" as SlideType, title: "The Opportunity Window is Open", content: ["First-movers will define the next decade of their industries", "Skills gap creates enormous talent opportunity", "AI literacy is the new business literacy", "Those who act now will lead — those who wait will follow"], speakerNotes: "Build urgency here.", animationType: "cinematic" as AnimationType, layoutVariant: 1, accentColor: "#F5C518", backgroundColor: "#100A00" },
      { id: "s8", order: 8, type: "cta" as SlideType, title: "The Future Belongs to the Curious", subtitle: "Start your AI transformation journey today", content: ["hello@nanobanana.ai", "nanobanana.ai/start", "@NanoBananaAI"], speakerNotes: "End with energy and conviction.", animationType: "cinematic" as AnimationType, layoutVariant: 1, accentColor: "#F5C518", backgroundColor: "#050510", visualUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1280&h=720&fit=crop" },
    ],
  };
}

export default function PresentationStudio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showPresent, setShowPresent] = useState(false);
  const [presentSlide, setPresentSlide] = useState(0);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  const {
    presentation, setPresentation,
    activeSlide, activeSlideIndex, setActiveSlideIndex,
    isRefining, showNotes, setShowNotes, showCoach, setShowCoach,
    duplicateSlide, deleteSlide, reorderSlides, applyRefinement,
    updateSlideText, updateSlideNotes,
  } = useSlideEditor(null, user?.id);

  useEffect(() => {
    async function loadPresentation() {
      setLoading(true);
      try {
        if (id === "demo") {
          setPresentation(getDemoPresentation());
        } else if (id) {
          let found: Presentation | undefined;
          if (user) {
            const cloud = await loadFromCloud(user.id);
            found = cloud.find((p) => p.id === id);
          }
          if (!found) {
            const local = loadLocal();
            found = local.find((p) => p.id === id);
          }
          if (found) setPresentation(found);
          else navigate("/library");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load presentation");
        navigate("/library");
      } finally {
        setLoading(false);
      }
    }
    loadPresentation();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0F" }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#F5C518" }} />
          <p className="text-white/50 text-sm">Loading presentation…</p>
        </div>
      </div>
    );
  }

  if (!presentation) return null;

  // Fullscreen present mode
  if (showPresent) {
    const slide = presentation.slides[presentSlide];
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex flex-col outline-none"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === " ") setPresentSlide((i) => Math.min(i + 1, presentation.slides.length - 1));
          if (e.key === "ArrowLeft") setPresentSlide((i) => Math.max(i - 1, 0));
          if (e.key === "Escape") setShowPresent(false);
        }}
        tabIndex={0}
        autoFocus
      >
        <div className="flex items-center justify-between px-6 py-3" style={{ background: "rgba(0,0,0,0.7)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <span className="text-xs text-white/40 font-mono">{presentSlide + 1} / {presentation.slides.length}</span>
          <button onClick={() => setShowPresent(false)} className="px-4 py-2 rounded-lg text-xs font-medium text-white/50 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.06)" }}>Exit</button>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-5xl">
            <div className="slide-canvas w-full" style={{ aspectRatio: "16/9" }}>
              <SlideCanvas slide={slide} />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 px-6 py-4" style={{ background: "rgba(0,0,0,0.7)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={() => setPresentSlide((i) => Math.max(i - 1, 0))} disabled={presentSlide === 0} className="px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-30 hover:bg-white/10 transition-all" style={{ background: "rgba(255,255,255,0.08)", color: "white" }}>← Previous</button>
          <div className="flex gap-2">
            {presentation.slides.map((_, i) => (
              <button key={i} onClick={() => setPresentSlide(i)} className="w-2 h-2 rounded-full transition-all" style={{ background: i === presentSlide ? "#F5C518" : "rgba(255,255,255,0.2)" }} />
            ))}
          </div>
          <button onClick={() => setPresentSlide((i) => Math.min(i + 1, presentation.slides.length - 1))} disabled={presentSlide === presentation.slides.length - 1} className="px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-30 transition-all" style={{ background: "rgba(245,197,24,0.15)", color: "#F5C518", border: "1px solid rgba(245,197,24,0.3)" }}>Next →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: "#0A0A0F", paddingTop: "60px" }}>
      <PresentationToolbar
        presentation={presentation}
        showNotes={showNotes}
        showCoach={showCoach}
        zoom={zoom}
        onToggleNotes={() => setShowNotes(!showNotes)}
        onToggleCoach={() => setShowCoach(!showCoach)}
        onZoomIn={() => setZoom((z) => Math.min(z + 0.1, 2))}
        onZoomOut={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
        onExport={() => setShowExport(true)}
        onPresent={() => { setPresentSlide(activeSlideIndex); setShowPresent(true); }}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left sidebar toggle */}
        <button
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="absolute left-2 top-2 z-20 w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-white/10"
          style={{ background: "rgba(10,10,15,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
          title={leftSidebarOpen ? "Hide slides" : "Show slides"}
        >
          {leftSidebarOpen ? <PanelLeftClose className="w-4 h-4 text-white/60" /> : <PanelLeftOpen className="w-4 h-4 text-white/60" />}
        </button>

        {/* Left Sidebar - Collapsible */}
        <div 
          className="transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0"
          style={{ width: leftSidebarOpen ? "220px" : "0px" }}
        >
          <PresentationSidebar
            presentation={presentation}
            activeSlideIndex={activeSlideIndex}
            onSelectSlide={setActiveSlideIndex}
            onDuplicateSlide={duplicateSlide}
            onDeleteSlide={deleteSlide}
            onReorderSlides={reorderSlides}
          />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto bg-[#0a0a0f]">
          <div className="flex-1 flex items-center justify-center p-6">
            {activeSlide ? (
              <div className="w-full max-w-4xl mx-auto">
                <div 
                  className="slide-canvas w-full rounded-xl overflow-hidden shadow-2xl border border-white/10" 
                  style={{ 
                    aspectRatio: "16/9",
                    transform: `scale(${zoom})`,
                    transformOrigin: "top center"
                  }}
                >
                  <SlideCanvas
                    slide={activeSlide}
                    isEditing
                    onTitleChange={(val) => updateSlideText("title", val)}
                    onSubtitleChange={(val) => updateSlideText("subtitle", val)}
                  />
                </div>

                {showNotes && (
                  <div 
                    className="mt-4 p-4 rounded-xl" 
                    style={{ 
                      background: "rgba(255,255,255,0.03)", 
                      border: "1px solid rgba(255,255,255,0.07)",
                      marginTop: `${16 + (zoom - 1) * 400}px`
                    }}
                  >
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Speaker Notes</p>
                    <textarea
                      defaultValue={activeSlide.speakerNotes}
                      onChange={(e) => updateSlideNotes(e.target.value)}
                      className="studio-input w-full px-3 py-2 text-sm resize-none"
                      rows={3}
                      placeholder="Add speaker notes..."
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-white/30"><p>Select a slide to edit</p></div>
            )}
          </div>
        </div>

        {/* Right sidebar toggle */}
        <button
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          className="absolute right-2 top-2 z-20 w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-white/10"
          style={{ background: "rgba(10,10,15,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
          title={rightSidebarOpen ? "Hide AI assistant" : "Show AI assistant"}
        >
          {rightSidebarOpen ? <PanelRightClose className="w-4 h-4 text-white/60" /> : <PanelRightOpen className="w-4 h-4 text-white/60" />}
        </button>

        {/* Right Sidebar - Collapsible */}
        <div 
          className="transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0"
          style={{ width: rightSidebarOpen ? "280px" : "0px" }}
        >
          <AIRefinementPanel
            slide={activeSlide}
            isRefining={isRefining}
            onRefine={applyRefinement}
            presentation={presentation}
            showCoach={showCoach}
          />
        </div>
      </div>

      {showExport && <ExportDialog presentation={presentation} onClose={() => setShowExport(false)} />}
    </div>
  );
}
