/**
 * O ajuste que muda tudo (sem promessa)
 * Explica qual pequeno ajuste muda o padrão, onde observar, o que parar de fazer
 * Usa paid_plan do perfil dominante
 */
export function PracticalAdjustment({ plan }) {
  if (!plan) return null;

  return (
    <div className="report-section">
      <div className="report-section-divider" />
      
      <h2 className="report-section-title">O Ajuste que Muda Tudo</h2>
      
      <div className="report-adjustment-content">
        <p className="report-adjustment-text">{plan}</p>
      </div>
    </div>
  );
}

