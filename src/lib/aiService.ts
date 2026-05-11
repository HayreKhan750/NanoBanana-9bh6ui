import type { Slide, Presentation, GenerationConfig, CoachScore, SlideType, AnimationType } from "@/types/presentation";
import { STYLE_PRESETS } from "@/constants/presets";
import { saveLocal, loadLocal, deleteLocal } from "@/lib/presentationApi";

// ─── Legacy helpers (kept for demo presentation & refine) ───────────────────

function generateSlideId(): string {
  return `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getPreset(id: string) {
  return STYLE_PRESETS.find((p) => p.id === id) || STYLE_PRESETS[0];
}

const ANIMATIONS: AnimationType[] = ["fade", "slide", "zoom", "cinematic", "stagger"];

function getSlideVisual(type: SlideType | undefined, index: number): string {
  const visuals: Record<string, string[]> = {
    title: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1280&h=720&fit=crop",
    ],
    data: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&h=720&fit=crop",
    ],
    concept: [
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1280&h=720&fit=crop",
      "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1280&h=720&fit=crop",
    ],
    cta: ["https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1280&h=720&fit=crop"],
  };
  const key = type || "concept";
  const arr = visuals[key] || visuals.concept;
  return arr[index % arr.length];
}

function generateChartData(index: number) {
  const charts = [
    { type: "bar" as const, labels: ["2021","2022","2023","2024","2025"], datasets: [{ label: "Revenue ($M)", data: [0.2,0.8,2.1,5.4,12.0], color: "#F5C518" }] },
    { type: "pie" as const, labels: ["Enterprise","SMB","Startup","Individual"], datasets: [{ label: "Market Share", data: [45,30,18,7], color: "#8B5CF6" }] },
    { type: "line" as const, labels: ["Jan","Feb","Mar","Apr","May","Jun"], datasets: [{ label: "Users (K)", data: [1.2,2.4,4.1,7.8,12.3,18.9], color: "#06B6D4" }] },
  ];
  return charts[index % charts.length];
}

export async function refineSlide(slide: Slide, action: string): Promise<Slide> {
  await new Promise((r) => setTimeout(r, 1200));
  const refinements: Record<string, Partial<Slide>> = {
    simplify: { content: slide.content.slice(0, 3), speakerNotes: slide.speakerNotes + "\n[Simplified for clarity]" },
    reduce_text: { content: slide.content.slice(0, 2).map((c) => c.split(" ").slice(0, 8).join(" ")) },
    improve_story: { speakerNotes: `${slide.speakerNotes}\n\n[Enhanced] Pause here for 2 seconds. Connect emotionally. Use a personal story.` },
    more_professional: { content: slide.content.map((c) => c ? c.charAt(0).toUpperCase() + c.slice(1) : c) },
    add_visuals: { visualUrl: getSlideVisual(slide.type, Math.floor(Math.random() * 5)) },
  };
  return { ...slide, ...refinements[action] };
}

// ─── Legacy localStorage wrappers (for guests) ──────────────────────────────
export function savePresentation(presentation: Presentation): void {
  saveLocal(presentation);
}

export function getPresentations(): Presentation[] {
  return loadLocal();
}

export function deletePresentation(id: string): void {
  deleteLocal(id);
}

// ─── Legacy mock generation (kept only for backwards compat — real AI is in presentationApi.ts) ───
export function extractTitleFromInput(config: GenerationConfig): string {
  if (config.prompt) {
    const words = config.prompt.trim().split(" ").slice(0, 5).join(" ");
    return words.length > 3 ? words : "AI-Powered Presentation";
  }
  if (config.youtubeUrl) return "YouTube Content Analysis";
  if (config.websiteUrl) return "Web Content Presentation";
  return "Professional Presentation";
}
