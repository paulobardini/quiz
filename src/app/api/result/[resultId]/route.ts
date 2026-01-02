import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    // Buscar resultado na nova tabela quiz_results ou fallback para quiz_session_results
    let result: any = null;
    let sessionId: string | null = null;

    // Tentar buscar na nova tabela primeiro
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

      if (domain) {
        dominantDomain = {
          id: domain.id,
          key: domain.key,
          name: domain.name,
          shortLabel: domain.short_label,
        };
      }

      if (profile) {
        dominantProfile = {
          id: profile.id,
          key: profile.key,
          name: profile.name,
        };
      }
    } else {
      // Fallback: buscar por primary_profile da estrutura antiga
      const primaryDomainKey = result.primary_profile || (result.scores_json as any)?.['primary_profile'];
      const scores = result.scores_json || result.scores || {};

      console.log('Fallback - primaryDomainKey:', primaryDomainKey);
      console.log('Fallback - scores:', scores);

      if (primaryDomainKey) {
        // Tentar buscar domínio (pode não existir se SQL não foi executado)
        const { data: domain, error: domainError } = await supabase
          .from('quiz_domains')
          .select('id, key, name, short_label')
          .eq('key', primaryDomainKey)
          .maybeSingle();

        if (domainError) {
          console.error('Erro ao buscar domínio:', domainError);
        }

        if (domain) {
          dominantDomain = {
            id: domain.id,
            key: domain.key,
            name: domain.name,
            shortLabel: domain.short_label,
          };

          // Buscar perfil baseado no score
          const domainScore = Math.max(0, Math.min(100, Math.round((scores[primaryDomainKey] || 0) as number)));
          console.log('Fallback - domainScore:', domainScore);
          
          // Buscar todas as regras do domínio e encontrar a correta
          const { data: allRules, error: rulesError } = await supabase
            .from('quiz_profile_rules')
            .select('profile_key, min_score, max_score')
            .eq('domain', primaryDomainKey)
            .eq('algorithm_version', 'v1')
            .order('min_score', { ascending: true });

          if (rulesError) {
            console.error('Erro ao buscar regras:', rulesError);
          }

          let profileKey = null;
          if (allRules && allRules.length > 0) {
            // Encontrar a regra onde o score está dentro da faixa
            const matchingRule = allRules.find(
              (rule) => domainScore >= rule.min_score && domainScore <= rule.max_score
            );
            profileKey = matchingRule?.profile_key || null;
            console.log('Fallback - profileKey encontrado:', profileKey);
          }

          if (profileKey) {
            const { data: profile, error: profileError } = await supabase
              .from('quiz_profiles')
              .select('id, key, name')
              .eq('key', profileKey)
              .maybeSingle();

            if (profileError) {
              console.error('Erro ao buscar perfil:', profileError);
            }

            if (profile) {
              dominantProfile = {
                id: profile.id,
                key: profile.key,
                name: profile.name,
              };
              console.log('Fallback - perfil encontrado:', dominantProfile);
            } else {
              console.warn('Perfil não encontrado para key:', profileKey);
            }
          } else {
            console.warn('Nenhuma regra encontrada para domain:', primaryDomainKey, 'score:', domainScore);
          }
        } else {
          // Se não encontrou domínio, criar um fallback básico
          console.warn('Domínio não encontrado, usando fallback básico');
          dominantDomain = {
            id: 'fallback',
            key: primaryDomainKey,
            name: primaryDomainKey.charAt(0).toUpperCase() + primaryDomainKey.slice(1),
            shortLabel: primaryDomainKey.charAt(0).toUpperCase() + primaryDomainKey.slice(1),
          };
        }
      }
    }

    // Se não encontrou perfil, tentar criar um fallback básico
    if (!dominantDomain) {
      console.error('DominantDomain não encontrado');
      return NextResponse.json(
        { error: 'Dados de perfil dominante não encontrados. Verifique se as tabelas quiz_domains e quiz_profiles foram criadas.' },
        { status: 404 }
      );
    }

    if (!dominantProfile) {
      console.error('DominantProfile não encontrado, tentando fallback');
      // Tentar buscar qualquer perfil do domínio como fallback
      if (dominantDomain.key && dominantDomain.id && dominantDomain.id !== 'fallback') {
        const { data: fallbackProfile } = await supabase
          .from('quiz_profiles')
          .select('id, key, name')
          .eq('domain_id', dominantDomain.id)
          .order('order_index', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (fallbackProfile) {
          dominantProfile = {
            id: fallbackProfile.id,
            key: fallbackProfile.key,
            name: fallbackProfile.name,
          };
          console.log('Usando perfil fallback:', dominantProfile);
        }
      }
      
      // Se ainda não encontrou, criar um perfil fallback básico
      if (!dominantProfile && dominantDomain.key) {
        console.warn('Criando perfil fallback básico');
        dominantProfile = {
          id: 'fallback',
          key: `${dominantDomain.key}_fallback`,
          name: `Perfil ${dominantDomain.name}`,
        };
      }
      
      if (!dominantProfile) {
        return NextResponse.json(
          { error: 'Dados de perfil dominante não encontrados. Verifique se as tabelas quiz_profiles foram populadas com os dados de seed.' },
          { status: 404 }
        );
      }
    }

    // Buscar conteúdo gratuito do perfil
    let freeSummaryText = null;
    let freeImpactText = null;

    if (dominantProfile && dominantProfile.id && dominantProfile.id !== 'fallback') {
      const { data: freeSummary } = await supabase
        .from('quiz_profile_content')
        .select('body')
        .eq('profile_id', dominantProfile.id)
        .eq('content_type', 'free_summary')
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: freeImpact } = await supabase
        .from('quiz_profile_content')
        .select('body')
        .eq('profile_id', dominantProfile.id)
        .eq('content_type', 'free_impact')
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      freeSummaryText = freeSummary?.body || null;
      freeImpactText = freeImpact?.body || null;
    }

    // Fallback: buscar de quiz_profile_texts se não encontrou em quiz_profile_content
    if ((!freeSummaryText || !freeImpactText) && dominantProfile?.key) {
      const { data: profileText } = await supabase
        .from('quiz_profile_texts')
        .select('free_summary, free_impact')
        .eq('profile_key', dominantProfile.key)
        .eq('content_version', 'v1')
        .maybeSingle();

      if (profileText) {
        if (!freeSummaryText && profileText.free_summary) {
          freeSummaryText = profileText.free_summary;
        }
        if (!freeImpactText && profileText.free_impact) {
          freeImpactText = profileText.free_impact;
        }
      }
    }

    // Buscar domínios com níveis (da nova estrutura ou calcular)
    let domains: any[] = [];

    const { data: domainScores } = await supabase
      .from('quiz_result_domain_scores')
      .select('domain_id, level, rank')
      .eq('result_id', resultId)
      .order('rank', { ascending: true });

    if (domainScores && domainScores.length > 0) {
      // Usar dados da nova estrutura
      const domainIds = domainScores.map((ds) => ds.domain_id);
      const { data: domainsData } = await supabase
        .from('quiz_domains')
        .select('id, key, name, short_label')
        .in('id', domainIds);

      if (domainsData) {
        domains = domainScores
          .map((ds) => {
            const domain = domainsData.find((d) => d.id === ds.domain_id);
            if (!domain) return null;
            return {
              domain: {
                id: domain.id,
                key: domain.key,
                name: domain.name,
                shortLabel: domain.short_label,
              },
              level: ds.level,
              rank: ds.rank,
            };
          })
          .filter((d) => d !== null) as any[];
      }
    } else {
      // Fallback: calcular a partir dos scores
      const scores = result.scores_json || result.scores || {};
      const { data: allDomains } = await supabase
        .from('quiz_domains')
        .select('id, key, name, short_label')
        .order('key');

      if (allDomains) {
        const scoresWithRanks = allDomains
          .map((d) => {
            const score = Math.max(0, Math.min(100, Math.round((scores[d.key] || 0) as number)));
            return {
              domain: d,
              score,
              level: getLevelFromScore(score),
            };
          })
          .sort((a, b) => b.score - a.score)
          .map((item, index) => ({
            domain: {
              id: item.domain.id,
              key: item.domain.key,
              name: item.domain.name,
              shortLabel: item.domain.short_label,
            },
            level: item.level,
            rank: index + 1,
          }));

        domains = scoresWithRanks;
      }
    }

    // Buscar cópias de UI
    const { data: uiCopyData } = await supabase
      .from('quiz_ui_copy')
      .select('key, value')
      .eq('is_active', true)
      .in('key', [
        'result_intro',
        'result_transition',
        'free_limit_text',
        'cta_report_label',
        'cta_report_microcopy',
      ]);

    const uiCopy: Record<string, string> = {};
    if (uiCopyData) {
      uiCopyData.forEach((item) => {
        uiCopy[item.key] = item.value;
      });
    }

    // Fallbacks para UI copy
    const resultIntro = uiCopy.result_intro || 'Você acabou de responder a um desafio rápido sobre decisões do dia a dia.\nEle não mede inteligência e não faz diagnóstico.\nEle observa padrões de escolha.';
    const resultTransition = uiCopy.result_transition || 'Com base nas suas respostas, existe um padrão que aparece com mais força hoje.';
    const freeLimitText =
      uiCopy.free_limit_text ||
      'Existe uma leitura mais profunda que mostra:\n\nonde exatamente você perde força nas decisões\npor que esse padrão continua se repetindo mesmo com esforço\ne qual ajuste simples muda a forma como você decide daqui pra frente';
    const ctaReportLabel = uiCopy.cta_report_label || 'Acessar a leitura completa';
    const ctaReportMicrocopy = uiCopy.cta_report_microcopy || '';

    // Fallback para conteúdo do perfil
    const finalFreeSummaryText =
      freeSummaryText ||
      'Este perfil reflete características específicas em seu domínio. Explore mais detalhes no relatório completo.';
    
    const finalFreeImpactText =
      freeImpactText ||
      'Este padrão influencia suas decisões e ações. Aprofundar esse entendimento pode trazer clareza prática para seu desenvolvimento.';

    return NextResponse.json({
      resultId,
      dominant: {
        domain: dominantDomain,
        profile: dominantProfile,
      },
      freeText: {
        summary: finalFreeSummaryText,
        impact: finalFreeImpactText,
      },
      domains,
      uiCopy: {
        resultIntro,
        resultTransition,
        freeLimitText,
        ctaReportLabel,
        ctaReportMicrocopy,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar resultado:', error);
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
