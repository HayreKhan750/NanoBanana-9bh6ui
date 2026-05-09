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
    const { slideTitle, slideType, theme, accentColor, userId } = body;

    // Build a cinematic, specific image prompt for the slide
    const themeDescriptions: Record<string, string> = {
      startup: 'dark tech startup aesthetic, neon accents, bold typography, futuristic',
      ted: 'dramatic red and black TED stage aesthetic, powerful and inspiring',
      apple: 'clean minimal Apple keynote style, white space, elegant',
      futuristic: 'neural network AI visualization, deep blue and gold, futuristic',
      cyberpunk: 'neon green and pink cyberpunk cityscape, gritty and electric',
      glass: 'glassmorphism aesthetic, translucent panels, deep blue and purple',
      minimal: 'luxury minimal gold and black, elegant and refined',
      corporate: 'professional corporate blue and gold, trustworthy and polished',
      dark_neon: 'vivid neon orange and purple, atmospheric dark background',
      investor: 'data visualization, financial charts, clean blue and green',
      agency: 'creative agency bold orange and pink, expressive',
      education: 'educational indigo and cyan, structured and modern',
      ethiopian: 'Ethiopian green, yellow and red heritage colors, vibrant patterns',
      academic: 'academic research blue and green, structured and authoritative',
      brutalist: 'brutalist yellow and red, raw and bold design',
    };

    const themeStyle = themeDescriptions[theme] || 'professional dark cinematic';

    const slideTypePrompts: Record<string, string> = {
      title: `Epic cinematic wide-angle hero visual for "${slideTitle}", ${themeStyle}, 16:9 aspect ratio, no text, ultra high resolution`,
      concept: `Abstract conceptual visualization representing "${slideTitle}", ${themeStyle}, sophisticated depth and lighting, no text, photorealistic`,
      data: `Data visualization and analytics concept representing "${slideTitle}", glowing graphs and charts, ${themeStyle}, no text`,
      infographic: `Process and workflow visualization for "${slideTitle}", connected nodes and flow, ${themeStyle}, no text`,
      cta: `Inspiring call-to-action background for "${slideTitle}", dynamic and energetic, ${themeStyle}, no text`,
      agenda: `Clean structured layout background, ${themeStyle}, minimal, no text`,
      summary: `Convergence and conclusion visual for "${slideTitle}", ${themeStyle}, powerful composition, no text`,
      quote: `Dramatic atmospheric background for a quote about "${slideTitle}", ${themeStyle}, emotional depth, no text`,
      section: `Bold section divider visual, ${themeStyle}, strong geometric forms, no text`,
    };

    const imagePrompt = slideTypePrompts[slideType] || slideTypePrompts.concept;

    console.log('Generating slide image with Nano Banana 2...');

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
            content: imagePrompt,
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
      throw new Error('No image returned from AI');
    }

    // Convert base64 to blob and upload to Supabase Storage
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

    if (uploadError) {
      throw new Error(`Storage upload error: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('slide-images')
      .getPublicUrl(fileName);

    console.log('Image generated and stored:', publicUrl);

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
