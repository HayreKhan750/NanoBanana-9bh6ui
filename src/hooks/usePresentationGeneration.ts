import { useState, useCallback } from "react";
import type { Presentation, GenerationConfig } from "@/types/presentation";
import { generatePresentationAI, generateSlideImageAI, saveLocal, saveToCloud } from "@/lib/presentationApi";
import { toast } from "sonner";

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  stage: string;
  imageProgress: { current: number; total: number } | null;
  presentation: Presentation | null;
  error: string | null;
}

const TEXT_STAGES = [
  { progress: 8,  label: "🧠 Initializing Gemini AI..." },
  { progress: 18, label: "📖 Analyzing your topic..." },
  { progress: 30, label: "🔑 Extracting core concepts..." },
  { progress: 45, label: "🏗️ Architecting slide structure..." },
  { progress: 58, label: "✍️ Crafting storytelling flow..." },
  { progress: 68, label: "📊 Building visual layouts..." },
];

export function usePresentationGeneration() {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    stage: "",
    imageProgress: null,
    presentation: null,
    error: null,
  });

  const generate = useCallback(async (
    config: GenerationConfig,
    userId?: string,
    onStatusChange?: (status: { position: number; status: string; eta?: number }) => void
  ) => {
    setState({ isGenerating: true, progress: 0, stage: "🚀 Launching Nano Banana AI...", imageProgress: null, presentation: null, error: null });

    let stageIndex = 0;
    const interval = setInterval(() => {
      if (stageIndex < TEXT_STAGES.length) {
        const s = TEXT_STAGES[stageIndex];
        setState((prev) => ({ ...prev, progress: s.progress, stage: s.label }));
        stageIndex++;
      }
    }, 600);

    try {
      // Step 1: Generate slide structure with Groq/Mixtral (via queue & cache)
      const presentation = await generatePresentationAI(config, userId, onStatusChange);
      clearInterval(interval);

      // Step 2: Generate AI images for slides (all slides get images via Nano Banana 2)
      // Prioritize: title, concept, cta, infographic, section, summary first; then rest
      const priorityTypes = ['title', 'cta', 'concept', 'infographic', 'section', 'summary', 'quote'];
      const orderedIndices = [
        ...presentation.slides.map((s, i) => ({ s, i })).filter(({ s }) => priorityTypes.includes(s.type)).map(({ i }) => i),
        ...presentation.slides.map((s, i) => ({ s, i })).filter(({ s }) => !priorityTypes.includes(s.type)).map(({ i }) => i),
      ];

      // Generate images one by one (to avoid overwhelming the API)
      const totalImages = Math.min(orderedIndices.length, presentation.slides.length);
      let doneImages = 0;

      setState((prev) => ({
        ...prev,
        progress: 72,
        stage: "🎨 Generating Nano Banana 2 images...",
        imageProgress: { current: 0, total: totalImages },
      }));

      for (const idx of orderedIndices) {
        const slide = presentation.slides[idx] as typeof presentation.slides[0] & { imagePrompt?: string };
        try {
          const imageUrl = await generateSlideImageAI(slide, config.stylePreset, userId);
          presentation.slides[idx].visualUrl = imageUrl;
        } catch (imgErr) {
          console.warn(`Image gen failed for slide ${idx + 1}:`, imgErr);
        }
        doneImages++;
        const imgPct = 72 + Math.round((doneImages / totalImages) * 23);
        setState((prev) => ({
          ...prev,
          progress: imgPct,
          stage: `🎨 Generating image ${doneImages}/${totalImages}...`,
          imageProgress: { current: doneImages, total: totalImages },
        }));
      }

      presentation.totalSlides = presentation.slides.length;

      setState((prev) => ({ ...prev, progress: 96, stage: "💾 Saving your presentation...", imageProgress: null }));

      // Step 3: Save
      if (userId) {
        await saveToCloud(presentation, userId);
      } else {
        saveLocal(presentation);
      }

      setState({ isGenerating: false, progress: 100, stage: "✅ Complete!", imageProgress: null, presentation, error: null });

      toast.success("Presentation generated!", {
        description: `${presentation.slides.length} slides with AI visuals · ${presentation.estimatedDuration} min`,
      });

      return presentation;
    } catch (err) {
      clearInterval(interval);
      const errorMessage = err instanceof Error ? err.message : "Generation failed";
      console.error("Generation error:", err);
      setState((prev) => ({ ...prev, isGenerating: false, error: errorMessage, imageProgress: null }));
      toast.error("Generation failed", { description: errorMessage });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isGenerating: false, progress: 0, stage: "", imageProgress: null, presentation: null, error: null });
  }, []);

  return { ...state, generate, reset };
}
