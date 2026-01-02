-- ============================================
-- SQL para inserir conteúdo premium dos perfis de CLAREZA (VERSÃO CORRIGIDA)
-- ============================================
-- Esta versão usa DO blocks para evitar problemas com ON CONFLICT

-- Função auxiliar para inserir/atualizar conteúdo
CREATE OR REPLACE FUNCTION upsert_premium_content(
  p_profile_key text,
  p_title text,
  p_blocks jsonb,
  p_version text DEFAULT 'v1'
) RETURNS void AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  -- Buscar profile_id
  SELECT id INTO v_profile_id
  FROM quiz_profiles
  WHERE key = p_profile_key;
  
  -- Se não encontrou o perfil, sair
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Perfil % não encontrado', p_profile_key;
  END IF;
  
  -- Verificar se já existe conteúdo
  IF EXISTS (SELECT 1 FROM premium_report_content WHERE profile_id = v_profile_id) THEN
    -- Atualizar
    UPDATE premium_report_content
    SET 
      title = p_title,
      blocks = p_blocks,
      version = p_version,
      updated_at = NOW()
    WHERE profile_id = v_profile_id;
  ELSE
    -- Inserir
    INSERT INTO premium_report_content (profile_id, title, blocks, version)
    VALUES (v_profile_id, p_title, p_blocks, p_version);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- CLAREZA MUITO BAIXA
SELECT upsert_premium_content(
  'clareza_muito_baixa',
  'Leitura completa do seu padrão de decisão',
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este conteúdo não existe para rotular você. Ele existe para tornar visível um padrão que hoje atua de forma automática.",
        "No seu caso, a clareza aparece em nível muito baixo. Isso significa que a decisão não se conclui. Ela permanece aberta, girando internamente, consumindo energia sem gerar avanço proporcional.",
        "O objetivo aqui não é mudar quem você é, mas tornar esse funcionamento consciente e ajustável."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "Esse padrão costuma aparecer quando você sabe o que faria, mas sente dificuldade em assumir a escolha como definitiva.",
        "A mente busca mais informações, mais garantias ou o momento ideal. Enquanto isso, o movimento fica adiado. Não por preguiça, mas por excesso de cautela.",
        "Com o tempo, isso cria a sensação de estar sempre se preparando, mas raramente concluindo."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "A clareza muito baixa normalmente nasce como mecanismo de proteção. Em algum momento, decidir teve um custo alto. Errar parecia perigoso demais.",
        "A mente aprendeu que manter decisões abertas reduz risco. O problema é que esse mecanismo continua ativo mesmo quando o risco já não é tão alto assim.",
        "Aqui, o ponto não é culpa. É compreensão."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo não aparece como fracasso explícito. Ele aparece como desgaste silencioso.",
        "Pensar demais cansa. Reavaliar o tempo todo drena energia. A vida externa segue, enquanto você sente que está sempre um passo atrás de si mesmo.",
        "Quando isso vira rotina, surge a falsa ideia de que o problema é você. Na verdade, é o processo."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você decide",
      "paragraphs": [
        "O ajuste central aqui é encerramento.",
        "Decidir não é apenas escolher. É parar de reabrir mentalmente o que já foi escolhido.",
        "Você não precisa acertar tudo. Precisa criar decisões suficientemente boas e encerradas, para que a energia volte ao movimento."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite buscar mais informações quando o que falta não é dado, é decisão.",
        "Evite reabrir conversas internas sobre escolhas já feitas. Isso não é reflexão, é desgaste.",
        "O objetivo não é controlar a vida. É impedir que o processo te controle."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: observe decisões que você já tomou, mas continua revisitando.",
        "Dias 3 e 4: escolha uma e declare encerrada.",
        "Dias 5 e 6: observe a vontade de reabrir e volte ao encerramento.",
        "Dia 7: avalie quanta energia deixou de ser consumida.",
        "Consciência não muda tudo de uma vez. Mas muda o ponto de partida. E isso já altera o futuro."
      ]
    }
  ]'::jsonb
);

