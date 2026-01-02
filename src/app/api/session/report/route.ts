import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { buildFreeReport, buildPaidReport } from '@/lib/quiz/reportBuilder';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, type } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'sessionId é obrigatório' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'free' && type !== 'paid')) {
      return NextResponse.json(
        { error: 'type deve ser "free" ou "paid"' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('id, status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      );
    }

    if (session.status !== 'completed') {
      return NextResponse.json(
        { error: 'Sessão não está completa' },
        { status: 409 }
      );
    }

    let report: Awaited<ReturnType<typeof buildFreeReport>> | Awaited<ReturnType<typeof buildPaidReport>>;

    try {
      if (type === 'free') {
        report = await buildFreeReport(sessionId);
      } else {
        report = await buildPaidReport(sessionId);
      }
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: 'Erro ao construir relatório' },
        { status: 500 }
      );
    }

    const { error: reportError } = await supabase
      .from('quiz_reports')
      .upsert(
        {
          session_id: sessionId,
          report_type: type,
          content: report,
        },
        {
          onConflict: 'session_id,report_type',
        }
      );

    if (reportError) {
      return NextResponse.json(
        { error: reportError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reportType: type,
      content: report,
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

