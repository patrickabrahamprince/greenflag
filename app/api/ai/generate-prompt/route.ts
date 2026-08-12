import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId, day, interests, partnerName } = await req.json();

    if (!matchId || !day || !Array.isArray(interests)) {
      return NextResponse.json({ error: 'matchId, day, and interests are required' }, { status: 400 });
    }

    if (![1, 2, 3].includes(day)) {
      return NextResponse.json({ error: 'day must be 1, 2, or 3' }, { status: 400 });
    }

    const dayPrompts = {
      1: 'Generate a friendly, genuine conversation starter for a first interaction. Focus on shared interests and creating a warm first impression. Keep it short (1-2 sentences). Tone: genuine, warm, non-flirty.',
      2: 'Generate a thoughtful follow-up question that explores values, personality, or deeper interests. Help people move beyond surface-level chat. Tone: curious, genuine, respectful.',
      3: 'Generate a meaningful prompt that invites personal sharing or deeper connection. This is about building real chemistry. Tone: warm, genuine, vulnerable.',
    };

    const interests_str = interests.slice(0, 5).join(', ');
    const systemPrompt = dayPrompts[day as keyof typeof dayPrompts];

    const message = `
Shared interests: ${interests_str}
${partnerName ? `Partner's name: ${partnerName}` : ''}

${systemPrompt}

Return ONLY the conversation starter/question. No explanations, no quotes, no formatting.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a dating app assistant that generates friendly, genuine conversation starters.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const generatedPrompt = completion.choices[0]?.message?.content?.trim();
    if (!generatedPrompt) {
      return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 });
    }

    // Log the AI usage for cost tracking
    const admin = getAdmin();
    await admin.from('ai_usage').insert({
      user_id: user.id,
      match_id: matchId,
      feature: 'day_prompt',
      day_number: day,
      model: 'gpt-4',
      tokens_used: completion.usage?.total_tokens || 0,
      cost_estimate: (completion.usage?.total_tokens || 0) * 0.00003, // Rough estimate
    });

    return NextResponse.json({
      success: true,
      prompt: generatedPrompt,
      tokens: completion.usage?.total_tokens,
    });
  } catch (error) {
    console.error('AI prompt generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
