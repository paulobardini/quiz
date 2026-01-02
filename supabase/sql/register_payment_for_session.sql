-- ============================================
-- SQL para registrar pagamento aprovado
-- Session ID: 1c570df7-7565-4b1b-835f-a9ba77071a08
-- Product ID: Tgsa1ZA
-- ============================================

-- Verificar se já existe um pedido para essa sessão
SELECT 
  order_id,
  status,
  approved_date,
  s1,
  customer_email,
  updated_at
FROM kiwify_orders
WHERE s1 = '1c570df7-7565-4b1b-835f-a9ba77071a08';

-- ============================================
-- OPÇÃO 1: Inserir novo pedido (se não existir)
-- ============================================
INSERT INTO kiwify_orders (
  order_id,
  status,
  event_last,
  s1,
  approved_date,
  product_id,
  product_name,
  updated_at
)
VALUES (
  'TEST-' || gen_random_uuid()::text,
  'paid',
  'order.paid',
  '1c570df7-7565-4b1b-835f-a9ba77071a08',
  NOW(),
  'Tgsa1ZA',
  'Mapa de Decisão Premium',
  NOW()
)
ON CONFLICT (order_id) 
DO UPDATE SET
  status = EXCLUDED.status,
  event_last = EXCLUDED.event_last,
  approved_date = EXCLUDED.approved_date,
  updated_at = NOW();

-- ============================================
-- OPÇÃO 2: Atualizar pedido existente (se já existe um pedido com esse s1)
-- ============================================
UPDATE kiwify_orders
SET
  status = 'paid',
  event_last = 'order.paid',
  approved_date = NOW(),
  updated_at = NOW()
WHERE s1 = '1c570df7-7565-4b1b-835f-a9ba77071a08'
  AND (status IS NULL OR status NOT IN ('paid', 'approved', 'completed'));

-- ============================================
-- OPÇÃO 3: UPSERT inteligente (verifica se existe e atualiza ou insere)
-- ============================================
DO $$
DECLARE
  existing_order_id text;
  new_order_id text;
BEGIN
  -- Verificar se já existe um pedido para esse s1
  SELECT order_id INTO existing_order_id
  FROM kiwify_orders
  WHERE s1 = '1c570df7-7565-4b1b-835f-a9ba77071a08'
  LIMIT 1;

  IF existing_order_id IS NOT NULL THEN
    -- Atualizar pedido existente
    UPDATE kiwify_orders
    SET
      status = 'paid',
      event_last = 'order.paid',
      approved_date = NOW(),
      updated_at = NOW()
    WHERE order_id = existing_order_id;
    
    RAISE NOTICE 'Pedido atualizado: %', existing_order_id;
  ELSE
    -- Gerar novo order_id
    new_order_id := 'TEST-' || gen_random_uuid()::text;
    
    -- Inserir novo pedido
    INSERT INTO kiwify_orders (
      order_id,
      status,
      event_last,
      s1,
      approved_date,
      product_id,
      product_name,
      updated_at
    )
    VALUES (
      new_order_id,
      'paid',
      'order.paid',
      '1c570df7-7565-4b1b-835f-a9ba77071a08',
      NOW(),
      'Tgsa1ZA',
      'Mapa de Decisão Premium',
      NOW()
    );
    
    RAISE NOTICE 'Novo pedido criado: %', new_order_id;
  END IF;
END $$;

-- ============================================
-- Verificar resultado final
-- ============================================
SELECT 
  order_id,
  status,
  approved_date,
  s1,
  product_id,
  product_name,
  customer_email,
  updated_at
FROM kiwify_orders
WHERE s1 = '1c570df7-7565-4b1b-835f-a9ba77071a08';

