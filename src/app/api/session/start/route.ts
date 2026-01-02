import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  if (count >= arr.length) {
    return shuffle(arr);
  }
  const shuffled = shuffle(arr);
  return shuffled.slice(0, count);
}

export async function POST(req: Request) {
  try {
    const supabase = supabaseServer();

    const domains = ['clareza', 'constancia', 'emocional', 'prosperidade'];
    const questionsPerDomain = 7;
    const totalQuestions = 28;

    const selectedIdsByDomain: string[] = [];

    for (const domain of domains) {
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('is_active', true)
        .eq('domain', domain);

      if (questionsError) {
        return NextResponse.json(
          { error: questionsError.message },
          { status: 500 }
        );
      }

      if (!questions || questions.length < questionsPerDomain) {
        return NextResponse.json(
          { error: `Domínio ${domain} não possui pelo menos ${questionsPerDomain} perguntas ativas` },
          { status: 400 }
        );
      }

      const domainIds = pickRandom(
        questions.map((q: { id: string }) => q.id),
        questionsPerDomain
      );

      selectedIdsByDomain.push(...domainIds);
    }

    const finalQuestionIds = shuffle(selectedIdsByDomain);

    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .insert({
        question_ids: finalQuestionIds,
        question_count: totalQuestions,
        status: 'in_progress',
      })
      .select()
      .single();

    if (sessionError) {
      return NextResponse.json(
        { error: sessionError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      total: totalQuestions,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

