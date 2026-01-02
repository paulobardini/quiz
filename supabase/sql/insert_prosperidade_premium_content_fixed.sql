-- ============================================
-- SQL para inserir conteúdo premium dos perfis de PROSPERIDADE (VERSÃO CORRIGIDA)
-- ============================================
-- Esta versão usa função auxiliar para evitar problemas com ON CONFLICT

-- Função auxiliar para inserir/atualizar conteúdo (reutilizar se já existir)
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

-- PROSPERIDADE MUITO BAIXA
SELECT upsert_premium_content(
  'prosperidade_muito_baixa',
  'Leitura completa do seu padrão de decisão',
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este conteúdo não trata prosperidade como sorte ou pensamento positivo.",
        "Prosperidade muito baixa indica um padrão de decisão voltado à proteção. Avançar parece perigoso. Expandir parece irresponsável. O foco está em não perder, não em crescer.",
        "O objetivo aqui é tornar esse mecanismo visível e ajustável."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, esse padrão aparece como cautela excessiva.",
        "Você evita riscos financeiros, posterga investimentos em si mesmo e tende a escolher o caminho mais seguro, mesmo quando ele limita crescimento.",
        "O movimento existe, mas é curto. Sempre dentro de margens apertadas."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "A prosperidade muito baixa costuma se formar em contextos onde errar custou caro.",
        "Perdas, instabilidade ou cobranças fizeram a mente associar crescimento a perigo. A proteção virou prioridade absoluta.",
        "Não é medo irracional. É aprendizado defensivo."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aparece como limitação silenciosa.",
        "Você se mantém funcionando, mas não expande. O esforço é grande, o retorno é controlado. Com o tempo, surge frustração por perceber que a vida poderia ser mais ampla.",
        "O problema não é falta de trabalho. É falta de espaço para crescer."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você decide",
      "paragraphs": [
        "O ajuste-chave aqui é expansão controlada.",
        "Prosperidade não exige salto cego. Exige pequenos movimentos fora da zona de proteção.",
        "Você não precisa arriscar tudo. Precisa permitir que algum risco exista."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite confundir prudência com paralisia.",
        "Evite rejeitar oportunidades apenas porque envolvem desconforto inicial.",
        "Evite acreditar que crescimento sempre leva a perda."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: identifique onde você evita crescer por medo de perder.",
        "Dias 3 e 4: escolha um pequeno investimento em você ou no seu trabalho.",
        "Dias 5 e 6: execute sem buscar garantia total de retorno.",
        "Dia 7: avalie o impacto de permitir expansão controlada.",
        "Prosperidade não começa quando tudo é seguro. Começa quando o crescimento deixa de ser proibido."
      ]
    }
  ]'::jsonb
);

-- PROSPERIDADE BAIXA
SELECT upsert_premium_content(
  'prosperidade_baixa',
  'Leitura completa do seu padrão de decisão',
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este perfil mostra que o desejo de prosperar já está presente.",
        "Você não rejeita crescimento. O conflito está em sustentar decisões que envolvem risco, visibilidade ou responsabilidade maior.",
        "O objetivo aqui é alinhar desejo de expansão com segurança interna suficiente para avançar."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, esse padrão aparece quando você considera oportunidades, mas demora a agir.",
        "Há análise, comparação e expectativa de ter certeza antes de avançar. Muitas decisões ficam em espera, aguardando condições ideais.",
        "O crescimento acontece, mas perde timing."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "A prosperidade baixa costuma se formar em contextos onde crescer trouxe cobrança ou julgamento.",
        "A mente aprendeu que prosperar exige provar valor o tempo todo. Como defesa, desacelera o avanço.",
        "Não é falta de ambição. É proteção contra exposição excessiva."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aparece como atraso estratégico.",
        "Você se prepara mais do que executa. O esforço existe, mas o retorno demora a aparecer.",
        "Com o tempo, isso pode gerar frustração e dúvida sobre a própria capacidade de sustentar crescimento."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você decide",
      "paragraphs": [
        "O ajuste-chave aqui é assumir crescimento progressivo.",
        "Prosperidade não exige certeza total. Exige compromisso com o próximo passo possível.",
        "Quando você aceita crescer aos poucos, o medo perde força."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite esperar segurança absoluta para agir.",
        "Evite se comparar constantemente com quem está em outro estágio.",
        "Evite transformar preparo em adiamento."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: identifique decisões de crescimento que você vem adiando.",
        "Dias 3 e 4: escolha uma e avance sem buscar cenário perfeito.",
        "Dias 5 e 6: sustente a decisão mesmo diante de insegurança.",
        "Dia 7: avalie o impacto de agir antes de se sentir totalmente pronto.",
        "Prosperidade baixa não se resolve esperando. Ela cresce quando você se compromete com o avanço."
      ]
    }
  ]'::jsonb
);

