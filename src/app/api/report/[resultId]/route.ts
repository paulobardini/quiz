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

    // Preparar parágrafos para fallback
    const splitIntoParagraphs = (text: string | null): string[] => {
      if (!text) return ['', '', ''];
      const sentences = text.split(/[.!?]\s+/).filter(s => s.trim());
      const total = sentences.length;
      if (total === 0) return ['', '', ''];
      if (total <= 3) return [sentences.join('. '), '', ''];
      
      const p1End = Math.ceil(total / 3);
      const p2End = Math.ceil((total * 2) / 3);
      
      return [
        sentences.slice(0, p1End).join('. ') + (p1End < total ? '.' : ''),
        sentences.slice(p1End, p2End).join('. ') + (p2End < total ? '.' : ''),
        sentences.slice(p2End).join('. ') + (p2End < total ? '.' : '')
      ];
    };

    const deepdiveParagraphs = splitIntoParagraphs(paidDeepdive);
    const planParagraphs = splitIntoParagraphs(paidPlan);

    // Buscar blocos do relatório premium
    let blocks = [];
    let premiumTitle = null;
    
    console.log('[REPORT] Buscando premium_report_content para profile_id:', dominantProfile.id);
    
    if (dominantProfile.id && dominantProfile.id !== 'fallback') {
      const { data: premiumContent, error: premiumError } = await supabase
        .from('premium_report_content')
        .select('title, blocks, version')
        .eq('profile_id', dominantProfile.id)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Log para debug de encoding
      if (premiumContent) {
        console.log('[REPORT] Premium content raw:', JSON.stringify(premiumContent).substring(0, 200));
        if (premiumContent.title) {
          console.log('[REPORT] Title encoding check:', premiumContent.title, 'charCodeAt(0):', premiumContent.title.charCodeAt(0));
        }
      }

      if (premiumError) {
        console.error('[REPORT] Erro ao buscar premium_report_content:', premiumError);
      }

      console.log('[REPORT] Premium content encontrado:', {
        hasContent: !!premiumContent,
        hasTitle: !!premiumContent?.title,
        hasBlocks: !!premiumContent?.blocks,
        blocksCount: premiumContent?.blocks ? (Array.isArray(premiumContent.blocks) ? premiumContent.blocks.length : 0) : 0,
        version: premiumContent?.version
      });

      if (premiumContent) {
        if (premiumContent.blocks && Array.isArray(premiumContent.blocks)) {
          blocks = premiumContent.blocks;
          console.log('[REPORT] Blocos carregados:', blocks.length, 'blocos');
        } else {
          console.warn('[REPORT] Premium content encontrado mas blocks não é array:', typeof premiumContent.blocks);
        }
        if (premiumContent.title) {
          premiumTitle = premiumContent.title;
        }
      } else {
        console.warn('[REPORT] Nenhum premium_report_content encontrado para profile_id:', dominantProfile.id, 'profile_key:', dominantProfile.key);
        // Se não encontrou blocos estruturados, usar conteúdo paid_deepdive e paid_plan específico do perfil
        if (paidDeepdive || paidPlan) {
          console.log('[REPORT] Usando conteúdo paid_deepdive/paid_plan específico do perfil como fallback');
          const deepdiveParagraphs = splitIntoParagraphs(paidDeepdive);
          const planParagraphs = splitIntoParagraphs(paidPlan);
          
          blocks = [
            {
              order: 1,
              block_id: 'abertura',
              title: 'Abertura',
              subtitle: 'Validação e leitura inicial do padrão',
              paragraphs: [
                'Você identificou um padrão claro nas suas decisões. Isso não é um defeito, é uma forma de funcionar que se consolidou ao longo do tempo.',
                'Este conteúdo vai te ajudar a entender por que esse padrão existe, como ele aparece no seu dia a dia e o que você pode fazer para ajustá-lo quando necessário.',
                'O objetivo não é mudar quem você é, mas ampliar sua consciência sobre como você decide.'
              ]
            },
            {
              order: 2,
              block_id: 'padrao_acao',
              title: 'O Padrão em Ação',
              subtitle: 'Como isso aparece no seu dia a dia',
              paragraphs: deepdiveParagraphs.filter(p => p).length >= 3 ? deepdiveParagraphs : [
                'Este padrão se manifesta de forma consistente nas suas escolhas.',
                'Ele aparece especialmente em situações que exigem decisão rápida.',
                'Reconhecer esse padrão é o primeiro passo para ter mais controle.'
              ]
            },
            {
              order: 3,
              block_id: 'ajuste_pratico',
              title: 'Ajuste Prático',
              subtitle: 'O que você pode fazer',
              paragraphs: planParagraphs.filter(p => p).length >= 3 ? planParagraphs : [
                'Existem ajustes práticos que você pode fazer para trabalhar com esse padrão.',
                'O importante é começar pequeno e ser consistente.',
                'Cada pequeno ajuste contribui para uma mudança maior ao longo do tempo.'
              ]
            }
          ];
        }
      }
    } else {
      console.warn('[REPORT] Profile ID inválido ou fallback:', dominantProfile.id);
    }

    // Fallback genérico APENAS se não encontrou NADA específico do perfil
    if (blocks.length === 0) {
      console.error('[REPORT] ERRO: Nenhum conteúdo encontrado para o perfil. Usando fallback genérico (ISSO NÃO DEVERIA ACONTECER).');
      blocks = [
        {
          order: 1,
          block_id: 'abertura',
          title: 'BLOCO 1 — ABERTURA',
          subtitle: 'Validação e leitura inicial do padrão',
          paragraphs: [
            'Você identificou um padrão claro nas suas decisões. Isso não é um defeito, é uma forma de funcionar que se consolidou ao longo do tempo.',
            'Este relatório vai te ajudar a entender por que esse padrão existe, como ele aparece no seu dia a dia e o que você pode fazer para ajustá-lo quando necessário.',
            'O objetivo não é mudar quem você é, mas ampliar sua consciência sobre como você decide.'
          ]
        },
        {
          order: 2,
          block_id: 'padrao_acao',
          title: 'BLOCO 2 — O PADRÃO EM AÇÃO',
          subtitle: 'Como isso aparece no seu dia a dia',
          paragraphs: deepdiveParagraphs.filter(p => p).length >= 3 ? deepdiveParagraphs : [
            'Este padrão se manifesta de forma consistente nas suas escolhas.',
            'Ele aparece especialmente em situações que exigem decisão rápida.',
            'Reconhecer esse padrão é o primeiro passo para ter mais controle.'
          ]
        },
        {
          order: 3,
          block_id: 'origem',
          title: 'BLOCO 3 — A ORIGEM DO PADRÃO',
          subtitle: 'Por que isso se repete, mesmo com esforço',
          paragraphs: [
            'Este padrão não surgiu por acaso. Ele se formou como uma resposta adaptativa a situações que você viveu no passado.',
            'Mesmo quando você tenta fazer diferente, o padrão volta porque ele está profundamente enraizado na forma como seu cérebro processa decisões.',
            'Entender a origem não é sobre encontrar culpados, mas sobre reconhecer que há uma lógica por trás do que parece irracional.'
          ]
        },
        {
          order: 4,
          block_id: 'custo',
          title: 'BLOCO 4 — O CUSTO INVISÍVEL',
          subtitle: 'O que esse padrão está te custando',
          paragraphs: [
            'Todo padrão tem um custo. Às vezes ele é visível, mas na maioria das vezes ele é sutil e se acumula ao longo do tempo.',
            'Pode ser energia mental gasta em decisões que poderiam ser mais simples, oportunidades que você deixa passar ou relacionamentos que não se desenvolvem como poderiam.',
            'O custo não precisa ser permanente. Com consciência e ajustes estratégicos, você pode reduzir significativamente esse impacto.'
          ]
        },
        {
          order: 5,
          block_id: 'ajuste',
          title: 'BLOCO 5 — O AJUSTE-CHAVE',
          subtitle: 'O que muda a forma como você decide',
          paragraphs: planParagraphs.filter(p => p).length >= 3 ? planParagraphs : [
            'O ajuste não é sobre virar uma pessoa completamente diferente, mas sobre criar pequenas mudanças que geram grandes resultados.',
            'Comece observando quando o padrão aparece e, em vez de reagir automaticamente, dê a si mesmo um momento para escolher conscientemente.',
            'Esses pequenos ajustes, feitos consistentemente, vão transformar a forma como você toma decisões.'
          ]
        },
        {
          order: 6,
          block_id: 'evitar',
          title: 'BLOCO 6 — O QUE EVITAR',
          subtitle: 'Erros comuns de quem tem esse padrão',
          paragraphs: [
            'Um erro comum é tentar mudar tudo de uma vez ou acreditar que você precisa eliminar completamente esse padrão.',
            'Outro erro é ignorar o padrão e esperar que ele desapareça sozinho, ou culpar circunstâncias externas por algo que está dentro do seu controle.',
            'O caminho certo é reconhecer o padrão, entender sua função e fazer ajustes estratégicos quando ele não está servindo você.'
          ]
        },
        {
          order: 7,
          block_id: 'desafio',
          title: 'BLOCO 7 — DESAFIO DE 7 DIAS',
          subtitle: 'Experiência prática guiada',
          paragraphs: [
            'Durante os próximos 7 dias, observe uma decisão por dia onde você normalmente seguiria o padrão automático.',
            'Antes de decidir, pare por 30 segundos e pergunte-se: esta decisão está alinhada com o que eu realmente quero agora?',
            'Não precisa mudar a decisão, apenas observe. Essa prática de observação consciente já vai começar a criar mudanças.'
          ]
        }
      ];
    }

    // Ordenar blocos por order
    if (blocks.length > 0) {
      blocks.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : parseInt(a.order || '0', 10);
        const orderB = typeof b.order === 'number' ? b.order : parseInt(b.order || '0', 10);
        return orderA - orderB;
      });
      console.log('[REPORT] Blocos ordenados:', blocks.map(b => ({ order: b.order, title: b.title })));
    }

    // Se encontrou blocos do premium_report_content, retornar no formato esperado
    if (blocks.length > 0) {
      console.log('[REPORT] Retornando relatório com blocos dinâmicos:', {
        title: premiumTitle || 'Sem título',
        blocksCount: blocks.length
      });
      // Garantir que os blocos tenham encoding correto
      const encodedBlocks = blocks.map((block: any) => ({
        ...block,
        title: String(block.title || ''),
        subtitle: block.subtitle ? String(block.subtitle) : undefined,
        paragraphs: Array.isArray(block.paragraphs) 
          ? block.paragraphs.map((p: any) => String(p || ''))
          : [],
      }));

      return NextResponse.json({
        resultId,
        title: String(premiumTitle || 'Leitura Completa do Seu Padrão de Decisão'),
        blocks: encodedBlocks,
        dominant: {
          domain: dominantDomain,
          profile: dominantProfile,
        },
        domains: domainsWithLevels,
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }

    // Fallback: retornar estrutura antiga se não encontrou blocos
    console.warn('[REPORT] Nenhum bloco encontrado, usando fallback');
    return NextResponse.json({
      resultId,
      dominant: {
        domain: dominantDomain,
        profile: dominantProfile,
      },
      premium_report_content: {
        blocks: blocks
      },
      domains: domainsWithLevels,
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

