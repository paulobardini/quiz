import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const profileKey = url.searchParams.get('profileKey');

    if (!profileKey || profileKey.trim() === '') {
      return NextResponse.json(
        { error: 'missing_profileKey' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Buscar quiz_profiles onde key = profileKey
    const { data: profile, error: profileError } = await supabase
      .from('quiz_profiles')
      .select('id')
      .eq('key', profileKey)
      .maybeSingle();

    if (profileError) {
      console.error('[PREMIUM REPORT] Erro ao buscar profile:', profileError);
      return NextResponse.json(
        { error: 'profile_not_found' },
        { status: 404 }
      );
    }

    if (!profile) {
      console.error('[PREMIUM REPORT] Profile não encontrado:', profileKey);
      return NextResponse.json(
        { error: 'profile_not_found' },
        { status: 404 }
      );
    }

    // Buscar premium_report_content onde profile_id = profile.id
    const { data: premiumContent, error: premiumError } = await supabase
      .from('premium_report_content')
      .select('title, blocks')
      .eq('profile_id', profile.id)
      .maybeSingle();

    if (premiumError) {
      console.error('[PREMIUM REPORT] Erro ao buscar premium content:', premiumError);
      return NextResponse.json(
        { error: 'premium_not_found' },
        { status: 404 }
      );
    }

    if (!premiumContent) {
      console.error('[PREMIUM REPORT] Premium content não encontrado para profile_id:', profile.id);
      return NextResponse.json(
        { error: 'premium_not_found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      title: premiumContent.title || '',
      blocks: premiumContent.blocks || [],
    });

  } catch (error) {
    console.error('[PREMIUM REPORT] Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

