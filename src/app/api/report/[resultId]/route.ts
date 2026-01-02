import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Endpoint para buscar relatório premium completo
 * Retorna todos os dados necessários em uma única chamada:
 * - Perfil dominante com conteúdo free (para contexto)
 * - Conteúdo paid_deepdive (análise profunda)
 * - Conteúdo paid_plan (ajuste prático)
 * - Panorama dos 4 domínios com níveis
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params;

    if (!resultId || typeof resultId !== 'string') {
      return NextResponse.json(
        { error: 'resultId é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Buscar resultado na nova tabela quiz_results ou fallback
    let result: any = null;
    let sessionId: string | null = null;

    const { data: newResult, error: newResultError } = await supabase
      .from('quiz_results')
      .select('id, session_id, dominant_domain_id, dominant_profile_id, scores_json, is_complete')
      .eq('id', resultId)
      .maybeSingle();

    if (newResult && !newResultError) {
      result = newResult;
      sessionId = newResult.session_id;
    } else {
      // Fallback para tabela antiga
      const { data: oldResult, error: oldResultError } = await supabase
        .from('quiz_session_results')
        .select('id, session_id, scores, primary_profile')
        .eq('id', resultId)
        .maybeSingle();

      if (oldResultError || !oldResult) {
        return NextResponse.json(
          { error: 'Resultado não encontrado' },
          { status: 404 }
        );
      }

      result = oldResult;
      sessionId = oldResult.session_id;
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      );
    }

    // Validar que a sessão está completa
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

    // Verificar se existe pagamento aprovado para esta sessão
    const { data: payment, error: paymentError } = await supabase
      .from('kiwify_orders')
      .select('order_id, status, approved_date')
      .eq('s1', sessionId)
      .or('status.eq.paid,status.eq.approved,status.eq.completed,approved_date.not.is.null')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (paymentError) {
      console.error('[REPORT] Erro ao verificar pagamento:', paymentError);
    }

    const hasApprovedPayment = !!payment && (
      ['paid', 'approved', 'completed'].includes(payment.status?.toLowerCase() || '') ||
      !!payment.approved_date
    );

    if (!hasApprovedPayment) {
      console.log('[REPORT] Pagamento não aprovado para sessão:', sessionId);
      return NextResponse.json(
        { 
          error: 'Pagamento não encontrado ou não aprovado',
          requiresPayment: true,
          message: 'É necessário ter um pagamento aprovado para acessar o relatório completo.'
        },
        { status: 402 } // 402 Payment Required
      );
    }

    console.log('[REPORT] Pagamento aprovado encontrado:', payment.order_id);

    // Buscar domínio e perfil dominantes
    let dominantDomain: any = null;
    let dominantProfile: any = null;

    if (result.dominant_domain_id && result.dominant_profile_id) {
      // Usar IDs da nova estrutura
      const { data: domain } = await supabase
        .from('quiz_domains')
        .select('id, key, name, short_label')
        .eq('id', result.dominant_domain_id)
        .single();

      const { data: profile } = await supabase
        .from('quiz_profiles')
        .select('id, key, name')
        .eq('id', result.dominant_profile_id)
        .single();

      if (domain) dominantDomain = domain;
      if (profile) dominantProfile = profile;
    }

    // Fallback: buscar da estrutura antiga se necessário
    if (!dominantDomain || !dominantProfile) {
      const scores = result.scores_json || result.scores || {};
      const primaryDomainKey = result.primary_profile || Object.keys(scores)[0];
      
      if (primaryDomainKey) {
        const { data: domain } = await supabase
          .from('quiz_domains')
          .select('id, key, name, short_label')
          .eq('key', primaryDomainKey)
          .single();

        if (domain) {
          dominantDomain = domain;
          
          // Buscar perfil baseado no score
          const score = scores[primaryDomainKey] || 0;
          const roundedScore = Math.round(Math.max(0, Math.min(100, score)));
          
          // Buscar regra de perfil
          const { data: rule } = await supabase
            .from('quiz_profile_rules')
            .select('profile_key')
            .eq('domain', primaryDomainKey)
            .eq('algorithm_version', 'v1')
            .gte('min_score', roundedScore)
            .lte('max_score', roundedScore)
            .maybeSingle();

          if (rule?.profile_key) {
            const { data: profile } = await supabase
              .from('quiz_profiles')
              .select('id, key, name')
              .eq('key', rule.profile_key)
              .eq('domain_id', domain.id)
              .single();

            if (profile) dominantProfile = profile;
          }
        }
      }
    }

    if (!dominantDomain || !dominantProfile) {
      return NextResponse.json(
        { error: 'Dados de perfil dominante não encontrados' },
        { status: 404 }
      );
    }

    // Buscar conteúdo PREMIUM do perfil dominante (NÃO usar free_summary ou free_impact)
    let paidDeepdive = null;
    let paidPlan = null;

    if (dominantProfile.id && dominantProfile.id !== 'fallback') {
      // Buscar apenas conteúdo premium
      const { data: deepdiveContent } = await supabase
        .from('quiz_profile_content')
        .select('body, title')
        .eq('profile_id', dominantProfile.id)
        .eq('content_type', 'paid_deepdive')
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: planContent } = await supabase
        .from('quiz_profile_content')
        .select('body, title')
        .eq('profile_id', dominantProfile.id)
        .eq('content_type', 'paid_plan')
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      paidDeepdive = deepdiveContent?.body || null;
      paidPlan = planContent?.body || null;
    }

    // Fallback: buscar de quiz_profile_texts se não encontrou
    if ((!paidDeepdive || !paidPlan) && dominantProfile.key) {
      const { data: profileText } = await supabase
        .from('quiz_profile_texts')
        .select('paid_deep_dive, action_plan')
        .eq('profile_key', dominantProfile.key)
        .eq('content_version', 'v1')
        .maybeSingle();

      if (profileText) {
        if (!paidDeepdive && profileText.paid_deep_dive) {
          paidDeepdive = profileText.paid_deep_dive;
        }
        if (!paidPlan && profileText.action_plan) {
          // action_plan pode ser um objeto, extrair texto se necessário
          if (typeof profileText.action_plan === 'string') {
            paidPlan = profileText.action_plan;
          } else if (typeof profileText.action_plan === 'object') {
            paidPlan = JSON.stringify(profileText.action_plan);
          }
        }
      }
    }

    // Buscar domínios com scores, níveis e textos interpretativos
    const scores = result.scores_json || result.scores || {};
    const domains = ['clareza', 'constancia', 'emocional', 'prosperidade'];
    
    const domainsWithLevels = await Promise.all(
      domains.map(async (domainKey) => {
        const score = scores[domainKey] || 0;
        const roundedScore = Math.round(Math.max(0, Math.min(100, score)));
        const level = getLevelFromScore(roundedScore);

        // Buscar domínio
        const { data: domain } = await supabase
          .from('quiz_domains')
          .select('id, key, name, short_label')
          .eq('key', domainKey)
          .single();

        // Buscar rank (ordem por score)
        const allScores = domains.map(d => ({
          key: d,
          score: scores[d] || 0,
        }));
        allScores.sort((a, b) => b.score - a.score);
        const rank = allScores.findIndex(d => d.key === domainKey) + 1;

        // Buscar perfil correspondente ao domínio e score
        let interpretativeText = null;
        const { data: rule } = await supabase
          .from('quiz_profile_rules')
          .select('profile_key')
          .eq('domain', domainKey)
          .eq('algorithm_version', 'v1')
          .gte('min_score', roundedScore)
          .lte('max_score', roundedScore)
          .maybeSingle();

        if (rule?.profile_key && domain?.id) {
          // Buscar perfil
          const { data: profile } = await supabase
            .from('quiz_profiles')
            .select('id')
            .eq('key', rule.profile_key)
            .eq('domain_id', domain.id)
            .maybeSingle();

          if (profile?.id) {
            // Buscar texto interpretativo (paid_deepdive) do perfil
            const { data: deepdiveContent } = await supabase
              .from('quiz_profile_content')
              .select('body')
              .eq('profile_id', profile.id)
              .eq('content_type', 'paid_deepdive')
              .eq('is_active', true)
              .order('version', { ascending: false })
              .limit(1)
              .maybeSingle();

            interpretativeText = deepdiveContent?.body || null;

            // Fallback para quiz_profile_texts
            if (!interpretativeText) {
              const { data: profileText } = await supabase
                .from('quiz_profile_texts')
                .select('paid_deep_dive')
                .eq('profile_key', rule.profile_key)
                .eq('content_version', 'v1')
                .maybeSingle();

              interpretativeText = profileText?.paid_deep_dive || null;
            }
          }
        }

        return {
          domain: domain || {
            id: 'fallback',
            key: domainKey,
            name: domainKey.charAt(0).toUpperCase() + domainKey.slice(1),
            shortLabel: domainKey.charAt(0).toUpperCase() + domainKey.slice(1),
          },
          level,
          rank,
          interpretativeText,
        };
      })
    );

    // Ordenar por rank
    domainsWithLevels.sort((a, b) => a.rank - b.rank);

    // Buscar UI copy para o relatório
    const { data: uiCopy } = await supabase
      .from('quiz_ui_copy')
      .select('key, value')
      .in('key', [
        'report_title',
        'report_subtitle',
        'report_ethical_note',
        'report_recap',
        'report_closing',
      ])
      .eq('is_active', true);

    const uiCopyMap: Record<string, string> = {};
    if (uiCopy) {
      uiCopy.forEach(item => {
        uiCopyMap[item.key] = item.value;
      });
    }

    return NextResponse.json({
      resultId,
      dominant: {
        domain: dominantDomain,
        profile: dominantProfile,
      },
      paidContent: {
        // paid_deepdive contém: por que se forma + onde trava
        deepdive: paidDeepdive || 'Análise profunda não disponível.',
        plan: paidPlan || 'Plano de ajuste não disponível.',
      },
      domains: domainsWithLevels,
      uiCopy: {
        title: uiCopyMap.report_title || 'Leitura Completa do Seu Padrão de Decisão',
        subtitle: uiCopyMap.report_subtitle || 'Este relatório aprofunda os padrões observados nas suas respostas.\nEle não faz diagnóstico nem rotula você.\nEle oferece leitura, consciência e direção.',
        ethicalNote: uiCopyMap.report_ethical_note || '',
        recap: uiCopyMap.report_recap || 'No resultado gratuito, você viu como esse padrão aparece nas decisões do dia a dia.\nAgora vamos aprofundar o que sustenta esse comportamento.',
        closingText: uiCopyMap.report_closing || 'Consciência não muda tudo de uma vez.\nMas muda o ponto de partida.',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar relatório:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função auxiliar para mapear score para level (5 faixas)
function getLevelFromScore(score: number): string {
  if (score >= 0 && score <= 19) return 'Muito Baixo';
  if (score >= 20 && score <= 39) return 'Baixo';
  if (score >= 40 && score <= 59) return 'Médio';
  if (score >= 60 && score <= 79) return 'Alto';
  if (score >= 80 && score <= 100) return 'Muito Alto';
  return 'Médio';
}

