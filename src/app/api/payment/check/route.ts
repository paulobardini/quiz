import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('order_id') || url.searchParams.get('order_code');
    const sessionId = url.searchParams.get('session_id');
    const resultId = url.searchParams.get('result_id');

    console.log('[PAYMENT CHECK] Verificando pagamento:', { 
      order_id: url.searchParams.get('order_id'),
      order_code: url.searchParams.get('order_code'),
      orderId_final: orderId,
      sessionId, 
      resultId 
    });

    if (!orderId && !sessionId && !resultId) {
      return NextResponse.json(
        { error: 'Parâmetros insuficientes' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    let query;
    
    // Buscar por order_id (prioridade)
    if (orderId) {
      query = supabase
        .from('kiwify_orders')
        .select('order_id, status, approved_date, s1, customer_email')
        .eq('order_id', orderId)
        .order('updated_at', { ascending: false })
        .limit(10);
    } 
    // Se não tem order_id, buscar por s1 (session_id)
    else if (sessionId) {
      query = supabase
        .from('kiwify_orders')
        .select('order_id, status, approved_date, s1, customer_email')
        .eq('s1', sessionId)
        .order('updated_at', { ascending: false })
        .limit(10);
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
      console.log('[PAYMENT CHECK] Nenhum pedido encontrado no banco');
      
      // Se temos order_id, tentar buscar diretamente na API da Kiwify como fallback
      if (orderId) {
        console.log('[PAYMENT CHECK] Tentando buscar na API Kiwify como fallback...');
        try {
          const oauthToken = process.env.KIWIFY_OAUTH_TOKEN;
          const accountId = process.env.KIWIFY_ACCOUNT_ID;

          if (oauthToken && accountId) {
            const kiwifyUrl = `https://public-api.kiwify.com/v1/sales/${orderId}`;
            const kiwifyResponse = await fetch(kiwifyUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${oauthToken}`,
                'x-kiwify-account-id': accountId,
                'Content-Type': 'application/json',
              },
              cache: 'no-store',
            });

            if (kiwifyResponse.ok) {
              const sale = await kiwifyResponse.json();
              console.log('[PAYMENT CHECK] Venda encontrada na API Kiwify:', sale);
              
              const status = sale.status?.toLowerCase() || '';
              const isApproved = ['paid', 'approved', 'completed'].includes(status) || !!sale.approved_date;
              
              if (isApproved) {
                return NextResponse.json({
                  approved: true,
                  pending: false,
                  order_id: orderId,
                  message: 'Pagamento aprovado com sucesso!',
                });
              }
            }
          }
        } catch (apiError) {
          console.error('[PAYMENT CHECK] Erro ao buscar na API Kiwify:', apiError);
        }
      }
      
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
    if (error instanceof Error) {
      console.error('[PAYMENT CHECK] Stack trace:', error.stack);
      console.error('[PAYMENT CHECK] Mensagem:', error.message);
    }
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        approved: false,
        pending: false
      },
      { status: 500 }
    );
  }
}

