/**
 * REPETIÇÃO — Por que o padrão continua se repetindo
 * Explica os mecanismos que mantêm o padrão ativo
 * Usa paid_deepdive do perfil dominante (segunda parte ou mesmo texto com foco diferente)
 */
export function PatternRepetition({ deepdive }) {
  if (!deepdive) return null;

  return (
    <div className="report-section">
      <div className="report-section-divider" />
      
      <h2 className="report-section-title">Por Que Este Padrão Continua Se Repetindo</h2>
      
      <div className="report-repetition-content">
        <p className="report-repetition-text">
          {deepdive}
        </p>
      </div>
    </div>
  );
}