-- PROSPERIDADE MÉDIA
SELECT upsert_premium_content(
  'prosperidade_media',
  'Leitura completa do seu padrão de decisão',
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este perfil indica capacidade real de gerar valor.",
        "Você não está parado nem travado. Há movimento, trabalho e resultados. O ponto central aqui não é iniciar prosperidade, mas organizá-la.",
        "O objetivo é transformar ganhos pontuais em construção contínua."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, esse padrão aparece como alternância entre períodos de ganho e períodos de aperto.",
        "Você consegue prosperar quando as condições ajudam, mas encontra dificuldade em manter crescimento quando o cenário muda.",
        "O avanço acontece, mas não se ancora."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "A prosperidade média costuma surgir quando decisões financeiras são tomadas de forma reativa.",
        "O foco está em resolver o agora, não em estruturar o depois. Com isso, ganhos são consumidos ou redistribuídos sem estratégia clara.",
        "Não é desorganização. É falta de visão consolidada."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aparece como insegurança recorrente.",
        "Mesmo prosperando, você não sente estabilidade. Sempre há receio de retroceder, perder ou precisar recomeçar.",
        "Isso gera tensão constante na relação com dinheiro e crescimento."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você decide",
      "paragraphs": [
        "O ajuste-chave aqui é consolidação consciente.",
        "Prosperidade cresce quando parte do ganho é protegida, estruturada e direcionada ao longo prazo.",
        "Você não precisa ganhar mais imediatamente. Precisa organizar melhor o que já ganha."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite decisões financeiras impulsivas após períodos de ganho.",
        "Evite misturar necessidades imediatas com estratégias de crescimento.",
        "Evite tratar prosperidade como algo instável por natureza."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: mapeie entradas e saídas recentes sem julgamento.",
        "Dias 3 e 4: defina uma regra simples para proteger parte do ganho.",
        "Dias 5 e 6: mantenha essa regra mesmo diante de imprevistos.",
        "Dia 7: avalie como a sensação de estabilidade muda com organização.",
        "Prosperidade média evolui quando o ganho deixa de ser eventual e passa a ser estruturado."
      ]
    }
  ]'::jsonb
);

-- PROSPERIDADE ALTA
SELECT upsert_premium_content(
  'prosperidade_alta',
  'Leitura completa do seu padrão de decisão',
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este perfil revela maturidade na relação com prosperidade.",
        "Você não apenas gera valor, como consegue mantê-lo. Existe organização, visão e capacidade de sustentar crescimento.",
        "O objetivo aqui não é aumentar ganhos a qualquer custo, mas direcionar a prosperidade de forma intencional."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, a prosperidade alta se manifesta em decisões financeiras mais seguras e planejadas.",
        "Você tende a avaliar oportunidades com critério, escolher melhor onde investir energia e dizer não ao que não agrega valor real.",
        "O crescimento é contínuo, não impulsivo."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "Esse padrão costuma se formar quando a pessoa aprende a equilibrar risco e retorno.",
        "Experiências anteriores mostraram que crescer com consciência gera menos perdas e mais estabilidade.",
        "A prosperidade deixa de ser acidental e passa a ser construída."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aqui é acomodação estratégica.",
        "Quando a prosperidade está alta, pode surgir a tendência de manter o que funciona sem questionar se ainda faz sentido expandir ou reinventar.",
        "O risco não é perder, é parar de evoluir."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você decide",
      "paragraphs": [
        "O ajuste-chave para este perfil é expansão consciente.",
        "Prosperidade alta cresce quando você assume riscos calculados e direciona recursos para o que gera impacto real, não apenas retorno imediato.",
        "Crescer deixa de ser só acumular e passa a ser direcionar."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite crescer apenas por oportunidade.",
        "Evite investir energia em tudo que parece rentável.",
        "Evite confundir estabilidade com estagnação confortável."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: identifique áreas onde você cresce por hábito, não por intenção.",
        "Dias 3 e 4: escolha uma frente para aprofundar, não multiplicar.",
        "Dias 5 e 6: direcione recursos com foco em impacto de longo prazo.",
        "Dia 7: avalie como a prosperidade muda quando há direção clara.",
        "Prosperidade alta se fortalece quando o crescimento passa a ter propósito e direção."
      ]
    }
  ]'::jsonb
);

-- PROSPERIDADE MUITO ALTA
SELECT upsert_premium_content(
  'prosperidade_muito_alta',
  'Leitura completa do seu padrão de decisão',
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este perfil indica maturidade avançada na relação com prosperidade.",
        "Você não está apenas acumulando recursos. Está criando estruturas que sustentam crescimento, estabilidade e liberdade de escolha.",
        "O objetivo aqui não é ampliar ganhos, mas direcionar prosperidade com consciência e impacto."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, a prosperidade muito alta se manifesta em decisões estratégicas e bem posicionadas.",
        "Você escolhe onde investir tempo, energia e recursos com clareza. Existe capacidade de dizer não ao que não agrega e de sustentar escolhas de longo prazo.",
        "O crescimento é intencional, não reativo."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "Esse padrão costuma se formar quando a pessoa compreende que prosperidade não é apenas ganhar, mas organizar e direcionar valor.",
        "Experiências anteriores mostraram que crescimento sustentável vem de escolhas conscientes, não de movimentos impulsivos.",
        "A prosperidade passa a ser parte da identidade funcional."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aqui não é escassez, mas responsabilidade ampliada.",
        "Quando a prosperidade é muito alta, decisões tendem a impactar mais pessoas, projetos e estruturas. Isso pode gerar peso silencioso e necessidade constante de visão estratégica.",
        "O risco não é perder. É carregar impacto sozinho."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você decide",
      "paragraphs": [
        "O ajuste-chave para este perfil é redistribuição consciente.",
        "Prosperidade muito alta se mantém saudável quando você compartilha impacto, delega decisões e cria sistemas que funcionam sem dependência total da sua presença.",
        "Aqui, crescer significa multiplicar capacidade coletiva."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite centralizar decisões apenas porque você sabe decidir bem.",
        "Evite confundir controle com responsabilidade.",
        "Evite carregar sozinho impactos que podem ser compartilhados."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: identifique onde sua prosperidade depende apenas de você.",
        "Dias 3 e 4: delegue ou distribua uma decisão estratégica.",
        "Dias 5 e 6: observe o efeito de soltar controle sem perder direção.",
        "Dia 7: avalie como a prosperidade se comporta quando o impacto é compartilhado.",
        "Prosperidade muito alta não se mede pelo quanto você acumula. Se mede pelo quanto continua existindo sem depender só de você."
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
WHERE qp.key LIKE 'prosperidade_%'
ORDER BY qp.order_index;

