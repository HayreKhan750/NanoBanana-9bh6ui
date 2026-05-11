import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use Groq API directly (free, fast, no auth needed for basic tier)
    // Groq endpoint URL
    const groqUrl = 'https://api.groq.com/openai/v1';
    const groqKey = Deno.env.get('GROQ_API_KEY') || Deno.env.get('AI_GATEWAY_API_KEY');
    
    if (!groqKey) {
      throw new Error('GROQ_API_KEY or AI_GATEWAY_API_KEY environment variable is required');
    }

    const body = await req.json();
    const { config, userId } = body;

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
      inputType,
    } = config;

    const inputDescription = youtubeUrl
      ? `YouTube video URL: ${youtubeUrl}`
      : websiteUrl
      ? `Website URL: ${websiteUrl}`
      : prompt || 'A professional presentation';

    // Theme accent color mapping
    const themeAccents: Record<string, { accent: string; bg: string }> = {
      apple: { accent: '#0071E3', bg: '#1D1D1F' },
      startup: { accent: '#F5C518', bg: '#0A0A0F' },
      ted: { accent: '#FF2B2B', bg: '#0F0F0F' },
      minimal: { accent: '#D4AF37', bg: '#0C0C0C' },
      glass: { accent: '#06B6D4', bg: '#080818' },
      cyberpunk: { accent: '#00FF88', bg: '#0A0010' },
      academic: { accent: '#1E40AF', bg: '#FAFAFA' },
      corporate: { accent: '#1E3A5F', bg: '#FFFFFF' },
      futuristic: { accent: '#F5C518', bg: '#050510' },
      dark_neon: { accent: '#FF6B35', bg: '#07070F' },
      brutalist: { accent: '#FFFF00', bg: '#000000' },
      ethiopian: { accent: '#FCDD09', bg: '#1A0A00' },
      investor: { accent: '#0EA5E9', bg: '#040D17' },
      agency: { accent: '#F97316', bg: '#0F0318' },
      education: { accent: '#4F46E5', bg: '#FFFFFF' },
    };
    const colors = themeAccents[stylePreset] || { accent: '#F5C518', bg: '#0A0A0F' };

    const systemPrompt = `You are a world-class presentation designer and storyteller who creates VISUALLY STUNNING, CONCEPT-RICH presentations — like Kimi Slides or Apple Keynote.

CRITICAL RULES:
1. Return ONLY valid JSON. No markdown. No code fences. No extra text.
2. Create exactly ${slideCount} slides with DEEP CONCEPTUAL UNDERSTANDING — not surface-level bullet points.
3. Each slide must tell ONE clear visual story. Think in IMAGES and VISUAL METAPHORS.
4. NEVER use generic bullets. Instead, craft 2-4 PRECISE, PUNCHY statements per slide that reveal real insight.
5. For each slide include an "imagePrompt" field — a vivid, specific image generation prompt (50-80 words) describing a photorealistic or artistic image that PERFECTLY illustrates this slide's concept. Include: subject, composition, lighting, style, colors, mood. NO text in images.
6. Every slide should have a DISTINCT VISUAL IDENTITY: unique layout, color accent, composition.
7. Speaker notes must be DIRECTOR-QUALITY: precise timing cues, emotional beats, rhetorical techniques.
8. Think about the topic at an expert level. Show genuine mastery of the subject.

SLIDE TYPE GUIDE (use all types, mix intelligently):
- "title": Cinematic opener, sets the emotional tone
- "agenda": Visual roadmap, not just a list  
- "concept": Deep-dive into ONE key idea with visual metaphor
- "data": Hard evidence with chart + sharp interpretation
- "infographic": Process, system, or comparison visual
- "quote": Powerful quote or insight that reframes thinking
- "section": Bold transition between major themes
- "summary": Crystallizes the key transformation/insight
- "cta": Emotional close with clear next step

VISUAL DESIGN:
- accentColor: ${colors.accent}
- backgroundColor: ${colors.bg}
- Each slide can vary backgroundColor slightly for visual rhythm

JSON FORMAT:
{
  "title": "Compelling Presentation Title",
  "subtitle": "Evocative subtitle that creates intrigue",
  "slides": [
    {
      "id": "s1",
      "order": 1,
      "type": "title",
      "title": "...",
      "subtitle": "...",
      "content": [],
      "imagePrompt": "Vivid 60-80 word description of the perfect background image for this slide, photorealistic, cinematic lighting, no text in image",
      "speakerNotes": "Director-quality notes with timing and emotional cues",
      "animationType": "cinematic",
      "layoutVariant": 1,
      "accentColor": "${colors.accent}",
      "backgroundColor": "${colors.bg}"
    }
  ]
}`;

    console.log('Calling Groq API (mixtral-8x7b-32768) for presentation generation...');

    // Use Groq's Mixtral model (fast, free tier with good limits)
    const model = 'mixtral-8x7b-32768';

    const aiResponse = await fetch(`${groqUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Create a ${slideCount}-slide VISUALLY STUNNING ${tone} ${presentationMode}-style presentation on:

"${inputDescription}"

Requirements:
- Theme: ${stylePreset}  
- Tone: ${tone}
- Mode: ${presentationMode}
${includeCharts ? '- Include 2-3 "data" slides with realistic chart data (bar/line/pie) that reveals genuine insight' : ''}
${includeSpeakerNotes ? '- Include rich, director-quality speaker notes for every slide' : ''}
- For EVERY slide, write a vivid imagePrompt (60-80 words) describing a photorealistic scene/visual that perfectly captures the slide concept
- Make content intellectually deep and conceptually precise — not generic filler
- Each slide should feel like a distinct visual experience`,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`Groq API error (${aiResponse.status}): ${errText}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content ?? '';

    console.log('AI response received, parsing JSON...');

    // Extract JSON robustly
    let jsonStr = rawContent;
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const parsed = JSON.parse(jsonStr);

    const presentationId = `pres_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const slides = (parsed.slides || []).map((s: Record<string, unknown>, i: number) => ({
      id: s.id || `s${i + 1}`,
      order: Number(s.order) || i + 1,
      type: s.type || 'concept',
      title: s.title || 'Slide',
      subtitle: s.subtitle || undefined,
      content: Array.isArray(s.content) ? s.content : [],
      imagePrompt: s.imagePrompt || undefined,
      speakerNotes: includeSpeakerNotes ? (s.speakerNotes || '') : '',
      animationType: s.animationType || 'fade',
      layoutVariant: Number(s.layoutVariant) || 1,
      accentColor: s.accentColor || colors.accent,
      backgroundColor: s.backgroundColor || colors.bg,
      chartData: s.chartData || undefined,
      visualUrl: undefined,
    }));

    const presentation = {
      id: presentationId,
      title: parsed.title || inputDescription.split(' ').slice(0, 6).join(' '),
      subtitle: parsed.subtitle || `Generated with Nano Banana AI · ${stylePreset} Theme`,
      theme: stylePreset,
      mode: presentationMode,
      slides,
      inputType,
      totalSlides: slides.length,
      estimatedDuration: Math.ceil(slides.length * 1.5),
      createdAt: now,
      updatedAt: now,
      coachScore: {
        overall: 90,
        readability: 92,
        visualBalance: 88,
        storytelling: 91,
        engagement: 89,
        pacing: 90,
        suggestions: [
          'Consider opening with a provocative question or surprising statistic',
          'Data slides land harder when paired with a personal anecdote',
          'The strongest presentations end on an emotional high, not a summary',
          'Vary your slide rhythm: dense ↔ sparse ↔ visual-only',
          'Practice the transitions between sections — they are where flow breaks',
        ],
      },
    };

    // Save to DB if authenticated
    if (userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      await supabase.from('presentations').upsert({
        id: presentationId,
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
      });
    }

    return new Response(JSON.stringify({ presentation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('generate-presentation error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
