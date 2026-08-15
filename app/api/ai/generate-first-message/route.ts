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

    const { matchId, partnerName, partnerInterests, yourName, yourInterests } = await req.json();

    if (!matchId || !partnerName) {
      return NextResponse.json({ error: 'matchId and partnerName are required' }, { status: 400 });
    }

    const shared = (yourInterests || [])
      .filter((i: string) => (partnerInterests || []).includes(i))
      .slice(0, 3)
      .join(', ');

    const message = `
You are helping someone craft their first message to a match. Make it personal, genuine, and warm.

Their name: ${yourName || 'You'}
Match's name: ${partnerName}
Shared interests: ${shared || 'similar values and interests'}

Generate a genuine, warm first message (2-3 sentences max). Focus on shared interests and creating a real connection.
No emojis, no generic openers, just authentic.

Return ONLY the message text. No explanations or quotes.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a dating app assistant that helps people write genuine, warm first messages.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    const generatedMessage = completion.choices[0]?.message?.content?.trim();
    if (!generatedMessage) {
      return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 });
    }

    // Log usage
    const admin = getAdmin();
    await admin.from('ai_usage').insert({
      user_id: user.id,
      match_id: matchId,
      feature: 'first_message',
      model: 'gpt-4',
      tokens_used: completion.usage?.total_tokens || 0,
      cost_estimate: (completion.usage?.total_tokens || 0) * 0.00003,
    });

    return NextResponse.json({
      success: true,
      message: generatedMessage,
      tokens: completion.usage?.total_tokens,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('AI first message generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
