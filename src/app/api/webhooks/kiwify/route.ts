import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface KiwifyWebhookPayload {
  event?: string;
  order_id?: string;
  id?: string;
  status?: string;
  product?: {
    id?: string;
    name?: string;
  };
  customer?: {
    email?: string;
  };
  approved_date?: string;
  affiliate_commission?: {
    name?: string;
    email?: string;
    document?: string;
    amount?: number;
  };
  affiliate?: {
    name?: string;
    email?: string;
    document?: string;
    amount?: number;
  };
  data?: {
    order_id?: string;
    id?: string;
    status?: string;
    product?: {
      id?: string;
      name?: string;
    };
    customer?: {
      email?: string;
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
    afid?: string;
    [key: string]: any;
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
  afid?: string;
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
    console.error('[KIWIFY WEBHOOK] KIWIFY_OAUTH_TOKEN existe?', !!oauthToken);
    console.error('[KIWIFY WEBHOOK] KIWIFY_ACCOUNT_ID existe?', !!accountId);
    return null;
  }

  const url = `https://public-api.kiwify.com/v1/sales/${orderId}`;
  console.log('[KIWIFY WEBHOOK] Fazendo requisição para:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${oauthToken}`,
        'x-kiwify-account-id': accountId,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    console.log('[KIWIFY WEBHOOK] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[KIWIFY WEBHOOK] Erro ao buscar venda ${orderId}: ${response.status} ${response.statusText}`, errorText);
      return null;
    }

    const sale = await response.json() as KiwifySale;
    console.log('[KIWIFY WEBHOOK] Venda retornada da API:', JSON.stringify(sale, null, 2));
    return sale;
  } catch (error) {
    console.error(`[KIWIFY WEBHOOK] Erro ao buscar venda ${orderId}:`, error);
    if (error instanceof Error) {
      console.error('[KIWIFY WEBHOOK] Erro detalhado:', error.message, error.stack);
    }
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
    console.log('[KIWIFY WEBHOOK] Payload recebido:', JSON.stringify(payload, null, 2));
    
    const event = extractEvent(payload);
    const orderId = extractOrderId(payload);
    
    console.log('[KIWIFY WEBHOOK] Event:', event, 'OrderId:', orderId);

    const supabase = supabaseServer();

    // Inserir log
    const { data: logData, error: logError } = await supabase
      .from('kiwify_webhook_logs')
      .insert({
        event,
        order_id: orderId,
        payload,
        received_at: new Date().toISOString(),
        error: orderId ? null : 'missing_order_id',
      })
      .select()
      .single();

    if (logError) {
      console.error('[KIWIFY WEBHOOK] Erro ao inserir log:', logError);
    } else {
      console.log('[KIWIFY WEBHOOK] Log inserido com sucesso, ID:', logData?.id);
    }

    // Se não tem order_id, retornar OK mas não processar
    if (!orderId) {
      console.warn('[KIWIFY WEBHOOK] Webhook recebido sem order_id');
      return NextResponse.json({ ok: true, message: 'Logged without order_id' });
    }

    // Buscar venda oficial na Kiwify
    console.log('[KIWIFY WEBHOOK] Buscando venda na API Kiwify para orderId:', orderId);
    const sale = await fetchKiwifySale(orderId);
    
    if (sale) {
      console.log('[KIWIFY WEBHOOK] Venda encontrada na API:', JSON.stringify(sale, null, 2));
    } else {
      console.warn('[KIWIFY WEBHOOK] Venda não encontrada na API ou erro na busca');
    }

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
      console.log('[KIWIFY WEBHOOK] Usando dados do payload como fallback');
      orderData.raw_sale = null;

      // Tentar extrair dados do payload (pode vir em payload ou payload.data)
      const sourceData = payload.data || payload;
      
      if (sourceData.status) {
        orderData.status = sourceData.status;
        console.log('[KIWIFY WEBHOOK] Status extraído do payload:', sourceData.status);
      }
      
      if (sourceData.product) {
        orderData.product_id = sourceData.product.id || null;
        orderData.product_name = sourceData.product.name || null;
        console.log('[KIWIFY WEBHOOK] Produto extraído do payload:', sourceData.product);
      }
      
      if (sourceData.customer) {
        orderData.customer_email = sourceData.customer.email || null;
        console.log('[KIWIFY WEBHOOK] Cliente extraído do payload:', sourceData.customer);
      }
      
      if (sourceData.approved_date) {
        orderData.approved_date = parseApprovedDate(sourceData.approved_date);
        console.log('[KIWIFY WEBHOOK] Data aprovada extraída do payload:', sourceData.approved_date);
      }

      // Tentar extrair tracking do payload
      const tracking = payload.tracking || payload.data?.tracking || sourceData.tracking;
      if (tracking) {
        console.log('[KIWIFY WEBHOOK] Tracking encontrado no payload:', tracking);
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
        orderData.afid = payload.afid || payload.data?.afid || sourceData.afid || null;
        if (orderData.afid) {
          console.log('[KIWIFY WEBHOOK] Afid extraído de outro lugar:', orderData.afid);
        }
      }

      // Tentar extrair dados de afiliado do payload
      const affiliate = payload.affiliate_commission || payload.affiliate || payload.data?.affiliate_commission || payload.data?.affiliate || sourceData.affiliate_commission || sourceData.affiliate;
      if (affiliate) {
        console.log('[KIWIFY WEBHOOK] Dados de afiliado encontrados no payload:', affiliate);
        orderData.affiliate_name = affiliate.name || null;
        orderData.affiliate_email = affiliate.email || null;
        orderData.affiliate_document = affiliate.document || null;
        orderData.affiliate_amount = affiliate.amount || null;
      }
    }
    
    console.log('[KIWIFY WEBHOOK] Dados para UPSERT:', JSON.stringify(orderData, null, 2));

    // UPSERT na tabela de pedidos
    const { data: upsertData, error: upsertError } = await supabase
      .from('kiwify_orders')
      .upsert(orderData, {
        onConflict: 'order_id',
      })
      .select()
      .single();

    if (upsertError) {
      console.error('[KIWIFY WEBHOOK] Erro ao fazer UPSERT:', upsertError);
      // Ainda assim retornar 200 para não quebrar o webhook
    } else {
      console.log('[KIWIFY WEBHOOK] UPSERT realizado com sucesso:', upsertData);
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

