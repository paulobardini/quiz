-- ============================================
-- SQL para inserir conteúdo premium dos perfis de CONSTÂNCIA
-- ============================================

-- CONSTÂNCIA MUITO BAIXA (constancia_muito_baixa)
INSERT INTO premium_report_content (profile_id, title, blocks, version)
SELECT 
  qp.id as profile_id,
  'Leitura completa do seu padrão de decisão' as title,
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este conteúdo não existe para apontar falhas de disciplina.",
        "Constância muito baixa indica que o movimento não se sustenta, mesmo quando a intenção é real. O problema não está em começar, mas em permanecer.",
        "O objetivo aqui é compreender por que o ritmo se quebra e como torná-lo possível sem depender de força de vontade constante."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, esse padrão aparece como ciclos curtos de esforço seguidos por interrupção.",
        "Você começa algo com energia, mas rapidamente perde tração. Pequenos obstáculos, cansaço ou perda de motivação são suficientes para interromper o movimento.",
        "Isso cria uma sequência de tentativas que não amadurecem."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "A constância muito baixa costuma ter origem em experiências onde manter esforço foi exigido além do limite.",
        "A mente associa continuidade a desgaste excessivo. Como proteção, ela interrompe o movimento antes que o custo aumente.",
        "Não é preguiça. É um mecanismo de autopreservação que hoje atua de forma automática."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo não aparece como falha explícita, mas como sensação de instabilidade.",
        "Você sente que não consegue confiar no próprio ritmo. Planos parecem frágeis. A cada interrupção, a autoconfiança diminui um pouco.",
        "Com o tempo, o maior custo é a crença de que \"nada se sustenta\"."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você age",
      "paragraphs": [
        "O ajuste central aqui não é intensidade. É ritmo mínimo confiável.",
        "Constância começa quando o movimento é pequeno o suficiente para não gerar rejeição interna.",
        "Você não precisa fazer mais. Precisa fazer menos, de forma repetível."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite planos grandes demais.",
        "Evite depender de motivação para agir.",
        "Evite reinícios dramáticos após interrupções. Recomeçar não exige força, exige continuidade simples."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: escolha uma ação mínima que você consegue repetir sem esforço.",
        "Dias 3 e 4: execute essa ação no mesmo horário, mesmo sem vontade.",
        "Dias 5 e 6: observe a resistência interna e reduza ainda mais o tamanho da ação.",
        "Dia 7: avalie o efeito de manter algo pequeno, mas contínuo.",
        "Constância não nasce de intensidade. Nasce de ritmo possível."
      ]
    }
  ]'::jsonb as blocks,
  'v1' as version
FROM quiz_profiles qp
WHERE qp.key = 'constancia_muito_baixa'
ON CONFLICT (profile_id, version) DO UPDATE SET
  title = EXCLUDED.title,
  blocks = EXCLUDED.blocks,
  updated_at = NOW();

-- CONSTÂNCIA BAIXA (constancia_baixa)
INSERT INTO premium_report_content (profile_id, title, blocks, version)
SELECT 
  qp.id as profile_id,
  'Leitura completa do seu padrão de decisão' as title,
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este perfil indica que a constância existe, mas é frágil.",
        "Você se compromete, começa e mantém por um tempo. O problema surge quando o ritmo encontra resistência. Pequenas quebras são suficientes para interromper a continuidade.",
        "O objetivo aqui não é criar rigidez, mas fortalecer o ritmo para que ele sobreviva às variações do dia a dia."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, esse padrão aparece como ciclos de constância seguidos por pausas não planejadas.",
        "Você até retorna, mas sempre com a sensação de ter perdido algo no caminho. A cada interrupção, o esforço para retomar parece maior.",
        "O movimento acontece, mas não ganha fluidez."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "A constância baixa costuma surgir em contextos onde a cobrança por resultado foi maior do que o suporte para manter ritmo.",
        "A mente associa continuidade a pressão. Quando o esforço começa a pesar, o corpo interrompe como forma de proteção.",
        "Não é desinteresse. É sobrecarga mal distribuída."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aparece como frustração recorrente.",
        "Você sente que se dedica, mas não colhe proporcionalmente. Isso mina a confiança no processo e gera dúvidas sobre a própria capacidade de sustentar compromissos.",
        "Com o tempo, o risco é desistir cedo demais de coisas que poderiam dar certo."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você age",
      "paragraphs": [
        "O ajuste-chave aqui é regularidade tolerante.",
        "Constância não exige perfeição. Exige retorno rápido após interrupções.",
        "Você não precisa evitar falhas. Precisa diminuir o tempo entre parar e continuar."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite interpretar interrupções como fracasso.",
        "Evite abandonar processos só porque o ritmo não foi ideal.",
        "Evite aumentar a exigência como forma de compensar pausas."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: identifique onde você interrompeu algo recentemente.",
        "Dias 3 e 4: retome uma ação sem tentar \"compensar\" o tempo perdido.",
        "Dias 5 e 6: mantenha o ritmo mesmo que imperfeito.",
        "Dia 7: avalie o efeito de continuar sem se punir.",
        "Constância baixa não se resolve com força. Ela se resolve com permissão para continuar."
      ]
    }
  ]'::jsonb as blocks,
  'v1' as version
