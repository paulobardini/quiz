import { supabaseServer } from '@/lib/supabase/server';

export async function getAnsweredCount(sessionId: string): Promise<number> {
  const supabase = supabaseServer();

  const { data: answers, error } = await supabase
    .from('quiz_answers')
    .select('question_id')
    .eq('session_id', sessionId);

  if (error) {
    return 0;
  }

  return answers?.length || 0;
}

export async function isSessionComplete(sessionId: string): Promise<boolean> {
  const supabase = supabaseServer();

  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .select('status, question_count')
    .eq('id', sessionId)
    .single();

  if (error || !session) {
    return false;
  }

  if (session.status === 'completed') {
    return true;
  }

  const answeredCount = await getAnsweredCount(sessionId);
  return answeredCount >= (session.question_count || 28);
}

