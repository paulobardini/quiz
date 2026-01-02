import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface KiwifyWebhookPayload {
  event?: string;
  order_id?: string;
  id?: string;
  data?: {
    order_id?: string;
    id?: string;
  };
  tracking?: {
    afid?: string;
    src?: string;
    sck?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    s1?: string;
    s2?: string;
    s3?: string;
  };
  [key: string]: any;
}

interface KiwifySale {
  id: string;
  status: string;
  approved_date?: string;
  product?: {
    id: string;
    name: string;
  };
  customer?: {
    email: string;
  };
  tracking?: {
    afid?: string;
    src?: string;
    sck?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    s1?: string;
    s2?: string;
    s3?: string;
  };
  affiliate_commission?: {
    name?: string;
    email?: string;
    document?: string;
    amount?: number;
  };
}

function extractOrderId(payload: KiwifyWebhookPayload): string | null {
  if (payload.order_id) return String(payload.order_id);
  if (payload.id) return String(payload.id);
  if (payload.data?.order_id) return String(payload.data.order_id);
  if (payload.data?.id) return String(payload.data.id);
  return null;
}

function extractEvent(payload: KiwifyWebhookPayload): string {
  return payload.event || 'unknown';
}

function validateToken(request: Request): boolean {
  const expectedToken = process.env.KIWIFY_WEBHOOK_TOKEN;
  if (!expectedToken) {
    console.error('[KIWIFY WEBHOOK] KIWIFY_WEBHOOK_TOKEN não configurado');
    return false;
  }

  // Verificar header
  const headerToken = request.headers.get('x-kiwify-webhook-token');
  if (headerToken === expectedToken) {
    return true;
  }

  // Verificar query param
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token');
  if (queryToken === expectedToken) {
    return true;
  }

  return false;
}

async function fetchKiwifySale(orderId: string): Promise<KiwifySale | null> {
  const oauthToken = process.env.KIWIFY_OAUTH_TOKEN;
  const accountId = process.env.KIWIFY_ACCOUNT_ID;

  if (!oauthToken || !accountId) {
    console.error('[KIWIFY WEBHOOK] KIWIFY_OAUTH_TOKEN ou KIWIFY_ACCOUNT_ID não configurados');
    return null;
  }

  try {
    const response = await fetch(
      `https://public-api.kiwify.com/v1/sales/${orderId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${oauthToken}`,
          'x-kiwify-account-id': accountId,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error(`[KIWIFY WEBHOOK] Erro ao buscar venda ${orderId}: ${response.status} ${response.statusText}`);
      return null;
    }

    const sale = await response.json() as KiwifySale;
    return sale;
  } catch (error) {
    console.error(`[KIWIFY WEBHOOK] Erro ao buscar venda ${orderId}:`, error);
    return null;
  }
}

function parseApprovedDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // Validar token
    if (!validateToken(request)) {
      console.warn('[KIWIFY WEBHOOK] Token inválido');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ler payload
    const payload: KiwifyWebhookPayload = await request.json();
    const event = extractEvent(payload);
    const orderId = extractOrderId(payload);

    const supabase = supabaseServer();

    // Inserir log
    const { error: logError } = await supabase
      .from('kiwify_webhook_logs')
      .insert({
        event,
        order_id: orderId,
        payload,
        received_at: new Date().toISOString(),
        error: orderId ? null : 'missing_order_id',
      });

    if (logError) {
      console.error('[KIWIFY WEBHOOK] Erro ao inserir log:', logError);
    }

    // Se não tem order_id, retornar OK mas não processar
    if (!orderId) {
      console.warn('[KIWIFY WEBHOOK] Webhook recebido sem order_id');
      return NextResponse.json({ ok: true, message: 'Logged without order_id' });
    }

    // Buscar venda oficial na Kiwify
    const sale = await fetchKiwifySale(orderId);

    // Preparar dados para UPSERT
    const orderData: any = {
      order_id: orderId,
      event_last: event,
      updated_at: new Date().toISOString(),
    };

    if (sale) {
      // Mapear dados da venda oficial
      orderData.status = sale.status || null;
      orderData.approved_date = parseApprovedDate(sale.approved_date);
      orderData.product_id = sale.product?.id || null;
      orderData.product_name = sale.product?.name || null;
      orderData.customer_email = sale.customer?.email || null;
      orderData.raw_sale = sale;

      // Tracking da venda oficial (prioridade)
      if (sale.tracking) {
        orderData.afid = sale.tracking.afid || null;
        orderData.src = sale.tracking.src || null;
        orderData.sck = sale.tracking.sck || null;
        orderData.utm_source = sale.tracking.utm_source || null;
        orderData.utm_medium = sale.tracking.utm_medium || null;
        orderData.utm_campaign = sale.tracking.utm_campaign || null;
        orderData.utm_term = sale.tracking.utm_term || null;
        orderData.utm_content = sale.tracking.utm_content || null;
        orderData.s1 = sale.tracking.s1 || null;
        orderData.s2 = sale.tracking.s2 || null;
        orderData.s3 = sale.tracking.s3 || null;
      }

      // Dados do afiliado
      if (sale.affiliate_commission) {
        orderData.affiliate_name = sale.affiliate_commission.name || null;
        orderData.affiliate_email = sale.affiliate_commission.email || null;
        orderData.affiliate_document = sale.affiliate_commission.document || null;
        orderData.affiliate_amount = sale.affiliate_commission.amount || null;
      }
    } else {
      // Se não conseguiu buscar venda, usar dados do payload como fallback
      orderData.raw_sale = null;

      // Tentar extrair tracking do payload
      const tracking = payload.tracking || payload.data?.tracking;
      if (tracking) {
        orderData.afid = tracking.afid || null;
        orderData.src = tracking.src || null;
        orderData.sck = tracking.sck || null;
        orderData.utm_source = tracking.utm_source || null;
        orderData.utm_medium = tracking.utm_medium || null;
        orderData.utm_campaign = tracking.utm_campaign || null;
        orderData.utm_term = tracking.utm_term || null;
        orderData.utm_content = tracking.utm_content || null;
        orderData.s1 = tracking.s1 || null;
        orderData.s2 = tracking.s2 || null;
        orderData.s3 = tracking.s3 || null;
      }

      // Tentar extrair afid de outros lugares no payload
      if (!orderData.afid) {
        orderData.afid = payload.afid || payload.data?.afid || null;
      }
    }

    // UPSERT na tabela de pedidos
    const { error: upsertError } = await supabase
      .from('kiwify_orders')
      .upsert(orderData, {
        onConflict: 'order_id',
      });

    if (upsertError) {
      console.error('[KIWIFY WEBHOOK] Erro ao fazer UPSERT:', upsertError);
      // Ainda assim retornar 200 para não quebrar o webhook
    }

    const duration = Date.now() - startTime;
    console.log(`[KIWIFY WEBHOOK] Processado order_id=${orderId} event=${event} em ${duration}ms`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[KIWIFY WEBHOOK] Erro geral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

