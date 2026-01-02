import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('order_id');
    const sessionId = url.searchParams.get('session_id');
    const resultId = url.searchParams.get('result_id');

    console.log('[PAYMENT CHECK] Verificando pagamento:', { orderId, sessionId, resultId });

    if (!orderId && !sessionId && !resultId) {
      return NextResponse.json(
        { error: 'Parâmetros insuficientes' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    let query = supabase
      .from('kiwify_orders')
      .select('order_id, status, approved_date, s1, customer_email')
      .order('updated_at', { ascending: false })
      .limit(1);

    // Buscar por order_id (prioridade)
    if (orderId) {
      query = query.eq('order_id', orderId);
    } 
    // Se não tem order_id, buscar por s1 (session_id)
    else if (sessionId) {
      query = query.eq('s1', sessionId);
    }
    // Se não tem nenhum, buscar pelo email do cliente (se tiver resultId, podemos buscar o email do resultado)
    else {
      return NextResponse.json(
        { error: 'Parâmetros insuficientes para verificar pagamento' },
        { status: 400 }
      );
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('[PAYMENT CHECK] Erro ao buscar pedido:', error);
      return NextResponse.json(
        { error: 'Erro ao verificar pagamento' },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      console.log('[PAYMENT CHECK] Nenhum pedido encontrado');
      return NextResponse.json({
        approved: false,
        pending: true,
        message: 'Pedido não encontrado. O pagamento pode ainda estar sendo processado.',
      });
    }

    const order = orders[0];
    console.log('[PAYMENT CHECK] Pedido encontrado:', order);

    // Verificar se o status indica pagamento aprovado
    const approvedStatuses = ['paid', 'approved', 'completed'];
    const pendingStatuses = ['waiting_payment', 'pending', 'processing'];
    
    const isApproved = approvedStatuses.includes(order.status?.toLowerCase() || '') || !!order.approved_date;
    const isPending = pendingStatuses.includes(order.status?.toLowerCase() || '');

    if (isApproved) {
      console.log('[PAYMENT CHECK] Pagamento aprovado');
      return NextResponse.json({
        approved: true,
        pending: false,
        order_id: order.order_id,
        message: 'Pagamento aprovado com sucesso!',
      });
    }

    if (isPending) {
      console.log('[PAYMENT CHECK] Pagamento pendente');
      return NextResponse.json({
        approved: false,
        pending: true,
        order_id: order.order_id,
        message: 'Pagamento ainda está sendo processado.',
      });
    }

    console.log('[PAYMENT CHECK] Status desconhecido:', order.status);
    return NextResponse.json({
      approved: false,
      pending: false,
      order_id: order.order_id,
      status: order.status,
      message: `Status do pagamento: ${order.status || 'desconhecido'}`,
    });

  } catch (error) {
    console.error('[PAYMENT CHECK] Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

