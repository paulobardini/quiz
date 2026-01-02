import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = supabaseServer();

    const [questionsResult, optionsResult, profilesResult] = await Promise.all([
      supabase
        .from('quiz_questions')
        .select('id')
        .eq('is_active', true),
      supabase
        .from('quiz_question_options')
        .select('id'),
      supabase
        .from('quiz_profile_texts')
        .select('id')
        .eq('content_version', 'v1'),
    ]);

    const questionsCount = questionsResult.data?.length || 0;
    const optionsCount = optionsResult.data?.length || 0;
    const profilesCount = profilesResult.data?.length || 0;

    return NextResponse.json({
      status: 'ok',
      questions: questionsCount,
      options: optionsCount,
      profiles: profilesCount,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

