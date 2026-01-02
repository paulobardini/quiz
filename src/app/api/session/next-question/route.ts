import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

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
    const isDebug = process.env.QUIZ_DEBUG === 'true';

    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('id, status, question_ids')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      );
    }

    if (session.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Sessão não está em progresso' },
        { status: 409 }
      );
    }

    const { data: answers, error: answersError } = await supabase
      .from('quiz_answers')
      .select('question_id')
      .eq('session_id', sessionId);

    if (answersError) {
      return NextResponse.json(
        { error: answersError.message },
        { status: 500 }
      );
    }

    const answeredIds = new Set(
      answers?.map((a: { question_id: string }) => a.question_id) || []
    );

    const questionIds = session.question_ids || [];
    const nextQuestionId = questionIds.find(
      (id: string) => !answeredIds.has(id)
    );

    const totalQuestions = questionIds.length;
    const answeredCount = answeredIds.size;

    if (!nextQuestionId) {
      return NextResponse.json({
        done: true,
        progress: {
          answered: answeredCount,
          total: totalQuestions,
        },
      });
    }

    const questionIndex = questionIds.indexOf(nextQuestionId);

    const { data: question, error: questionError } = await supabase
      .from('quiz_questions')
      .select('id, domain, prompt, weight')
      .eq('id', nextQuestionId)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: 'Pergunta não encontrada' },
        { status: 404 }
      );
    }

    const { data: options, error: optionsError } = await supabase
      .from('quiz_question_options')
      .select('id, label, position')
      .eq('question_id', nextQuestionId)
      .order('position', { ascending: true });

    if (optionsError) {
      return NextResponse.json(
        { error: optionsError.message },
        { status: 500 }
      );
    }

    const response: {
      done: false;
      question: {
        id: string;
        domain: string;
        prompt: string;
        weight: number;
      };
      options: Array<{ id: string; label: string; position: number }>;
      progress: { answered: number; total: number };
      debug?: { questionIndex: number };
    } = {
      done: false,
      question: {
        id: question.id,
        domain: question.domain,
        prompt: question.prompt,
        weight: question.weight,
      },
      options: options?.map((opt: { id: string; label: string; position: number }) => ({
        id: opt.id,
        label: opt.label,
        position: opt.position,
      })) || [],
      progress: {
        answered: answeredCount,
        total: totalQuestions,
      },
    };

    if (isDebug) {
      response.debug = { questionIndex };
    }

    return NextResponse.json(response);
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

