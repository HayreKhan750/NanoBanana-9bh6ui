import { useState, useCallback } from "react";
import type { Slide, Presentation } from "@/types/presentation";
import { refineSlide } from "@/lib/aiService";
import { saveLocal, saveToCloud } from "@/lib/presentationApi";
import { toast } from "sonner";

export function useSlideEditor(initialPresentation: Presentation | null, userId?: string) {
  const [presentation, setPresentation] = useState<Presentation | null>(initialPresentation);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isRefining, setIsRefining] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showCoach, setShowCoach] = useState(false);

  const activeSlide = presentation?.slides[activeSlideIndex] || null;

  const save = useCallback((pres: Presentation) => {
    if (userId) {
      saveToCloud(pres, userId).catch(console.error);
    } else {
      saveLocal(pres);
    }
  }, [userId]);

  const updateSlide = useCallback((updatedSlide: Slide) => {
    if (!presentation) return;
    const slides = presentation.slides.map((s) => s.id === updatedSlide.id ? updatedSlide : s);
    const updated = { ...presentation, slides, updatedAt: new Date().toISOString() };
    setPresentation(updated);
    save(updated);
  }, [presentation, save]);

  const reorderSlides = useCallback((fromIndex: number, toIndex: number) => {
    if (!presentation) return;
    const slides = [...presentation.slides];
    const [removed] = slides.splice(fromIndex, 1);
    slides.splice(toIndex, 0, removed);
    const reordered = slides.map((s, i) => ({ ...s, order: i + 1 }));
    const updated = { ...presentation, slides: reordered, updatedAt: new Date().toISOString() };
    setPresentation(updated);
    save(updated);
  }, [presentation, save]);

  const duplicateSlide = useCallback((index: number) => {
    if (!presentation) return;
    const slide = presentation.slides[index];
    const duplicate = { ...slide, id: `slide_${Date.now()}_dup`, order: index + 2, title: `${slide.title} (Copy)` };
    const slides = [...presentation.slides];
    slides.splice(index + 1, 0, duplicate);
    const reordered = slides.map((s, i) => ({ ...s, order: i + 1 }));
    const updated = { ...presentation, slides: reordered, updatedAt: new Date().toISOString() };
    setPresentation(updated);
    setActiveSlideIndex(index + 1);
    save(updated);
    toast.success("Slide duplicated");
  }, [presentation, save]);

  const deleteSlide = useCallback((index: number) => {
    if (!presentation || presentation.slides.length <= 1) {
      toast.error("Cannot delete the last slide");
      return;
    }
    const slides = presentation.slides.filter((_, i) => i !== index);
    const reordered = slides.map((s, i) => ({ ...s, order: i + 1 }));
    const updated = { ...presentation, slides: reordered, updatedAt: new Date().toISOString() };
    setPresentation(updated);
    setActiveSlideIndex(Math.min(activeSlideIndex, reordered.length - 1));
    save(updated);
    toast.success("Slide deleted");
  }, [presentation, activeSlideIndex, save]);

  const applyRefinement = useCallback(async (action: string) => {
    if (!activeSlide || isRefining) return;
    setIsRefining(true);
    try {
      const refined = await refineSlide(activeSlide, action);
      updateSlide(refined);
      toast.success("Slide refined by AI", { description: `Action: ${action.replace("_", " ")}` });
    } finally {
      setIsRefining(false);
    }
  }, [activeSlide, isRefining, updateSlide]);

  const updateSlideText = useCallback((field: "title" | "subtitle", value: string) => {
    if (!activeSlide) return;
    updateSlide({ ...activeSlide, [field]: value });
  }, [activeSlide, updateSlide]);

  const updateSlideNotes = useCallback((notes: string) => {
    if (!activeSlide) return;
    updateSlide({ ...activeSlide, speakerNotes: notes });
  }, [activeSlide, updateSlide]);

  return {
    presentation, setPresentation,
    activeSlide, activeSlideIndex, setActiveSlideIndex,
    isRefining, showNotes, setShowNotes, showCoach, setShowCoach,
    updateSlide, reorderSlides, duplicateSlide, deleteSlide,
    applyRefinement, updateSlideText, updateSlideNotes,
  };
}
