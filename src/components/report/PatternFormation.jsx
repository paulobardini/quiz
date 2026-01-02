/**
 * CAUSA — Por que o padrão se forma
 * Explica a origem e formação do padrão
 * Usa paid_deepdive do perfil dominante (primeira parte)
 */
export function PatternFormation({ dominant, deepdive }) {
  if (!deepdive) return null;

  return (
    <div className="report-section">
      <div className="report-section-divider" />
      
      <div className="report-pattern-formation">
        <p className="report-pattern-label">Seu padrão dominante hoje:</p>
        <h2 className="report-pattern-name">{dominant.profile.name}</h2>
      </div>

      <div className="report-formation-content">
        <h3 className="report-formation-title">Por Que Este Padrão Se Forma</h3>
        <p className="report-formation-text">{deepdive}</p>
      </div>
    </div>
  );
}
