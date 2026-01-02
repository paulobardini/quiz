-- ============================================
-- SQL para inserir conteúdo premium dos perfis de EMOCIONAL (VERSÃO CORRIGIDA)
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

-- EMOCIONAL MUITO BAIXO
SELECT upsert_premium_content(
  'emocional_muito_baixo',
  'Leitura completa do seu padrão de decisão',
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este conteúdo não existe para expor fragilidades emocionais.",
        "O eixo emocional muito baixo indica que você aprendeu a funcionar minimizando o impacto do sentir. Emoções não desaparecem, mas são mantidas sob controle rigoroso.",
        "O objetivo aqui é compreender como esse distanciamento afeta decisões, relações e energia vital."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, esse padrão aparece como objetividade excessiva.",
        "Você resolve, organiza e decide sem grande oscilação emocional. Isso traz eficiência, mas também cria distância entre o que você faz e o que sente.",
        "Muitas decisões são tomadas no automático, sem escuta interna."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "O emocional muito baixo costuma se formar em contextos onde sentir foi associado a risco, conflito ou perda de controle.",
        "A mente aprendeu que reduzir o acesso à emoção aumenta segurança. Com o tempo, esse mecanismo se torna padrão.",
        "Não é escolha consciente. É adaptação."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aparece como desconexão silenciosa.",
        "Você pode cumprir tarefas, manter relações e seguir rotinas sem grande envolvimento. O problema surge quando a vida perde cor, não por tristeza, mas por neutralidade constante.",
        "A energia vital diminui sem aviso."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você sente e decide",
      "paragraphs": [
        "O ajuste central aqui não é sentir mais. É permitir sentir.",
        "Reconhecer emoções não exige agir sobre elas. Exige apenas escuta.",
        "Quando a emoção volta a ser reconhecida, decisões ganham alinhamento interno."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite intelectualizar tudo que sente.",
        "Evite ignorar sinais emocionais por parecerem irrelevantes.",
        "Evite confundir estabilidade com desconexão."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: observe reações emocionais sutis ao longo do dia.",
        "Dias 3 e 4: nomeie uma emoção sem tentar explicá-la.",
        "Dias 5 e 6: permita sentir sem agir ou corrigir.",
        "Dia 7: avalie como a escuta emocional altera decisões simples.",
        "Emoção não serve para desorganizar. Serve para orientar."
      ]
    }
  ]'::jsonb
);

-- EMOCIONAL BAIXO
SELECT upsert_premium_content(
  'emocional_baixo',
  'Leitura completa do seu padrão de decisão',
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este perfil não aponta fragilidade emocional.",
        "Ele revela um funcionamento em que sentir existe, mas é constantemente filtrado antes de virar ação ou expressão. O controle vem antes da escuta.",
        "O objetivo aqui é entender como essa contenção influencia escolhas, vínculos e nível de envolvimento com a própria vida."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, esse padrão aparece quando você percebe o que sente, mas decide não aprofundar.",
        "Você administra emoções para evitar conflito, exposição ou perda de controle. Muitas vezes, escolhe o caminho mais neutro, mesmo que não seja o mais verdadeiro.",
        "O resultado é estabilidade com pouco espaço para autenticidade."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "O emocional baixo costuma se formar em contextos onde expressar emoções trouxe consequências negativas.",
        "A mente aprendeu que sentir demais complica. Como proteção, limita o acesso à intensidade emocional.",
        "Esse ajuste foi útil em algum momento, mas hoje pode restringir conexão e sentido."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aparece como distância emocional moderada.",
        "Você mantém controle, mas paga com envolvimento reduzido. Relações e escolhas ficam mais seguras, porém menos significativas.",
        "Com o tempo, isso pode gerar sensação de estar vivendo \"no modo correto\", mas não no modo inteiro."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você sente e decide",
      "paragraphs": [
        "O ajuste-chave aqui é dar espaço sem perder controle.",
        "Você não precisa se entregar às emoções. Precisa permitir que elas informem suas decisões antes de serem filtradas.",
        "Quando a emoção participa, escolhas ganham coerência interna."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite suprimir emoções por parecerem inconvenientes.",
        "Evite racionalizar tudo antes de sentir.",
        "Evite confundir maturidade emocional com neutralização constante."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: observe emoções que você costuma ignorar.",
        "Dias 3 e 4: permita sentir sem buscar explicação imediata.",
        "Dias 5 e 6: considere uma decisão levando em conta o que sentiu.",
        "Dia 7: avalie a diferença entre decidir só com lógica e decidir com escuta.",
        "Emoção não precisa comandar. Precisa participar."
      ]
    }
  ]'::jsonb
);

