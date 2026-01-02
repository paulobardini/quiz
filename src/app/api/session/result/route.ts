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

    const { data: result, error: resultError } = await supabase
      .from('quiz_session_results')
      .select('scores, primary_profile, secondary_profile')
      .eq('session_id', sessionId)
      .single();

    if (resultError || !result) {
      return NextResponse.json(
        { error: 'Resultado não encontrado' },
        { status: 404 }
      );
    }

    const scores = result.scores as Record<string, number>;
    const primaryDomain = result.primary_profile;
    const secondaryDomain = result.secondary_profile;

    const primaryScore = scores[primaryDomain] || 0;
    const secondaryScore = secondaryDomain ? scores[secondaryDomain] || 0 : 0;

    const { data: primaryProfileKeyData } = await supabase
      .from('quiz_profile_rules')
      .select('profile_key')
      .eq('domain', primaryDomain)
      .eq('algorithm_version', 'v1')
      .gte('min_score', primaryScore)
      .lte('max_score', primaryScore)
      .single();

    const primaryProfileKey = primaryProfileKeyData?.profile_key || null;

    let primaryProfileText = null;
    if (primaryProfileKey) {
      const { data: primaryText } = await supabase
        .from('quiz_profile_texts')
        .select('title, free_summary')
        .eq('profile_key', primaryProfileKey)
        .eq('content_version', 'v1')
        .single();

      if (primaryText) {
        primaryProfileText = {
          key: primaryProfileKey,
          title: primaryText.title,
          freeSummary: primaryText.free_summary,
        };
      }
    }

    let secondaryProfileText = null;
    if (secondaryDomain && secondaryScore > 0) {
      const { data: secondaryProfileKeyData } = await supabase
        .from('quiz_profile_rules')
        .select('profile_key')
        .eq('domain', secondaryDomain)
        .eq('algorithm_version', 'v1')
        .gte('min_score', secondaryScore)
        .lte('max_score', secondaryScore)
        .single();

      const secondaryProfileKey = secondaryProfileKeyData?.profile_key || null;

      if (secondaryProfileKey) {
        const { data: secondaryText } = await supabase
          .from('quiz_profile_texts')
          .select('title')
          .eq('profile_key', secondaryProfileKey)
          .eq('content_version', 'v1')
          .single();

        if (secondaryText) {
          secondaryProfileText = {
            key: secondaryProfileKey,
            title: secondaryText.title,
          };
        }
      }
    }

    return NextResponse.json({
      scores: {
        clareza: scores.clareza || 0,
        constancia: scores.constancia || 0,
        emocional: scores.emocional || 0,
        prosperidade: scores.prosperidade || 0,
      },
      primaryDomain,
      secondaryDomain: secondaryDomain || null,
      primaryProfile: primaryProfileText,
      secondaryProfile: secondaryProfileText,
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

