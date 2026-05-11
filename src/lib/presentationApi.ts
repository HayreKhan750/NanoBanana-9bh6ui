import { supabase } from '@/lib/supabase';
import type { GenerationConfig, Presentation, Slide } from '@/types/presentation';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { aiQueue, AIQueue } from '@/lib/aiQueue';
import { aiCache } from '@/lib/aiCache';
import { usageTracker, type UsageLog } from '@/lib/usageTracker';

// ────────────────────────────────────────────────
// Real AI generation via Edge Function with queue & cache
// ────────────────────────────────────────────────
export async function generatePresentationAI(
  config: GenerationConfig,
  userId?: string,
  onStatusChange?: (status: { position: number; status: string; eta?: number }) => void
): Promise<Presentation> {
  const startTime = Date.now();

  // Generate hash for deduplication
  const promptHash = AIQueue.hashPrompt(
    config.prompt || config.youtubeUrl || config.websiteUrl || '',
    { mode: config.presentationMode, preset: config.stylePreset }
  );

  // Check cache first
  console.log('[v0] Checking cache for prompt hash:', promptHash);
  const cached = await aiCache.get(promptHash);
  if (cached) {
    console.log('[v0] Cache hit! Using cached presentation');
    
    // Log cache hit
    await usageTracker.logUsage(
      {
        model: 'cache',
        tokens_used: 0,
        slide_count: cached.presentation.totalSlides,
        status: 'success',
        input_type: config.inputType || 'text',
        cache_hit: true,
        queue_wait_ms: 0,
      },
      userId
    );

    onStatusChange?.({ position: 0, status: 'cached', eta: 0 });
    return cached.presentation;
  }

  // Check for duplicate in-flight request
  const activeRequest = aiQueue.hasActiveRequest(promptHash);
  if (activeRequest) {
    console.log('[v0] Duplicate request in flight, waiting for result');
    onStatusChange?.({ position: 1, status: 'waiting_for_duplicate', eta: 5000 });
    
    // Wait for the other request to complete, then check cache
    await new Promise(r => setTimeout(r, 2000));
    const cached2 = await aiCache.get(promptHash);
    if (cached2) return cached2.presentation;
  }

  // Enqueue request with queue and cache integration
  return aiQueue.enqueue(
    promptHash,
    async () => {
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
        
        // Log failed generation
        await usageTracker.logUsage(
          {
            model: 'groq-mixtral-8x7b-32768',
            tokens_used: 0,
            slide_count: 0,
            status: 'failed',
            error_message: msg,
            input_type: config.inputType || 'text',
            cache_hit: false,
            queue_wait_ms: Date.now() - startTime,
          },
          userId
        );

        throw new Error(msg);
      }

      const presentation = data.presentation as Presentation;

      // Cache the result
      await aiCache.set(promptHash, presentation);

      // Log successful generation
      await usageTracker.logUsage(
        {
          model: 'groq-mixtral-8x7b-32768',
          tokens_used: Math.ceil(presentation.totalSlides * 500), // Rough estimate
          slide_count: presentation.totalSlides,
          status: 'success',
          input_type: config.inputType || 'text',
          cache_hit: false,
          queue_wait_ms: Date.now() - startTime,
        },
        userId
      );

      return presentation;
    },
    (queueStatus) => {
      const position = aiQueue.getQueuePosition(queueStatus.id);
      const eta = position > 0 ? (position + 1) * 30000 : 5000;
      onStatusChange?.({
        position: Math.max(0, position),
        status: queueStatus.status,
        eta,
      });
    }
  );
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
