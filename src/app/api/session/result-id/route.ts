import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Buscar resultado na nova tabela quiz_results
    const { data: newResult } = await supabase
      .from('quiz_results')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (newResult) {
      return NextResponse.json({ resultId: newResult.id });
    }

    // Fallback para tabela antiga
    const { data: oldResult } = await supabase
      .from('quiz_session_results')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (oldResult) {
      return NextResponse.json({ resultId: oldResult.id });
    }

    return NextResponse.json(
      { error: 'Resultado não encontrado' },
      { status: 404 }
    );
  } catch (error) {
    console.error('[SESSION RESULT-ID] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

