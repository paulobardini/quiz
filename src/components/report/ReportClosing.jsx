/**
 * Seção de encerramento do relatório
 * Reforço de consciência e responsabilidade
 */
export function ReportClosing({ closingText }) {
  return (
    <div className="report-section">
      <div className="report-section-divider-strong" />
      
      <div className="report-closing">
        <p className="report-closing-text">
          {closingText?.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < closingText.split('\n').length - 1 && <br />}
            </span>
          )) || closingText}
        </p>
      </div>
    </div>
  );
}

