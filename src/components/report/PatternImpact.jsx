/**
 * IMPACTO — Onde o padrão realmente te trava
 * Explica onde drena energia, cria retrabalho, gera decisões que custam caro
 * Usa paid_deepdive do perfil dominante (terceira parte ou mesmo texto com foco diferente)
 */
export function PatternImpact({ deepdive }) {
  if (!deepdive) return null;

  return (
    <div className="report-section">
      <div className="report-section-divider" />
      
      <h2 className="report-section-title">Onde Este Padrão Realmente Te Trava</h2>
      
      <div className="report-impact-content">
        <p className="report-impact-text">
          {deepdive}
        </p>
      </div>
    </div>
  );
}

