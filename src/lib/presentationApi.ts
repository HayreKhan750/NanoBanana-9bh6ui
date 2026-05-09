import { supabase } from '@/lib/supabase';
import type { GenerationConfig, Presentation, Slide } from '@/types/presentation';
import { FunctionsHttpError } from '@supabase/supabase-js';

// ────────────────────────────────────────────────
// Real AI generation via Edge Function
// ────────────────────────────────────────────────
export async function generatePresentationAI(
  config: GenerationConfig,
  userId?: string
): Promise<Presentation> {
  const { data, error } = await supabase.functions.invoke('generate-presentation', {
    body: { config, userId },
  });

  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const txt = await error.context?.text();
        msg = `[${error.context?.status}] ${txt || error.message}`;
      } catch {
        msg = error.message;
      }
    }
    throw new Error(msg);
  }

  return data.presentation as Presentation;
}

// ────────────────────────────────────────────────
// Generate image for a single slide via Edge Function
// ────────────────────────────────────────────────
export async function generateSlideImageAI(
  slide: Slide & { imagePrompt?: string },
  theme: string,
  userId?: string
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('generate-slide-image', {
    body: {
      imagePrompt: slide.imagePrompt || undefined,
      slideTitle: slide.title,
      slideType: slide.type,
      theme,
      accentColor: slide.accentColor,
      userId,
    },
  });

  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const txt = await error.context?.text();
        msg = txt || error.message;
      } catch {
        msg = error.message;
      }
    }
    throw new Error(msg);
  }

  return data.imageUrl as string;
}

// ────────────────────────────────────────────────
// Cloud persistence (Supabase DB)
// ────────────────────────────────────────────────
export async function saveToCloud(presentation: Presentation, userId: string): Promise<void> {
  const { error } = await supabase.from('presentations').upsert({
    id: presentation.id,
    user_id: userId,
    title: presentation.title,
    subtitle: presentation.subtitle,
    theme: presentation.theme,
    mode: presentation.mode,
    slides: presentation.slides,
    input_type: presentation.inputType,
    coach_score: presentation.coachScore,
    total_slides: presentation.totalSlides,
    estimated_duration: presentation.estimatedDuration,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function loadFromCloud(userId: string): Promise<Presentation[]> {
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    theme: row.theme,
    mode: row.mode,
    slides: row.slides,
    inputType: row.input_type,
    coachScore: row.coach_score,
    totalSlides: row.total_slides,
    estimatedDuration: row.estimated_duration,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function deleteFromCloud(id: string): Promise<void> {
  const { error } = await supabase.from('presentations').delete().eq('id', id);
  if (error) throw error;
}

// ────────────────────────────────────────────────
// Local storage fallback (guests)
// ────────────────────────────────────────────────
const LS_KEY = 'nano_banana_presentations';

export function saveLocal(presentation: Presentation): void {
  const stored = loadLocal();
  const idx = stored.findIndex((p) => p.id === presentation.id);
  if (idx >= 0) stored[idx] = presentation;
  else stored.unshift(presentation);
  localStorage.setItem(LS_KEY, JSON.stringify(stored));
}

export function loadLocal(): Presentation[] {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Presentation[]; } catch { return []; }
}

export function deleteLocal(id: string): void {
  const stored = loadLocal().filter((p) => p.id !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(stored));
}
