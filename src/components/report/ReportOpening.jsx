/**
 * Abertura do relatório premium
 * Reposicionamento mental: tirar do modo "resultado" e colocar em "leitura consciente"
 */
export function ReportOpening({ title, subtitle, ethicalNote }) {
  return (
    <div className="report-opening">
      <h1 className="report-opening-title">{title}</h1>
      <p className="report-opening-subtitle">
        {subtitle?.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < subtitle.split('\n').length - 1 && <br />}
          </span>
        )) || subtitle}
      </p>
      {ethicalNote && (
        <p className="report-opening-ethical">{ethicalNote}</p>
      )}
    </div>
  );
}