FROM quiz_profiles qp
WHERE qp.key = 'constancia_baixa'
ON CONFLICT (profile_id, version) DO UPDATE SET
  title = EXCLUDED.title,
  blocks = EXCLUDED.blocks,
  updated_at = NOW();

-- CONSTÂNCIA MÉDIA (constancia_media)
INSERT INTO premium_report_content (profile_id, title, blocks, version)
SELECT 
  qp.id as profile_id,
  'Leitura completa do seu padrão de decisão' as title,
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este perfil indica capacidade real de manter movimento.",
        "Você não depende de motivação momentânea para agir. Existe compromisso, hábito e intenção. O ponto de atenção aqui não é iniciar nem continuar, mas direcionar melhor a constância existente.",
        "O objetivo é transformar esforço constante em avanço consistente."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No dia a dia, a constância média aparece como agenda cheia e sensação de estar sempre em movimento.",
        "Você mantém várias frentes ao mesmo tempo, mas nem todas recebem energia suficiente para avançar de forma profunda.",
        "O ritmo existe. A direção, nem sempre."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "Esse padrão costuma se formar em pessoas responsáveis, que aprenderam a dar conta do que aparece.",
        "A mente associa constância a responder demandas, não a escolher prioridades. Com isso, o esforço se espalha.",
        "Não é falta de foco. É excesso de compromisso."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aqui é diluição.",
        "Você se mantém ativo, mas sente que poderia estar mais avançado em menos coisas. A energia se distribui demais, e o progresso perde profundidade.",
        "Com o tempo, isso pode gerar cansaço e sensação de estagnação disfarçada de produtividade."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você age",
      "paragraphs": [
        "O ajuste-chave para este perfil é priorização consciente.",
        "Constância não é fazer tudo sempre. É sustentar poucas coisas importantes com intenção clara.",
        "Quando você reduz frentes, a constância ganha impacto."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite confundir constância com disponibilidade total.",
        "Evite assumir compromissos apenas por capacidade de execução.",
        "Evite preencher o tempo sem avaliar direção."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: liste tudo em que você está sendo constante.",
        "Dias 3 e 4: escolha apenas duas frentes para manter.",
        "Dias 5 e 6: suspenda ou desacelere o restante sem culpa.",
        "Dia 7: avalie o impacto da concentração no ritmo e na energia.",
        "Constância média evolui quando o esforço encontra foco real."
      ]
    }
  ]'::jsonb as blocks,
  'v1' as version
FROM quiz_profiles qp
WHERE qp.key = 'constancia_media'
ON CONFLICT (profile_id, version) DO UPDATE SET
  title = EXCLUDED.title,
  blocks = EXCLUDED.blocks,
  updated_at = NOW();

