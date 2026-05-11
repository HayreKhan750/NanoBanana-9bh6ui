import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Multi-provider AI configuration with fallbacks
const AI_PROVIDERS = {
  groq: {
    name: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'mixtral-8x7b-32768',
    getKey: () => Deno.env.get('GROQ_API_KEY'),
  },
};

async function callAIProvider(provider: typeof AI_PROVIDERS.groq, messages: any[], maxTokens: number) {
  const apiKey = provider.getKey();
  
  if (!apiKey) {
    throw new Error(`${provider.name} API key not configured`);
  }

  const response = await fetch(provider.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${provider.name} error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Prepare input description
    let inputDescription = prompt;
    if (youtubeUrl) inputDescription = `YouTube video: ${youtubeUrl}`;
    if (websiteUrl) inputDescription = `Website: ${websiteUrl}`;

    console.log(`[generate-presentation] Creating ${slideCount}-slide ${presentationMode} presentation on: "${inputDescription}"`);

    const systemPrompt = `You are an expert presentation designer and content strategist. Your task is to create compelling, visually structured presentation content.

CRITICAL: You MUST output ONLY valid JSON. No markdown, no extra text.

The JSON must follow this exact structure:
{
  "title": "string",
  "totalSlides": number,
  "slides": [
    {
      "slideNumber": number,
      "title": "string",
      "content": ["string"],
      "imagePrompt": "string"
    }
  ]
}`;

    const userPrompt = `Create a ${slideCount}-slide VISUALLY STUNNING ${tone} ${presentationMode}-style presentation on:

"${inputDescription}"

Requirements:
- Theme: ${stylePreset}
- Tone: ${tone}
- Mode: ${presentationMode}
${includeCharts ? '- Include 2-3 data visualization slides with realistic chart descriptions' : ''}
${includeSpeakerNotes ? '- Add speaker notes for important points' : ''}
- For each slide, provide a detailed imagePrompt (60-80 words) for AI image generation
- Make content intellectually deep and precise
- Each slide should have a distinct visual experience

Return ONLY valid JSON. No markdown.`;

    console.log('Calling Groq API for presentation generation...');

    // Try Groq first
    let presentationContent: string;
    try {
      presentationContent = await callAIProvider(
        AI_PROVIDERS.groq,
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        4000
      );
    } catch (groqError) {
      console.error('Groq API error:', groqError.message);
      throw new Error(`Groq API failed: ${groqError.message}`);
    }

    // Parse the response
    let parsedContent;
    try {
      // Extract JSON from response (handle markdown code blocks if present)
      let jsonStr = presentationContent.trim();
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
      }
      parsedContent = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', presentationContent);
      throw new Error(`Failed to parse presentation content: ${parseError.message}`);
    }

    // Validate and structure the presentation
    const presentation = {
      id: crypto.randomUUID(),
      title: parsedContent.title || 'Untitled Presentation',
      totalSlides: parsedContent.totalSlides || slideCount,
      slides: (parsedContent.slides || []).map((slide: any, idx: number) => ({
        slideNumber: idx + 1,
        title: slide.title || 'Slide',
        content: Array.isArray(slide.content) ? slide.content : [slide.content || ''],
        imagePrompt: slide.imagePrompt || 'Professional background image',
        speakerNotes: slide.speakerNotes || '',
      })),
      created_at: new Date().toISOString(),
      user_id: userId,
    };

    // Save to Supabase if user is authenticated
    if (userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      );

      const { error: dbError } = await supabase
        .from('presentations')
        .insert([presentation]);

      if (dbError) {
        console.error('Database save error:', dbError);
      }
    }

    return new Response(JSON.stringify({ presentation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
