import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = body.sessionId;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'sessionId é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('id, question_ids, status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      );
    }

    if (session.status === 'completed') {
      return NextResponse.json({
        ok: true,
      });
    }

    const questionIds = session.question_ids || [];

    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('id, domain, weight')
      .in('id', questionIds);

    if (questionsError) {
      return NextResponse.json(
        { error: questionsError.message },
        { status: 500 }
      );
    }

    const { data: answers, error: answersError } = await supabase
      .from('quiz_answers')
      .select('question_id, answer_value')
      .eq('session_id', sessionId);

    if (answersError) {
      return NextResponse.json(
        { error: answersError.message },
        { status: 500 }
      );
    }

    const answeredQuestionIds = new Set(
      answers?.map((a: { question_id: string }) => a.question_id) || []
    );

    const unansweredQuestions = questionIds.filter(
      (id: string) => !answeredQuestionIds.has(id)
    );

    const expectedAnswers = 28;
    if (answeredQuestionIds.size < expectedAnswers) {
      return NextResponse.json(
        { error: `Sessão incompleta: ${answeredQuestionIds.size} de ${expectedAnswers} perguntas respondidas` },
        { status: 409 }
      );
    }

    const answerMap = new Map(
      answers?.map((a: { question_id: string; answer_value: number }) => [
        a.question_id,
        a.answer_value,
      ]) || []
    );

    const domainStats = new Map<
      string,
      { somaObtida: number; somaMaxima: number }
    >();

    questions?.forEach((q: { id: string; domain: string; weight: number }) => {
      const answerValue = answerMap.get(q.id) || 0;
      const weight = q.weight || 1;

      const current = domainStats.get(q.domain) || {
        somaObtida: 0,
        somaMaxima: 0,
      };

      current.somaObtida += weight * answerValue;
      current.somaMaxima += weight * 4;

      domainStats.set(q.domain, current);
    });

    const scores: Record<string, number> = {};
    domainStats.forEach((stats, domain) => {
      if (stats.somaMaxima > 0) {
        scores[domain] = Math.round(
          (stats.somaObtida / stats.somaMaxima) * 100
        );
      } else {
        scores[domain] = 0;
      }
    });

    const sortedDomains = Object.entries(scores).sort(
      (a, b) => b[1] - a[1]
    );

    const primaryProfile = sortedDomains[0]?.[0] || '';
    const secondaryProfile = sortedDomains[1]?.[0] || null;

    const { error: resultError } = await supabase
      .from('quiz_session_results')
      .upsert(
        {
          session_id: sessionId,
          scores,
          primary_profile: primaryProfile,
          secondary_profile: secondaryProfile,
          algorithm_version: 'v1',
        },
        {
          onConflict: 'session_id',
        }
      );

    if (resultError) {
      return NextResponse.json(
        { error: resultError.message },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from('quiz_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
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

