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
    const { data: payments, error: paymentError } = await supabase
      .from('kiwify_orders')
      .select('order_id, status, approved_date')
      .eq('s1', sessionId)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (paymentError) {
      console.error('[REPORT] Erro ao verificar pagamento:', paymentError);
    }

    // Verificar se algum pagamento está aprovado
    const payment = payments?.find(p => {
      const status = p.status?.toLowerCase() || '';
      return ['paid', 'approved', 'completed'].includes(status) || !!p.approved_date;
    });

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
    console.log('[REPORT] Result data:', {
      hasDominantDomainId: !!result.dominant_domain_id,
      hasDominantProfileId: !!result.dominant_profile_id,
      hasScores: !!result.scores_json || !!result.scores,
      hasPrimaryProfile: !!result.primary_profile,
    });

    // Buscar domínio e perfil dominantes
    let dominantDomain: any = null;
    let dominantProfile: any = null;

    if (result.dominant_domain_id && result.dominant_profile_id) {
      // Usar IDs da nova estrutura
      console.log('[REPORT] Tentando buscar usando IDs diretos:', {
        domainId: result.dominant_domain_id,
        profileId: result.dominant_profile_id,
      });
      
      const { data: domain, error: domainError } = await supabase
        .from('quiz_domains')
        .select('id, key, name, short_label')
        .eq('id', result.dominant_domain_id)
        .maybeSingle();

      const { data: profile, error: profileError } = await supabase
        .from('quiz_profiles')
        .select('id, key, name')
        .eq('id', result.dominant_profile_id)
        .maybeSingle();

      if (domainError) console.error('[REPORT] Erro ao buscar domínio:', domainError);
      if (profileError) console.error('[REPORT] Erro ao buscar perfil:', profileError);

      if (domain) {
        dominantDomain = domain;
        console.log('[REPORT] Domínio encontrado:', domain.key);
      }
      if (profile) {
        dominantProfile = profile;
        console.log('[REPORT] Perfil encontrado:', profile.key);
      }
    }

    // Fallback: buscar da estrutura antiga se necessário
    if (!dominantDomain || !dominantProfile) {
      console.log('[REPORT] Usando fallback para buscar perfil dominante');
      const scores = result.scores_json || result.scores || {};
      console.log('[REPORT] Scores disponíveis:', scores);
      
      // Determinar domínio primário: usar primary_profile se disponível, senão o domínio com maior score
      let primaryDomainKey = result.primary_profile;
      
      if (!primaryDomainKey && Object.keys(scores).length > 0) {
        // Encontrar domínio com maior score
        const sortedDomains = Object.entries(scores)
          .map(([key, value]: [string, any]) => ({ key, score: Number(value) || 0 }))
          .sort((a, b) => b.score - a.score);
        
        primaryDomainKey = sortedDomains[0]?.key;
        console.log('[REPORT] Domínio primário calculado pelo score:', primaryDomainKey);
      }
      
      if (primaryDomainKey) {
        console.log('[REPORT] Buscando domínio por key:', primaryDomainKey);
        const { data: domain, error: domainError } = await supabase
          .from('quiz_domains')
          .select('id, key, name, short_label')
          .eq('key', primaryDomainKey)
          .maybeSingle();

        if (domainError) console.error('[REPORT] Erro ao buscar domínio por key:', domainError);

        if (domain) {
          dominantDomain = domain;
          console.log('[REPORT] Domínio encontrado no fallback:', domain.key);
          
          // Buscar perfil baseado no score
          const score = scores[primaryDomainKey] || 0;
          const roundedScore = Math.round(Math.max(0, Math.min(100, score)));
          console.log('[REPORT] Score do domínio primário:', roundedScore);
          
          // Buscar regra de perfil - buscar regra onde o score está dentro do range
          const { data: rules, error: ruleError } = await supabase
            .from('quiz_profile_rules')
            .select('profile_key, min_score, max_score')
            .eq('domain', primaryDomainKey)
            .eq('algorithm_version', 'v1')
            .order('min_score', { ascending: true });

          if (ruleError) console.error('[REPORT] Erro ao buscar regras:', ruleError);

          // Encontrar a regra que contém o score
          let rule = null;
          if (rules && rules.length > 0) {
            rule = rules.find(r => roundedScore >= r.min_score && roundedScore <= r.max_score);
            if (!rule) {
              // Se não encontrou exato, pegar a regra mais próxima
              rule = rules.reduce((closest, current) => {
                const currentDist = Math.abs((current.min_score + current.max_score) / 2 - roundedScore);
                const closestDist = Math.abs((closest.min_score + closest.max_score) / 2 - roundedScore);
                return currentDist < closestDist ? current : closest;
              });
              console.log('[REPORT] Regra exata não encontrada, usando regra mais próxima:', rule);
            }
          }

          if (ruleError) console.error('[REPORT] Erro ao buscar regra:', ruleError);

          if (rule?.profile_key) {
            console.log('[REPORT] Regra encontrada, profile_key:', rule.profile_key, 'range:', rule.min_score, '-', rule.max_score);
            const { data: profile, error: profileError } = await supabase
              .from('quiz_profiles')
              .select('id, key, name')
              .eq('key', rule.profile_key)
              .eq('domain_id', domain.id)
              .maybeSingle();

            if (profileError) console.error('[REPORT] Erro ao buscar perfil por key:', profileError);

            if (profile) {
              dominantProfile = profile;
              console.log('[REPORT] Perfil encontrado no fallback:', profile.key);
            } else {
              console.warn('[REPORT] Perfil não encontrado com key:', rule.profile_key, 'e domain_id:', domain.id);
              // Tentar buscar sem domain_id como último recurso
              const { data: profileFallback } = await supabase
                .from('quiz_profiles')
                .select('id, key, name')
                .eq('key', rule.profile_key)
                .maybeSingle();
              
              if (profileFallback) {
                dominantProfile = profileFallback;
                console.log('[REPORT] Perfil encontrado sem domain_id:', profileFallback.key);
              }
            }
          } else {
            console.warn('[REPORT] Regra não encontrada para domain:', primaryDomainKey, 'score:', roundedScore);
            if (rules && rules.length > 0) {
              console.warn('[REPORT] Regras disponíveis:', rules);
            }
          }
        } else {
          console.warn('[REPORT] Domínio não encontrado com key:', primaryDomainKey);
        }
      } else {
        console.warn('[REPORT] Nenhum domínio primário identificado');
      }
    }

    // ÚLTIMO RECURSO: Se ainda não encontrou, buscar qualquer perfil do domínio primário
    if (!dominantDomain || !dominantProfile) {
      console.warn('[REPORT] ÚLTIMO RECURSO: Tentando buscar qualquer perfil disponível');
      const scores = result.scores_json || result.scores || {};
      const domainKeys = ['clareza', 'constancia', 'emocional', 'prosperidade'];
      
      // Tentar cada domínio até encontrar um
      for (const domainKey of domainKeys) {
        const { data: domain } = await supabase
          .from('quiz_domains')
          .select('id, key, name, short_label')
          .eq('key', domainKey)
          .maybeSingle();
        
        if (domain) {
          // Buscar qualquer perfil desse domínio
          const { data: anyProfile } = await supabase
            .from('quiz_profiles')
            .select('id, key, name')
            .eq('domain_id', domain.id)
            .limit(1)
            .maybeSingle();
          
          if (anyProfile) {
            dominantDomain = domain;
            dominantProfile = anyProfile;
            console.log('[REPORT] Perfil encontrado no último recurso:', domain.key, anyProfile.key);
            break;
          }
        }
      }
    }

    // Se AINDA não encontrou, criar perfil fallback
    if (!dominantDomain || !dominantProfile) {
      console.error('[REPORT] ERRO CRÍTICO: Criando perfil fallback', {
        hasDomain: !!dominantDomain,
        hasProfile: !!dominantProfile,
        resultData: {
          dominant_domain_id: result.dominant_domain_id,
          dominant_profile_id: result.dominant_profile_id,
          primary_profile: result.primary_profile,
          scores: result.scores_json || result.scores,
        },
      });
      
      // Criar domínio e perfil fallback para garantir que sempre retorne algo
      dominantDomain = {
        id: 'fallback',
        key: result.primary_profile || 'clareza',
        name: result.primary_profile ? result.primary_profile.charAt(0).toUpperCase() + result.primary_profile.slice(1) : 'Clareza',
        short_label: result.primary_profile || 'Clareza',
      };
      
      dominantProfile = {
        id: 'fallback',
        key: 'default',
        name: 'Padrão',
      };
      
      console.log('[REPORT] Usando perfil fallback:', dominantDomain.key, dominantProfile.key);
    }

    console.log('[REPORT] Perfil dominante encontrado:', {
      domain: dominantDomain.key,
      profile: dominantProfile.key,
    });

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

    // GARANTIR que sempre tenha conteúdo, mesmo que genérico - NUNCA retornar null
    if (!paidDeepdive) {
      paidDeepdive = 'Este relatório aprofunda os padrões observados nas suas respostas. Continue explorando para entender melhor seus padrões de decisão.';
      console.warn('[REPORT] Usando conteúdo genérico para deepdive');
    }
    if (!paidPlan) {
      paidPlan = 'Reflita sobre as decisões do seu dia a dia e observe os padrões que se repetem. Pequenos ajustes conscientes podem gerar grandes mudanças.';
      console.warn('[REPORT] Usando conteúdo genérico para plan');
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

