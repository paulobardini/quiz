/**
 * Leitura dos domínios com significado
 * Explica o que cada nível indica, como se conecta com o padrão dominante
 * Usa paid_deepdive de cada perfil de domínio
 */
export function DomainReading({ domains, dominantProfile }) {
  if (!domains || domains.length === 0) return null;

  return (
    <div className="report-section">
      <div className="report-section-divider" />
      
      <h2 className="report-section-title">Leitura dos Domínios (Agora com Significado)</h2>
      
      <div className="report-domains-reading">
        {domains.map((item, index) => (
          <div key={item.domain.key || index} className="report-domain-reading-item">
            <div className="report-domain-reading-header">
              <h3 className="report-domain-reading-name">{item.domain.name}</h3>
              <span className="report-domain-reading-level">{item.level}</span>
            </div>
            {item.interpretativeText ? (
              <p className="report-domain-reading-text">
                {item.interpretativeText}
              </p>
            ) : (
              <p className="report-domain-reading-text">
                Seu padrão neste domínio está em nível {item.level.toLowerCase()}. 
                Isso se conecta com seu padrão dominante ({dominantProfile.name}) de forma específica, 
                influenciando como você toma decisões relacionadas a este aspecto.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

