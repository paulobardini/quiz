/**
 * Padrões cruzados - A parte que converte
 * Conecta domínios mostrando como um enfraquece ou sustenta o outro
 * Linguagem de insight, não técnica
 */
export function PatternCross({ domains }) {
  if (!domains || domains.length < 2) return null;

  const clareza = domains.find(d => d.domain.key === 'clareza');
  const emocional = domains.find(d => d.domain.key === 'emocional');
  const constancia = domains.find(d => d.domain.key === 'constancia');
  const prosperidade = domains.find(d => d.domain.key === 'prosperidade');

  return (
    <div className="report-section">
      <div className="report-section-divider" />
      
      <h2 className="report-section-title">Padrões Cruzados</h2>
      
      <div className="report-pattern-cross">
        <p className="report-pattern-cross-intro">
          Os domínios não funcionam isoladamente. Eles se influenciam mutuamente, criando padrões de decisão mais complexos. 
          Observe como essas dinâmicas se manifestam no seu caso:
        </p>

        <div className="report-pattern-cross-item">
          <h3 className="report-pattern-cross-pair">Clareza × Emoção</h3>
          <p className="report-pattern-cross-text">
            {clareza && emocional ? (
              <>Quando {clareza.domain.name.toLowerCase()} está em nível {clareza.level.toLowerCase()} e {emocional.domain.name.toLowerCase()} em nível {emocional.level.toLowerCase()}, 
              suas decisões tendem a equilibrar análise racional com resposta emocional. 
              Isso pode criar tensões ou sinergias dependendo do contexto. 
              Observe como a forma como você processa informações (clareza) influencia diretamente como você responde emocionalmente às situações.</>
            ) : (
              <>A forma como você processa informações (clareza) influencia diretamente como você responde emocionalmente às situações. 
              Quando um domínio está mais forte que o outro, suas decisões podem priorizar análise ou sentimento, 
              criando padrões específicos que se repetem em diferentes contextos.</>
            )}
          </p>
        </div>

        <div className="report-pattern-cross-item">
          <h3 className="report-pattern-cross-pair">Constância × Prosperidade</h3>
          <p className="report-pattern-cross-text">
            {constancia && prosperidade ? (
              <>Quando {constancia.domain.name.toLowerCase()} está em nível {constancia.level.toLowerCase()} e {prosperidade.domain.name.toLowerCase()} em nível {prosperidade.level.toLowerCase()}, 
              sua capacidade de manter consistência afeta diretamente como você constrói resultados de longo prazo. 
              A estabilidade nas suas ações (constância) é fundamental para alcançar resultados consistentes (prosperidade). 
              Observe como essas duas dimensões se relacionam nos seus momentos de decisão.</>
            ) : (
              <>A estabilidade nas suas ações (constância) é fundamental para alcançar resultados consistentes (prosperidade). 
              Quando um domínio está mais forte que o outro, você pode priorizar consistência ou resultados rápidos, 
              criando padrões específicos que se repetem em diferentes contextos.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

