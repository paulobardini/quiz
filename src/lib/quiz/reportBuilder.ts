import { supabaseServer } from '@/lib/supabase/server';

export async function getProfileKey(
  domain: string,
  score: number,
  algorithmVersion: string = 'v1'
): Promise<string | null> {
  const supabase = supabaseServer();

  const { data: rule, error } = await supabase
    .from('quiz_profile_rules')
    .select('profile_key')
    .eq('domain', domain)
    .eq('algorithm_version', algorithmVersion)
    .gte('min_score', score)
    .lte('max_score', score)
    .single();

  if (error || !rule) {
    return null;
  }

  return rule.profile_key;
}

export async function buildFreeReport(
  sessionId: string,
  algorithmVersion: string = 'v1',
  contentVersion: string = 'v1'
) {
  const supabase = supabaseServer();

  const { data: result, error: resultError } = await supabase
    .from('quiz_session_results')
    .select('scores, primary_profile, secondary_profile')
    .eq('session_id', sessionId)
    .single();

  if (resultError || !result) {
    throw new Error('Resultado não encontrado');
  }

  const scores = result.scores as Record<string, number>;
  const primaryScore = scores[result.primary_profile] || 0;
  const primaryProfileKey = await getProfileKey(
    result.primary_profile,
    primaryScore,
    algorithmVersion
  );

  if (!primaryProfileKey) {
    throw new Error(
      `Regra de perfil não encontrada para domínio ${result.primary_profile} com score ${primaryScore}`
    );
  }

  const { data: profileText, error: textError } = await supabase
    .from('quiz_profile_texts')
    .select('title, free_summary')
    .eq('profile_key', primaryProfileKey)
    .eq('content_version', contentVersion)
    .single();

  if (textError || !profileText) {
    throw new Error(
      `Texto de perfil não encontrado para profile_key ${primaryProfileKey} versão ${contentVersion}`
    );
  }

  const { data: template, error: templateError } = await supabase
    .from('quiz_report_templates')
    .select('template')
    .eq('report_type', 'free')
    .eq('content_version', contentVersion)
    .single();

  if (templateError || !template) {
    throw new Error(
      `Template free não encontrado para versão ${contentVersion}`
    );
  }

  const report = {
    sessionId,
    type: 'free' as const,
    primaryProfile: result.primary_profile,
    secondaryProfile: result.secondary_profile,
    scores,
    profile: {
      key: primaryProfileKey,
      title: profileText.title,
      summary: profileText.free_summary,
    },
    template: template.template,
  };

  return report;
}

export async function buildPaidReport(
  sessionId: string,
  algorithmVersion: string = 'v1',
  contentVersion: string = 'v1'
) {
  const supabase = supabaseServer();

  const { data: result, error: resultError } = await supabase
    .from('quiz_session_results')
    .select('scores, primary_profile, secondary_profile')
    .eq('session_id', sessionId)
    .single();

  if (resultError || !result) {
    throw new Error('Resultado não encontrado');
  }

  const scores = result.scores as Record<string, number>;
  const domains = ['clareza', 'constancia', 'emocional', 'prosperidade'];

  const profileKeysMap: Record<string, string> = {};

  for (const domain of domains) {
    const score = scores[domain] || 0;
    const profileKey = await getProfileKey(domain, score, algorithmVersion);
    if (profileKey) {
      profileKeysMap[domain] = profileKey;
    }
  }

  const uniqueProfileKeys = [...new Set(Object.values(profileKeysMap))];

  const { data: profileTexts, error: textsError } = await supabase
    .from('quiz_profile_texts')
    .select('profile_key, title, paid_deep_dive, action_plan')
    .in('profile_key', uniqueProfileKeys)
    .eq('content_version', contentVersion);

  if (textsError || !profileTexts || profileTexts.length === 0) {
    throw new Error(
      `Textos de perfil não encontrados para versão ${contentVersion}`
    );
  }

  const textsMap = new Map(
    profileTexts.map((t) => [t.profile_key, t])
  );

  const sortedDomains = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  const lowestDomains = sortedDomains.slice(0, 2).map(([domain]) => domain);

  const actionPlan7Days: Array<{
    day: number;
    domain: string;
    tasks: unknown[];
  }> = [];

  for (let day = 1; day <= 7; day++) {
    const domainIndex = (day - 1) % 2;
    const domain = lowestDomains[domainIndex];
    const profileKey = profileKeysMap[domain];
    const text = textsMap.get(profileKey);

    if (text && text.action_plan) {
      const actionPlan = text.action_plan as { tasks?: unknown[] };
      actionPlan7Days.push({
        day,
        domain,
        tasks: actionPlan.tasks || [],
      });
    }
  }

  const { data: template, error: templateError } = await supabase
    .from('quiz_report_templates')
    .select('template')
    .eq('report_type', 'paid')
    .eq('content_version', contentVersion)
    .single();

  if (templateError || !template) {
    throw new Error(
      `Template paid não encontrado para versão ${contentVersion}`
    );
  }

  const report = {
    sessionId,
    type: 'paid' as const,
    primaryProfile: result.primary_profile,
    secondaryProfile: result.secondary_profile,
    scores,
    profiles: Object.fromEntries(
      domains.map((domain) => [
        domain,
        {
          score: scores[domain] || 0,
          profileKey: profileKeysMap[domain] || null,
          title: profileKeysMap[domain]
            ? textsMap.get(profileKeysMap[domain])?.title || null
            : null,
        },
      ])
    ),
    deepDive: {
      primary: textsMap.get(profileKeysMap[result.primary_profile])
        ?.paid_deep_dive || null,
      secondary: result.secondary_profile
        ? textsMap.get(profileKeysMap[result.secondary_profile])
            ?.paid_deep_dive || null
        : null,
    },
    actionPlan: actionPlan7Days,
    template: template.template,
  };

  return report;
}