-- CONSTÂNCIA ALTA (constancia_alta)
INSERT INTO premium_report_content (profile_id, title, blocks, version)
SELECT 
  qp.id as profile_id,
  'Leitura completa do seu padrão de decisão' as title,
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este perfil revela maturidade de execução.",
        "Você não depende de impulso nem de pressão externa para manter o ritmo. Existe compromisso interno e capacidade de seguir adiante mesmo quando o contexto não é ideal.",
        "O foco aqui não é fortalecer a constância, mas torná-la sustentável ao longo do tempo."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, a constância alta se manifesta em rotinas bem definidas e capacidade de manter compromissos.",
        "Você tende a cumprir o que começa e raramente abandona processos no meio do caminho. O ritmo é estável e confiável.",
        "O desafio surge quando esse ritmo ocupa espaço demais."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "A constância alta costuma se formar em pessoas que aprenderam cedo a assumir responsabilidades.",
        "A repetição de compromissos cumpridos reforçou a crença de que manter ritmo é sinônimo de valor e segurança.",
        "Esse padrão funciona bem, mas pode se tornar rígido se não for revisitado."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aqui é desgaste progressivo.",
        "Manter tudo funcionando exige energia contínua. Quando não há pausas conscientes, o corpo e a mente começam a sinalizar exaustão.",
        "O risco não é parar. É continuar além do limite."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você age",
      "paragraphs": [
        "O ajuste-chave para este perfil é ritmo inteligente.",
        "Constância alta se sustenta quando você alterna esforço e recuperação, sem culpa.",
        "Nem tudo precisa avançar ao mesmo tempo. Saber desacelerar também é constância."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite confundir constância com obrigação permanente.",
        "Evite ignorar sinais de cansaço por medo de perder ritmo.",
        "Evite assumir mais do que sua energia comporta."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: observe onde você mantém ritmo apenas por hábito.",
        "Dias 3 e 4: introduza uma pausa consciente em um processo.",
        "Dias 5 e 6: mantenha o restante do ritmo sem compensar.",
        "Dia 7: avalie como a pausa impactou sua energia e clareza.",
        "Constância alta não se prova fazendo mais. Ela se mantém quando você sabe quando parar."
      ]
    }
  ]'::jsonb as blocks,
  'v1' as version
FROM quiz_profiles qp
WHERE qp.key = 'constancia_alta'
ON CONFLICT (profile_id, version) DO UPDATE SET
  title = EXCLUDED.title,
  blocks = EXCLUDED.blocks,
  updated_at = NOW();

-- CONSTÂNCIA MUITO ALTA (constancia_muito_alta)
INSERT INTO premium_report_content (profile_id, title, blocks, version)
SELECT 
  qp.id as profile_id,
  'Leitura completa do seu padrão de decisão' as title,
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este perfil indica um nível avançado de maturidade de execução.",
        "Você não apenas mantém constância. Você se torna referência de ritmo, confiabilidade e continuidade. Pessoas e processos tendem a se organizar ao seu redor.",
        "O objetivo aqui não é fortalecer a constância, mas redistribuir responsabilidade e impacto."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, a constância muito alta se manifesta em alta previsibilidade.",
        "Você entrega, sustenta prazos e mantém padrões mesmo em cenários instáveis. Seu ritmo não oscila facilmente.",
        "Com o tempo, isso pode levar à centralização excessiva do esforço."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "Esse padrão costuma se formar quando a pessoa assume responsabilidades cedo e aprende que manter o ritmo garante segurança.",
        "A constância vira identidade. Parar ou desacelerar passa a ser visto como risco ou falha.",
        "Esse mecanismo funciona, mas cobra um preço quando não é ajustado."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aqui é concentração excessiva de carga.",
        "Você tende a absorver mais do que deveria porque sabe sustentar. Isso pode limitar crescimento, gerar cansaço acumulado e reduzir espaço para inovação.",
        "O risco não é perder ritmo, é se tornar o gargalo."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você age",
      "paragraphs": [
        "O ajuste-chave para este perfil é liderança de ritmo.",
        "Constância muito alta se mantém saudável quando você distribui responsabilidades, cria estruturas e permite que outros sustentem partes do movimento.",
        "Seu papel deixa de ser executar tudo e passa a ser orquestrar continuidade."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite assumir tudo apenas porque você consegue.",
        "Evite confundir constância com controle.",
        "Evite medir valor pessoal apenas pela capacidade de sustentar carga."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: identifique onde você está centralizando esforço desnecessariamente.",
        "Dias 3 e 4: delegue ou redesenhe um processo para reduzir dependência.",
        "Dias 5 e 6: observe o desconforto de soltar controle sem intervir.",
        "Dia 7: avalie como a constância muda quando ela é compartilhada.",
        "Constância muito alta não é fazer tudo sempre. É criar estruturas que continuam mesmo sem você."
      ]
    }
  ]'::jsonb as blocks,
  'v1' as version
FROM quiz_profiles qp
WHERE qp.key = 'constancia_muito_alta'
ON CONFLICT (profile_id, version) DO UPDATE SET
  title = EXCLUDED.title,
  blocks = EXCLUDED.blocks,
  updated_at = NOW();

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
WHERE qp.key LIKE 'constancia_%'
ORDER BY qp.order_index;

