-- Adicionar coluna option_id na tabela quiz_answers
ALTER TABLE public.quiz_answers
ADD COLUMN IF NOT EXISTS option_id UUID REFERENCES public.quiz_question_options(id);

-- Criar índice para option_id
CREATE INDEX IF NOT EXISTS idx_quiz_answers_option ON public.quiz_answers(option_id);

