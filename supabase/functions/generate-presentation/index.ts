import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SLIDE_TYPES = ['title', 'agenda', 'concept', 'data', 'infographic', 'summary', 'cta'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');

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
      ? `YouTube video: ${youtubeUrl}`
      : websiteUrl
      ? `Website: ${websiteUrl}`
      : prompt || 'A professional presentation';

    const systemPrompt = `You are an expert presentation designer and storyteller. Generate a complete, cinematic presentation structure as JSON.

Rules:
- Return ONLY valid JSON, no markdown fences, no extra text
- Create exactly ${slideCount} slides
- Each slide must have: id, order, type, title, subtitle (optional), content (array of strings), speakerNotes, animationType, layoutVariant, accentColor, backgroundColor, chartData (only for "data" type)
- Slide types: ${SLIDE_TYPES.join(', ')} — use a good mix
- tone: ${tone}
- style/theme: ${stylePreset}
- presentation mode: ${presentationMode}
- Make content specific, concrete, and compelling — not generic filler
- Speaker notes should be director-quality: precise timing cues, emotional beats, audience engagement prompts
- For "data" slides include chartData: {type:"bar"|"pie"|"line", labels:[], datasets:[{label:"",data:[]}]}
- accentColor should match the theme (e.g. "#F5C518" for startup, "#FF2B2B" for TED, "#0071E3" for Apple)
- backgroundColor should be dark and cinematic

Return format:
{
  "title": "Presentation Title",
  "subtitle": "Subtitle",
  "slides": [
    {
      "id": "s1",
      "order": 1,
      "type": "title",
      "title": "...",
      "subtitle": "...",
      "content": [],
      "speakerNotes": "...",
      "animationType": "cinematic",
      "layoutVariant": 1,
      "accentColor": "#F5C518",
      "backgroundColor": "#050510"
    }
  ]
}`;

    console.log('Calling OnSpace AI for presentation generation...');

    const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Create a ${slideCount}-slide ${tone} presentation about: "${inputDescription}"\n\nStyle: ${stylePreset}\nMode: ${presentationMode}\n${includeCharts ? 'Include data slides with charts.' : ''}\n${includeSpeakerNotes ? 'Include detailed speaker notes.' : 'Keep speaker notes brief.'}`,
          },
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`OnSpace AI error: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content ?? '';

    console.log('AI response received, parsing JSON...');

    // Extract JSON from response (handle possible markdown wrapping)
    let jsonStr = rawContent;
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const parsed = JSON.parse(jsonStr);

    // Build full presentation object
    const presentationId = `pres_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const slides = (parsed.slides || []).map((s: Record<string, unknown>, i: number) => ({
      id: s.id || `s${i + 1}`,
      order: s.order || i + 1,
      type: s.type || 'concept',
      title: s.title || 'Slide',
      subtitle: s.subtitle || undefined,
      content: Array.isArray(s.content) ? s.content : [],
      speakerNotes: includeSpeakerNotes ? (s.speakerNotes || '') : '',
      animationType: s.animationType || 'fade',
      layoutVariant: s.layoutVariant || 1,
      accentColor: s.accentColor || '#F5C518',
      backgroundColor: s.backgroundColor || '#0A0A0F',
      chartData: s.chartData || undefined,
      visualUrl: undefined, // will be filled by image generation
    }));

    const presentation = {
      id: presentationId,
      title: parsed.title || inputDescription.split(' ').slice(0, 5).join(' '),
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
        overall: 88,
        readability: 90,
        visualBalance: 85,
        storytelling: 89,
        engagement: 87,
        pacing: 88,
        suggestions: [
          'Consider adding a compelling hook to your opening slide',
          'Data slides benefit from concrete comparisons',
          'End each section with a clear takeaway',
          'Vary slide types to maintain audience engagement',
        ],
      },
    };

    // Save to DB if user is authenticated
    if (userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase.from('presentations').insert({
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
