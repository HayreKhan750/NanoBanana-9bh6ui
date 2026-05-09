import { useState, useCallback } from "react";
import type { Presentation, GenerationConfig } from "@/types/presentation";
import { generatePresentationAI, generateSlideImageAI, saveLocal, saveToCloud } from "@/lib/presentationApi";
import { toast } from "sonner";

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  stage: string;
  presentation: Presentation | null;
  error: string | null;
}

const GENERATION_STAGES = [
  { progress: 8,  label: "🧠 Initializing Gemini AI..." },
  { progress: 18, label: "📖 Analyzing your input..." },
  { progress: 30, label: "🔑 Extracting key concepts..." },
  { progress: 45, label: "🏗️ Building slide structure..." },
  { progress: 58, label: "✍️ Generating storytelling flow..." },
  { progress: 70, label: "🎨 Crafting visual layouts..." },
  { progress: 80, label: "🌅 Generating AI slide images..." },
  { progress: 90, label: "📝 Composing speaker notes..." },
  { progress: 96, label: "✨ Finalizing your presentation..." },
];

export function usePresentationGeneration() {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    stage: "",
    presentation: null,
    error: null,
  });

  const generate = useCallback(async (config: GenerationConfig, userId?: string) => {
    setState({ isGenerating: true, progress: 0, stage: "🚀 Launching Nano Banana AI...", presentation: null, error: null });

    let stageIndex = 0;
    const interval = setInterval(() => {
      if (stageIndex < GENERATION_STAGES.length) {
        const s = GENERATION_STAGES[stageIndex];
        setState((prev) => ({ ...prev, progress: s.progress, stage: s.label }));
        stageIndex++;
      }
    }, 500);

    try {
      // Step 1: Generate presentation structure with real LLM
      const presentation = await generatePresentationAI(config, userId);
      
      clearInterval(interval);
      setState((prev) => ({ ...prev, progress: 75, stage: "🌅 Generating AI visuals with Nano Banana 2..." }));

      // Step 2: Generate images for key slides (title, concept, cta) in parallel
      const imageSlideIndices = presentation.slides
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => ['title', 'concept', 'cta', 'infographic', 'summary'].includes(s.type))
        .slice(0, 5) // max 5 images per presentation
        .map(({ i }) => i);

      const imageResults = await Promise.allSettled(
        imageSlideIndices.map((idx) =>
          generateSlideImageAI(presentation.slides[idx], config.stylePreset, userId)
        )
      );

      // Apply generated images to slides
      imageResults.forEach((result, j) => {
        const idx = imageSlideIndices[j];
        if (result.status === 'fulfilled' && result.value) {
          presentation.slides[idx].visualUrl = result.value;
        }
      });

      presentation.totalSlides = presentation.slides.length;

      setState((prev) => ({ ...prev, progress: 95, stage: "💾 Saving your presentation..." }));

      // Step 3: Save
      if (userId) {
        await saveToCloud(presentation, userId);
      } else {
        saveLocal(presentation);
      }

      setState({ isGenerating: false, progress: 100, stage: "✅ Complete!", presentation, error: null });

      toast.success("Presentation generated!", {
        description: `${presentation.slides.length} slides with AI visuals · ${presentation.estimatedDuration} min`,
      });

      return presentation;
    } catch (err) {
      clearInterval(interval);
      const errorMessage = err instanceof Error ? err.message : "Generation failed";
      console.error('Generation error:', err);
      setState((prev) => ({ ...prev, isGenerating: false, error: errorMessage }));
      toast.error("Generation failed", { description: errorMessage });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isGenerating: false, progress: 0, stage: "", presentation: null, error: null });
  }, []);

  return { ...state, generate, reset };
}
