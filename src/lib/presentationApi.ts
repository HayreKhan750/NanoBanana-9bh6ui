import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { GenerationConfig, Presentation, Slide, StylePreset, PresentationMode, InputType } from '@/types/presentation';
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
      try {
        const {
          prompt,
          stylePreset,
          presentationMode,
          slideCount = 10,
          includeCharts,
          includeSpeakerNotes,
          tone = 'professional',
          youtubeUrl,
          websiteUrl,
        } = config;

        // Build input description
        let inputDescription = prompt;
        if (youtubeUrl) inputDescription = `YouTube video: ${youtubeUrl}`;
        if (websiteUrl) inputDescription = `Website: ${websiteUrl}`;

        const systemPrompt = `You are an elite presentation designer creating PREMIUM Kimi/Gamma-quality visual decks with RICH, DETAILED content.

CRITICAL CONTENT RULES:
1. EVERY content item MUST use "Title: Detailed description sentence" format
2. Descriptions should be 15-30 words explaining the concept
3. NEVER write just labels like "Software tools" - always include explanation
4. Each slide must have 4-6 content items minimum

EXAMPLE GOOD CONTENT:
- "Material Selection: Purified, asbestos-free talc is carefully sourced to guarantee skin safety and product quality."
- "Data Integration: Unified dashboards consolidate information from multiple sources, eliminating manual data entry and reducing errors by 80%."
- "AI Automation: Intelligent agents handle routine tasks 24/7, freeing human workers to focus on creative and strategic initiatives."

EXAMPLE BAD CONTENT (NEVER do this):
- "Software tools" (too short, no description)
- "Copilots" (just a label, useless)
- "Better efficiency" (vague, no details)

SLIDE TYPES:
- "title": Opening with compelling headline + tagline
- "agenda": 4-6 numbered topics with brief descriptions
- "timeline": 4-5 sequential steps, each with "Step Name: What happens and why"
- "infographic": Process explanation with 4-5 detailed steps
- "comparison": 3 problems on left, 3 solutions on right (6 total items)
- "concept": 4-6 key ideas, each with title and 20-word explanation
- "data": Chart data + 3-4 key insight statements
- "quote": Memorable quote with attribution
- "cta": Clear call-to-action with supporting points

OUTPUT FORMAT (valid JSON only):
{
  "title": "Compelling Presentation Title",
  "subtitle": "Engaging tagline or subtitle",
  "slides": [{
    "type": "title|agenda|timeline|infographic|comparison|concept|data|quote|cta",
    "title": "Powerful Slide Headline",
    "subtitle": "Optional supporting context",
    "content": [
      "First Point: Detailed explanation of 15-30 words that provides real value and insight.",
      "Second Point: Another detailed explanation that educates and engages the audience."
    ],
    "speakerNotes": "Detailed notes on what to say during this slide"
  }]
}`;

        const userPrompt = `Create a ${slideCount}-slide ${tone} presentation about: "${inputDescription}"

MANDATORY STRUCTURE:
1. title slide - Compelling headline with tagline
2. agenda slide - 4-5 topics with brief descriptions
3-${slideCount - 1}. Mix of: timeline, infographic, comparison, concept slides
${slideCount}. cta slide - Strong call to action

CRITICAL CONTENT REQUIREMENTS:
- EVERY content item MUST follow "Title: Description" format
- Descriptions must be 15-30 words with specific details
- Each slide needs 4-6 content items
- Use concrete examples, statistics, or specific benefits
- NO vague labels like "Better results" - be specific!

${includeCharts ? `DATA SLIDES: Include 1-2 slides with chartData:
{type: "bar"|"pie"|"line", labels: ["Label1", "Label2"], datasets: [{label: "Metric", data: [45, 65, 80]}]}` : ''}
${includeSpeakerNotes ? '- Add detailed 2-3 sentence speakerNotes for each slide' : ''}

QUALITY CHECK: Before returning, verify EVERY content item has "Title: Detailed description" format.
Return ONLY valid JSON.`;

        console.log('[v0] Calling Groq API directly...');
        
        // Call Groq API directly - get key from environment
        const groqKey = import.meta.env.GROQ_API_KEY;
        
        if (!groqKey) {
          throw new Error('GROQ_API_KEY not configured. Please add GROQ_API_KEY to your environment variables.');
        }

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 4000,
          }),
        });

        if (!groqResponse.ok) {
          const errorText = await groqResponse.text();
          throw new Error(`Groq API error (${groqResponse.status}): ${errorText}`);
        }

        const groqData = await groqResponse.json();
        const content = groqData.choices[0].message.content;

        // Parse JSON response
        let jsonStr = content.trim();
        if (jsonStr.includes('```json')) {
          jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
          jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const parsedContent = JSON.parse(jsonStr);

        // Structure presentation with full Gamma/Kimi-quality fields
        const presentation: Presentation = {
          id: crypto.randomUUID(),
          title: parsedContent.title || 'Untitled',
          subtitle: parsedContent.subtitle || '',
          theme: stylePreset,
          mode: presentationMode,
          totalSlides: parsedContent.totalSlides || slideCount,
          estimatedDuration: Math.ceil((parsedContent.totalSlides || slideCount) * 1.5),
          inputType: config.inputType || 'prompt',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          slides: (parsedContent.slides || []).map((slide: any, idx: number) => ({
            id: crypto.randomUUID(),
            order: idx + 1,
            type: slide.type || (idx === 0 ? 'title' : idx === 1 ? 'agenda' : 'concept'),
            title: slide.title || 'Slide',
            subtitle: slide.subtitle || '',
            content: Array.isArray(slide.content) ? slide.content : [slide.content || ''],
            imagePrompt: slide.imagePrompt || `Professional ${stylePreset} style background for ${slide.title || 'presentation'}`,
            speakerNotes: slide.speakerNotes || '',
            animationType: slide.animationType || 'fade',
            layoutVariant: slide.layoutVariant || 1,
            accentColor: '#F5C518',
            backgroundColor: '#0A0A0F',
            chartData: slide.chartData || undefined,
          })),
        };

        // Cache the result
        await aiCache.set(promptHash, presentation);

        // Log successful generation
        await usageTracker.logUsage(
          {
            model: 'groq-llama-3.3-70b',
            tokens_used: Math.ceil(presentation.totalSlides * 500),
            slide_count: presentation.totalSlides,
            status: 'success',
            input_type: config.inputType || 'text',
            cache_hit: false,
            queue_wait_ms: Date.now() - startTime,
          },
          userId
        );

        return presentation;
      } catch (error: any) {
        console.error('[v0] Generation error:', error.message);

        // Log failed generation
        await usageTracker.logUsage(
          {
            model: 'groq-llama-3.3-70b',
            tokens_used: 0,
            slide_count: 0,
            status: 'failed',
            error_message: error.message,
            input_type: config.inputType || 'text',
            cache_hit: false,
            queue_wait_ms: Date.now() - startTime,
          },
          userId
        );

        throw error;
      }
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
// ��───────────────────────────────────────────────
export async function generateSlideImageAI(
  slide: Slide & { imagePrompt?: string },
  theme: string,
  userId?: string
): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
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
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }
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
  if (!supabase) {
    return [];
  }
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
  if (!supabase) {
    return;
  }
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