-- CLAREZA BAIXA
SELECT upsert_premium_content(
  'clareza_baixa',
  'Leitura completa do seu padrão de decisão',
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este conteúdo não aponta falhas. Ele revela um funcionamento.",
        "No seu caso, a clareza existe, mas não se fixa. Você decide, mas a decisão não se ancora. Ela permanece sujeita a revisão emocional, novas hipóteses ou influências externas.",
        "O objetivo aqui é tornar esse padrão previsível e ajustável, para que a clareza deixe de ser um estado temporário."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, esse padrão surge quando você toma uma decisão, mas sente a necessidade de confirmá-la várias vezes.",
        "Comentários externos, mudanças de humor ou pequenos imprevistos são suficientes para reabrir o processo decisório.",
        "O resultado é um movimento irregular: você começa, mas desacelera antes de ganhar tração."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "A clareza baixa costuma nascer de experiências em que decidir rápido trouxe consequências desconfortáveis.",
        "A mente aprendeu que revisar reduz risco. O problema é que esse mecanismo permanece ativo mesmo quando o risco é aceitável.",
        "Não se trata de indecisão crônica. Trata-se de excesso de vigilância."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aparece como desgaste mental moderado, porém constante.",
        "Você gasta energia mantendo decisões em aberto por mais tempo do que o necessário. Isso reduz confiança interna e cria a sensação de que tudo exige esforço extra.",
        "Com o tempo, a clareza perde força não por incapacidade, mas por cansaço."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você decide",
      "paragraphs": [
        "O ajuste central aqui é sustentação.",
        "Decidir não é apenas escolher. É sustentar a escolha mesmo quando surgem dúvidas secundárias.",
        "Seu foco não deve ser eliminar dúvidas, mas impedir que elas comandem o processo."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite revisar decisões apenas por desconforto emocional momentâneo.",
        "Evite confundir prudência com reabertura constante.",
        "Nem toda dúvida é um sinal de erro. Muitas são apenas ruído."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: observe decisões que você revisa sem necessidade prática.",
        "Dias 3 e 4: escolha uma decisão recente e sustente-a conscientemente.",
        "Dias 5 e 6: note os gatilhos que geram dúvida e não reabra a escolha.",
        "Dia 7: avalie o impacto da sustentação na sua energia e confiança.",
        "Clareza não se constrói apenas decidindo. Ela se constrói permanecendo."
      ]
    }
  ]'::jsonb
);

-- CLAREZA MÉDIA
SELECT upsert_premium_content(
  'clareza_media',
  'Leitura completa do seu padrão de decisão',
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este perfil indica maturidade decisória em desenvolvimento.",
        "Você não decide no escuro. Existe análise, percepção e leitura de cenário. O ponto central não é gerar clareza, mas protegê-la ao longo do processo.",
        "Aqui, o objetivo não é ensinar você a decidir melhor, mas a preservar a clareza quando o contexto tenta diluí-la."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No dia a dia, você decide com consciência, mas pode se sentir pressionado a justificar demais suas escolhas.",
        "Quando surgem muitas variáveis, a clareza tende a se fragmentar. Você continua avançando, porém com mais cautela do que o necessário.",
        "O movimento acontece, mas poderia ser mais fluido."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "A clareza média costuma surgir em pessoas que aprenderam a ponderar bem, mas também a se responsabilizar demais pelas consequências.",
        "A mente tenta antecipar todos os desdobramentos, o que dilui a força da decisão.",
        "Não é medo de errar. É excesso de responsabilidade interna."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aqui é sutil.",
        "Você gasta energia ajustando decisões que já estavam suficientemente boas. Isso não impede o avanço, mas reduz velocidade e confiança no próprio julgamento.",
        "Com o tempo, essa dinâmica pode gerar desgaste silencioso."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você decide",
      "paragraphs": [
        "O ajuste-chave para este perfil é confiança progressiva.",
        "Nem toda decisão precisa ser perfeita para ser válida. Algumas precisam apenas ser boas o suficiente para gerar movimento.",
        "Fortalecer a clareza média significa reduzir o peso excessivo que você coloca em cada escolha."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite superanalisar decisões que já passaram pelo seu crivo racional.",
        "Evite buscar validação externa para escolhas que você já compreendeu internamente.",
        "Clareza média evolui quando você confia mais no próprio processo."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: identifique decisões que você ajustou sem necessidade real.",
        "Dias 3 e 4: escolha uma decisão atual e avance sem reavaliar.",
        "Dias 5 e 6: observe o desconforto de não revisar e mantenha o curso.",
        "Dia 7: avalie o impacto na sua fluidez decisória.",
        "Clareza não se fortalece apenas pensando melhor. Ela se fortalece confiando no que já foi pensado."
      ]
    }
  ]'::jsonb
);

