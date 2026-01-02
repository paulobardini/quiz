import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, questionId, optionId } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'sessionId é obrigatório' },
        { status: 400 }
      );
    }

    if (!questionId || typeof questionId !== 'string') {
      return NextResponse.json(
        { error: 'questionId é obrigatório' },
        { status: 400 }
      );
    }

    if (!optionId || typeof optionId !== 'string') {
      return NextResponse.json(
        { error: 'optionId é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('status, question_ids')
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

    const questionIds = session.question_ids || [];
    if (!questionIds.includes(questionId)) {
      return NextResponse.json(
        { error: 'Pergunta não pertence a esta sessão' },
        { status: 400 }
      );
    }

    const { data: option, error: optionError } = await supabase
      .from('quiz_question_options')
      .select('score')
      .eq('id', optionId)
      .eq('question_id', questionId)
      .single();

    if (optionError || !option) {
      return NextResponse.json(
        { error: 'Opção não encontrada ou não pertence à pergunta informada' },
        { status: 400 }
      );
    }

    const { error: upsertError } = await supabase
      .from('quiz_answers')
      .upsert(
        {
          session_id: sessionId,
          question_id: questionId,
          option_id: optionId,
          answer_value: option.score,
        },
        {
          onConflict: 'session_id,question_id',
        }
      );

    if (upsertError) {
      return NextResponse.json(
        { error: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
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

