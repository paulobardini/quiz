-- Tabela de logs de webhook
CREATE TABLE IF NOT EXISTS kiwify_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  order_id text,
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  error text,
  CONSTRAINT kiwify_webhook_logs_order_id_check CHECK (order_id IS NULL OR length(order_id) > 0)
);

-- Índices para kiwify_webhook_logs
CREATE INDEX IF NOT EXISTS idx_kiwify_webhook_logs_order_id ON kiwify_webhook_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_kiwify_webhook_logs_event ON kiwify_webhook_logs(event);
CREATE INDEX IF NOT EXISTS idx_kiwify_webhook_logs_received_at ON kiwify_webhook_logs(received_at);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS kiwify_orders (
  order_id text PRIMARY KEY,
  event_last text,
  status text,
  product_id text,
  product_name text,
  customer_email text,
  approved_date timestamptz,

  -- Tracking de afiliado
  afid text,
  src text,
  sck text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  s1 text,
  s2 text,
  s3 text,

  -- Dados do afiliado
  affiliate_name text,
  affiliate_email text,
  affiliate_document text,
  affiliate_amount numeric,

  -- Dados brutos
  raw_sale jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para kiwify_orders
CREATE INDEX IF NOT EXISTS idx_kiwify_orders_status ON kiwify_orders(status);
CREATE INDEX IF NOT EXISTS idx_kiwify_orders_s1 ON kiwify_orders(s1);
CREATE INDEX IF NOT EXISTS idx_kiwify_orders_afid ON kiwify_orders(afid);
CREATE INDEX IF NOT EXISTS idx_kiwify_orders_src ON kiwify_orders(src);
CREATE INDEX IF NOT EXISTS idx_kiwify_orders_updated_at ON kiwify_orders(updated_at);

