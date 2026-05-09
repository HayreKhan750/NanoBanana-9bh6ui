import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');

    const body = await req.json();
    const { imagePrompt, slideTitle, slideType, theme, userId } = body;

    // Use AI-supplied imagePrompt if available, else build a rich fallback
    const themeDescriptions: Record<string, string> = {
      apple: 'clean minimalist Apple product aesthetic, white and silver, shallow depth of field, studio lighting',
      startup: 'dark tech startup cinematic, gold and deep purple neon accents, dramatic shadows, moody atmosphere',
      ted: 'powerful dramatic red spotlight on dark stage, cinematic wide angle, emotional intensity',
      futuristic: 'neural network visualization, deep space blue and gold particles, AI consciousness, 8K ultra detail',
      cyberpunk: 'neon-drenched cyberpunk megacity, electric green and hot pink reflections, rain-slicked streets',
      glass: 'crystalline glassmorphism structures, translucent layers, deep blue and violet, ethereal light refraction',
      minimal: 'luxury minimal composition, gold leaf on matte black, Cartier-level elegance, single dramatic light source',
      corporate: 'premium corporate architectural photography, geometric glass facade, blue sky, trust and authority',
      dark_neon: 'dark atmospheric neon lights, orange and purple glow, cinematic fog, urban noir',
      investor: 'financial data visualization, glowing blue graphs ascending, clean dark background, precision and growth',
      agency: 'bold creative agency aesthetic, vibrant orange and pink splashes, dynamic composition, artistic energy',
      education: 'modern educational environment, indigo and cyan tones, knowledge and discovery, warm inspiring light',
      ethiopian: 'rich Ethiopian cultural motifs, green gold and red, traditional patterns meeting modern design',
      academic: 'academic research laboratory, structured blueprints, authoritative navy and forest green',
      brutalist: 'raw brutalist concrete architecture, stark yellow and red geometric forms, high contrast',
    };

    const themeStyle = themeDescriptions[theme] || 'professional cinematic dark aesthetic, dramatic lighting';

    const slideTypeEnhancements: Record<string, string> = {
      title: `Epic cinematic hero visual, 16:9 wide angle, dramatic composition, perfect for a title slide`,
      concept: `Abstract conceptual visualization, sophisticated depth, perfect for illustrating a key idea`,
      data: `Data visualization concept, glowing analytical elements, perfect for a data-driven slide`,
      infographic: `Clean process or system visualization, connected elements flowing, perfect for how-it-works slides`,
      cta: `Inspiring aspirational scene, forward momentum, perfect for a call-to-action slide`,
      agenda: `Organized structured visual rhythm, clear pathways, perfect for an agenda overview`,
      summary: `Convergence and synthesis visual, multiple streams becoming one, perfect for conclusions`,
      quote: `Atmospheric moody background, emotional depth and weight, perfect for a powerful quote`,
      section: `Bold geometric transition visual, strong visual break, perfect for a section divider`,
    };

    const typeHint = slideTypeEnhancements[slideType] || slideTypeEnhancements.concept;

    // Build the final image prompt
    const finalPrompt = imagePrompt
      ? `${imagePrompt}. Style: ${themeStyle}. Photorealistic, ultra high resolution, no text in image, 16:9 composition.`
      : `Create a stunning ${typeHint} about "${slideTitle}". Style: ${themeStyle}. Photorealistic or artistic, ultra high resolution, cinematic lighting, zero text or typography in the image, 16:9 widescreen composition.`;

    console.log('Generating slide image with Nano Banana 2 (gemini-3.1-flash-image-preview)...');
    console.log('Prompt preview:', finalPrompt.substring(0, 100));

    const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-image-preview',
        modalities: ['image', 'text'],
        messages: [
          {
            role: 'user',
            content: finalPrompt,
          },
        ],
        image_config: {
          aspect_ratio: '16:9',
          image_size: '1K',
        },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`Image generation error: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image returned from Nano Banana 2');
    }

    // Upload to Supabase Storage
    const base64Data = imageUrl.split(',')[1];
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/png' });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const userFolder = userId || 'public';
    const fileName = `${userFolder}/${crypto.randomUUID()}.png`;

    const { error: uploadError } = await supabase.storage
      .from('slide-images')
      .upload(fileName, blob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw new Error(`Storage upload error: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from('slide-images')
      .getPublicUrl(fileName);

    console.log('Nano Banana 2 image stored at:', publicUrl);

    return new Response(JSON.stringify({ imageUrl: publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('generate-slide-image error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