-- CLAREZA ALTA
SELECT upsert_premium_content(
  'clareza_alta',
  'Leitura completa do seu padrão de decisão',
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este perfil indica um eixo decisório bem estruturado.",
        "Você não apenas entende o que precisa ser feito, como reconhece quando uma decisão está madura o suficiente para ser encerrada. Isso reduz ruído interno e libera energia para execução.",
        "O objetivo aqui não é corrigir falhas, mas refinar um mecanismo que já funciona."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, a clareza alta se manifesta em escolhas objetivas e bem delimitadas.",
        "Você tende a decidir com base em critérios claros e a sustentar essas decisões mesmo diante de opiniões divergentes.",
        "O movimento é contínuo. Você avança sem precisar revisar cada passo."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "Esse padrão costuma se formar quando a pessoa desenvolve confiança no próprio julgamento ao longo do tempo.",
        "Experiências anteriores mostraram que decidir com consciência traz mais ganhos do que esperar por cenários ideais.",
        "A clareza alta nasce do equilíbrio entre análise e aceitação do risco natural da decisão."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "Mesmo padrões saudáveis têm custo.",
        "Aqui, o risco está em assumir responsabilidades demais ou avançar rápido sem pausar para recalibrar quando necessário.",
        "O custo não é confusão, mas possível sobrecarga estratégica."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você decide",
      "paragraphs": [
        "O ajuste-chave para este perfil é direção consciente.",
        "Clareza alta se fortalece quando você escolhe não apenas o que fazer, mas também o que não fazer.",
        "Menos decisões bem escolhidas tendem a gerar mais impacto do que muitas decisões corretas."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite transformar clareza em rigidez.",
        "Evite confundir decisão firme com ausência de escuta ou revisão estratégica quando o contexto muda de forma real.",
        "Clareza alta funciona melhor quando permanece flexível."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: observe decisões que você mantém por hábito, não por intenção.",
        "Dias 3 e 4: elimine uma decisão que não precisa mais existir.",
        "Dias 5 e 6: direcione energia para uma escolha realmente estratégica.",
        "Dia 7: avalie o impacto da simplificação.",
        "Clareza não cresce apenas decidindo bem. Ela cresce quando você decide menos, e melhor."
      ]
    }
  ]'::jsonb
);

-- CLAREZA MUITO ALTA
SELECT upsert_premium_content(
  'clareza_muito_alta',
  'Leitura completa do seu padrão de decisão',
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este perfil indica um eixo decisório altamente integrado.",
        "Você não vive reagindo às circunstâncias. Existe intenção, critério e consciência por trás das escolhas. A clareza não aparece como esforço, mas como estado funcional.",
        "O objetivo aqui não é aprimorar a decisão em si, mas direcionar a clareza para o que realmente importa."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, a clareza muito alta se manifesta em escolhas objetivas e alinhadas com valores e prioridades maiores.",
        "Você tende a dizer \"não\" com tranquilidade, encerrar ciclos sem culpa excessiva e manter foco mesmo diante de distrações externas.",
        "O movimento é intencional, não impulsivo."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "Esse padrão costuma se formar após experiências que exigiram decisões difíceis e consequências reais.",
        "Ao longo do tempo, você aprendeu que clareza não vem da certeza absoluta, mas da coerência entre decisão, valor e ação.",
        "A mente deixa de buscar garantias externas e passa a confiar no próprio eixo interno."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aqui não é confusão, mas isolamento estratégico.",
        "Quando a clareza é muito alta, pode surgir a sensação de caminhar sozinho ou de carregar decisões que outros evitam assumir.",
        "Há também o risco de reduzir excessivamente o espaço para o improviso ou para o erro fértil."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você decide",
      "paragraphs": [
        "O ajuste-chave para este perfil é direcionamento consciente de energia.",
        "Nem toda decisão precisa ser otimizada. Algumas precisam apenas ser vividas.",
        "Clareza muito alta se mantém saudável quando você permite espaços de experimentação sem comprometer sua direção principal."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite transformar clareza em controle excessivo.",
        "Evite assumir decisões que não são suas apenas porque você sabe decidir melhor.",
        "Clareza elevada não deve virar sobrecarga silenciosa."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: observe onde você está decidindo por obrigação, não por escolha.",
        "Dias 3 e 4: delegue ou solte uma decisão que não exige mais sua clareza.",
        "Dias 5 e 6: escolha uma decisão que represente direção, não eficiência.",
        "Dia 7: avalie como a clareza muda quando a energia é melhor distribuída.",
        "Clareza muito alta não serve para controlar tudo. Serve para escolher onde estar inteiro."
      ]
    }
  ]'::jsonb
);

-- Verificar resultado
SELECT 
  qp.key as profile_key,
  qp.name as profile_name,
  prc.title,
  CASE 
    WHEN prc.blocks IS NOT NULL AND jsonb_typeof(prc.blocks::jsonb) = 'array' 
    THEN jsonb_array_length(prc.blocks::jsonb)
    ELSE 0
  END as quantidade_blocos,
  prc.version
FROM quiz_profiles qp
LEFT JOIN premium_report_content prc ON prc.profile_id = qp.id
WHERE qp.key LIKE 'clareza_%'
ORDER BY qp.order_index;

-- Limpar função auxiliar (opcional)
-- DROP FUNCTION IF EXISTS upsert_premium_content(text, text, jsonb, text);