-- EMOCIONAL MÉDIO
SELECT upsert_premium_content(
  'emocional_medio',
  'Leitura completa do seu padrão de decisão',
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este perfil indica presença emocional ativa.",
        "Você não ignora o que sente e tampouco reprime de forma sistemática. As emoções participam do processo decisório, trazendo humanidade e conexão.",
        "O objetivo aqui não é reduzir emoção, mas organizar o espaço que ela ocupa."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, o emocional médio aparece quando decisões são tomadas com base no que você sente naquele momento.",
        "Quando o estado emocional está equilibrado, as escolhas fluem bem. Quando há oscilação, a decisão perde consistência e pode ser revista depois.",
        "A emoção orienta, mas às vezes domina."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "Esse padrão costuma surgir em pessoas que aprenderam a valorizar sensibilidade e empatia.",
        "Sentir passou a ser sinônimo de autenticidade. O desafio é que nem toda emoção reflete a totalidade do contexto.",
        "A emoção informa, mas não é o todo."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aparece como instabilidade moderada.",
        "Você pode se arrepender de decisões tomadas em estados emocionais intensos ou sentir dificuldade em sustentar escolhas quando o sentimento muda.",
        "Isso gera desgaste e dúvidas internas."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você sente e decide",
      "paragraphs": [
        "O ajuste-chave aqui é tempo entre sentir e decidir.",
        "Nem toda emoção precisa virar ação imediata. Criar um pequeno intervalo permite separar informação emocional de impulso.",
        "Esse espaço protege decisões sem bloquear o sentir."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite decidir no pico emocional, seja ele positivo ou negativo.",
        "Evite interpretar intensidade como certeza.",
        "Evite reavaliar decisões apenas porque o sentimento mudou."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: observe emoções que surgem antes de decisões.",
        "Dias 3 e 4: crie um intervalo consciente antes de agir.",
        "Dias 5 e 6: sustente uma decisão mesmo após mudança emocional.",
        "Dia 7: avalie como o tempo alterou a qualidade das escolhas.",
        "Emoção não perde valor quando espera. Ela ganha clareza."
      ]
    }
  ]'::jsonb
);

-- EMOCIONAL ALTO
SELECT upsert_premium_content(
  'emocional_alto',
  'Leitura completa do seu padrão de decisão',
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este perfil não representa excesso emocional como falha.",
        "Ele mostra um funcionamento em que sentir é o principal organizador da experiência. Emoções são intensas, rápidas e difíceis de ignorar.",
        "O objetivo aqui não é diminuir emoção, mas aprender a conduzi-la sem ser conduzido por ela."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, o emocional alto aparece como reações rápidas e decisões fortemente conectadas ao estado emocional do momento.",
        "Quando a emoção é positiva, há entrega total. Quando é negativa, o impacto também é imediato.",
        "O ritmo de vida acompanha o ritmo emocional."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "Esse padrão costuma surgir em pessoas altamente sensíveis ao ambiente e às relações.",
        "A emoção se tornou uma bússola principal para interpretar o mundo. Isso gera conexão, mas também vulnerabilidade a oscilações externas.",
        "Não é exagero. É intensidade mal regulada."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aparece como desgaste emocional elevado.",
        "Sentir tudo com intensidade exige energia constante. Pequenos eventos ganham peso grande, e decisões podem carregar carga emocional excessiva.",
        "Com o tempo, isso pode levar a cansaço, impulsividade ou retração."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você sente e decide",
      "paragraphs": [
        "O ajuste-chave aqui é regulação emocional.",
        "Regular não é reprimir. É criar mecanismos para que a emoção não decida sozinha.",
        "Quando você aprende a sustentar a emoção sem agir imediatamente, o impacto diminui."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite decidir no auge emocional.",
        "Evite transformar intensidade em urgência.",
        "Evite confundir emoção forte com verdade absoluta."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: identifique situações que despertam emoções intensas.",
        "Dias 3 e 4: crie um intervalo antes de reagir.",
        "Dias 5 e 6: observe emoções sem agir sobre elas.",
        "Dia 7: avalie como o controle do tempo alterou suas decisões.",
        "Emoção intensa não precisa ser combatida. Precisa ser conduzida."
      ]
    }
  ]'::jsonb
);

-- EMOCIONAL MUITO ALTO
SELECT upsert_premium_content(
  'emocional_muito_alto',
  'Leitura completa do seu padrão de decisão',
  '[
    {
      "order": 1,
      "block_id": "abertura",
      "title": "Abertura",
      "subtitle": "Validação e leitura inicial do padrão",
      "paragraphs": [
        "Este conteúdo não trata emoção intensa como problema.",
        "Ele revela um funcionamento em que sentir ocupa o lugar de comando. Emoções surgem rápido, ganham força e orientam decisões antes que outros critérios entrem em cena.",
        "O objetivo aqui é reorganizar a hierarquia interna, não silenciar o sentir."
      ]
    },
    {
      "order": 2,
      "block_id": "padrao_acao",
      "title": "O Padrão em Ação",
      "subtitle": "Como isso aparece no seu dia a dia",
      "paragraphs": [
        "No cotidiano, o emocional muito alto aparece como reações imediatas e envolvimento total.",
        "Você sente tudo com profundidade. Alegria, frustração, empolgação e decepção ganham intensidade máxima e influenciam diretamente o que você faz em seguida.",
        "O problema não é sentir demais. É decidir rápido demais."
      ]
    },
    {
      "order": 3,
      "block_id": "origem",
      "title": "A Origem do Padrão",
      "subtitle": "Por que isso se repete, mesmo com esforço",
      "paragraphs": [
        "Esse padrão costuma se formar em pessoas altamente sensíveis, empáticas ou que aprenderam a sobreviver reagindo ao ambiente.",
        "A emoção virou um sistema de alerta permanente. Ela entra em ação antes que haja tempo para análise ou distanciamento.",
        "Não é fraqueza. É hiperativação emocional."
      ]
    },
    {
      "order": 4,
      "block_id": "custo",
      "title": "O Custo Invisível",
      "subtitle": "O que esse padrão está te custando",
      "paragraphs": [
        "O custo aparece como exaustão emocional.",
        "Sentir tudo com intensidade máxima consome energia rapidamente. Pequenos eventos ganham peso desproporcional e decisões carregam carga emocional excessiva.",
        "Com o tempo, isso pode gerar impulsividade, arrependimento ou retração defensiva."
      ]
    },
    {
      "order": 5,
      "block_id": "ajuste",
      "title": "O Ajuste-Chave",
      "subtitle": "O que muda a forma como você sente e decide",
      "paragraphs": [
        "O ajuste-chave aqui é retomar o comando do tempo.",
        "Você não precisa reduzir emoção. Precisa criar intervalo entre sentir e agir.",
        "Quando o tempo entra no processo, a emoção perde o controle total e passa a informar, não dominar."
      ]
    },
    {
      "order": 6,
      "block_id": "evitar",
      "title": "O Que Evitar",
      "subtitle": "Erros comuns de quem tem esse padrão",
      "paragraphs": [
        "Evite agir no pico emocional.",
        "Evite interpretar intensidade como urgência absoluta.",
        "Evite decisões definitivas tomadas sob carga emocional máxima."
      ]
    },
    {
      "order": 7,
      "block_id": "desafio",
      "title": "Desafio de 7 Dias",
      "subtitle": "Experiência prática guiada",
      "paragraphs": [
        "Durante os próximos 7 dias:",
        "Dias 1 e 2: identifique emoções que surgem com força extrema.",
        "Dias 3 e 4: imponha um intervalo mínimo antes de agir.",
        "Dias 5 e 6: observe como a intensidade diminui com o tempo.",
        "Dia 7: avalie decisões que teriam sido diferentes se o tempo tivesse participado.",
        "Emoção muito alta não precisa ser contida. Precisa ser organizada."
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
WHERE qp.key LIKE 'emocional_%'
ORDER BY qp.order_index;

