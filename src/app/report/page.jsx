"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getPremiumReport } from "@/lib/api";
import { 
  getResultId, 
  setResultId,
  checkAndClearStorageIfNeeded,
  incrementHomeRedirectCount,
  clearQuizStorage,
} from "@/lib/storage";

const LP_BG_URL =
  process.env.NEXT_PUBLIC_LP_BG_URL ||
  "https://i.ibb.co/yn3dKqtQ/pexels-njeromin-28203471.jpg";

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const reportContainerRef = useRef(null);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    
    html.classList.add("result-page-active");
    body.classList.add("result-page-active");
    
    body.style.position = "relative";
    body.style.overflow = "auto";
    body.style.height = "auto";
    html.style.overflow = "auto";
    html.style.height = "auto";
    
    return () => {
      html.classList.remove("result-page-active");
      body.classList.remove("result-page-active");
      body.style.position = "";
      body.style.overflow = "";
      body.style.height = "";
      html.style.overflow = "";
      html.style.height = "";
    };
  }, []);

  useEffect(() => {
    const loadReport = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      let resultId = urlParams.get('resultId') || getResultId();
      
      if (!resultId) {
        incrementHomeRedirectCount();
        if (checkAndClearStorageIfNeeded()) {
          router.push("/");
          return;
        }
        router.push("/");
        return;
      }
      
      if (urlParams.get('resultId') && urlParams.get('resultId') !== getResultId()) {
        setResultId(urlParams.get('resultId'));
      }

      if (checkAndClearStorageIfNeeded()) {
        router.push("/");
        return;
      }

      try {
        const data = await getPremiumReport(resultId);
        setReport(data);
      } catch (error) {
        console.error("Erro ao carregar relatório:", error);
        
        const errorStatus = error?.status;
        const errorData = error?.data;
        if (errorStatus === 402 || errorData?.requiresPayment) {
          router.push('/paywall');
          return;
        }
        
        incrementHomeRedirectCount();
        clearQuizStorage();
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [router]);

  const handleDownloadPDF = async () => {
    if (!reportContainerRef.current) return;

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: [20, 20, 20, 20],
        filename: 'relatorio-claridade-decisao.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const element = reportContainerRef.current.cloneNode(true);
      element.style.backgroundColor = '#ffffff';
      element.style.color = '#000000';
      
      const allElements = element.querySelectorAll('*');
      allElements.forEach((el) => {
        const htmlEl = el;
        htmlEl.style.backgroundColor = htmlEl.style.backgroundColor === 'transparent' || !htmlEl.style.backgroundColor ? '#ffffff' : htmlEl.style.backgroundColor;
        if (htmlEl.tagName === 'SECTION' || htmlEl.tagName === 'DIV') {
          htmlEl.style.color = '#000000';
        }
      });

      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  if (isLoading) {
    return (
      <main className="page-root">
        <div
          className="page-bg"
          style={{ backgroundImage: `url(${LP_BG_URL})` }}
        />
        <div className="page-overlay" />
        <section className="page-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </section>
      </main>
    );
  }

  if (!report) {
    return null;
  }

  const deepdiveText = report.paidContent.deepdive || '';
  const planText = report.paidContent.plan || '';

  const splitIntoParagraphs = (text) => {
    if (!text) return ['', '', ''];
    const sentences = text.split(/[.!?]\s+/).filter(s => s.trim());
    const total = sentences.length;
    if (total === 0) return ['', '', ''];
    if (total <= 3) return [sentences.join('. '), '', ''];
    
    const p1End = Math.ceil(total / 3);
    const p2End = Math.ceil((total * 2) / 3);
    
    return [
      sentences.slice(0, p1End).join('. ') + (p1End < total ? '.' : ''),
      sentences.slice(p1End, p2End).join('. ') + (p2End < total ? '.' : ''),
      sentences.slice(p2End).join('. ') + (p2End < total ? '.' : '')
    ];
  };

  const deepdiveParagraphs = splitIntoParagraphs(deepdiveText);
  const planParagraphs = splitIntoParagraphs(planText);

  return (
    <main className="page-root result-page">
      <div
        className="page-bg"
        style={{ backgroundImage: `url(${LP_BG_URL})` }}
      />
      <div className="page-overlay" />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px' }}>
        <div ref={reportContainerRef} style={{ color: '#E5E5E5', fontSize: '17px', lineHeight: 1.65 }}>
          
          {/* BLOCO 1 — ABERTURA */}
          <section style={{ marginBottom: '96px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>
              BLOCO 1 — ABERTURA
            </h2>
            <p style={{ fontStyle: 'italic', fontSize: '15px', opacity: 0.7, marginBottom: '32px' }}>
              Validação e leitura inicial do padrão
            </p>
            <p style={{ fontSize: '17px', marginBottom: '20px' }}>
              Você identificou um padrão claro nas suas decisões. Isso não é um defeito, é uma forma de funcionar que se consolidou ao longo do tempo.
            </p>
            <p style={{ fontSize: '17px', marginBottom: '20px' }}>
              Este relatório vai te ajudar a entender por que esse padrão existe, como ele aparece no seu dia a dia e o que você pode fazer para ajustá-lo quando necessário.
            </p>
            <p style={{ fontSize: '17px', marginBottom: 0 }}>
              O objetivo não é mudar quem você é, mas ampliar sua consciência sobre como você decide.
            </p>
          </section>

          {/* BLOCO 2 — O PADRÃO EM AÇÃO */}
          <section style={{ marginBottom: '96px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>
              BLOCO 2 — O PADRÃO EM AÇÃO
            </h2>
            <p style={{ fontStyle: 'italic', fontSize: '15px', opacity: 0.7, marginBottom: '32px' }}>
              Como isso aparece no seu dia a dia
            </p>
            <p style={{ fontSize: '17px', marginBottom: '20px' }}>
              {deepdiveParagraphs[0] || 'Este padrão se manifesta de forma consistente nas suas escolhas, criando uma linha de comportamento que você pode reconhecer quando olha para trás.'}
            </p>
            <p style={{ fontSize: '17px', marginBottom: '20px' }}>
              {deepdiveParagraphs[1] || 'Ele aparece especialmente em situações que exigem decisão rápida ou quando há múltiplas opções disponíveis.'}
            </p>
            <p style={{ fontSize: '17px', marginBottom: 0 }}>
              {deepdiveParagraphs[2] || 'Reconhecer esse padrão é o primeiro passo para ter mais controle sobre suas decisões.'}
            </p>
          </section>

          {/* BLOCO 3 — A ORIGEM DO PADRÃO */}
          <section style={{ marginBottom: '96px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>
              BLOCO 3 — A ORIGEM DO PADRÃO
            </h2>
            <p style={{ fontStyle: 'italic', fontSize: '15px', opacity: 0.7, marginBottom: '32px' }}>
              Por que isso se repete, mesmo com esforço
            </p>
            <p style={{ fontSize: '17px', marginBottom: '20px' }}>
              Este padrão não surgiu por acaso. Ele se formou como uma resposta adaptativa a situações que você viveu no passado.
            </p>
            <p style={{ fontSize: '17px', marginBottom: '20px' }}>
              Mesmo quando você tenta fazer diferente, o padrão volta porque ele está profundamente enraizado na forma como seu cérebro processa decisões.
            </p>
            <p style={{ fontSize: '17px', marginBottom: 0 }}>
              Entender a origem não é sobre encontrar culpados, mas sobre reconhecer que há uma lógica por trás do que parece irracional.
            </p>
          </section>

          {/* BLOCO 4 — O CUSTO INVISÍVEL */}
          <section style={{ marginBottom: '96px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>
              BLOCO 4 — O CUSTO INVISÍVEL
            </h2>
            <p style={{ fontStyle: 'italic', fontSize: '15px', opacity: 0.7, marginBottom: '32px' }}>
              O que esse padrão está te custando
            </p>
            <p style={{ fontSize: '17px', marginBottom: '20px' }}>
              Todo padrão tem um custo. Às vezes ele é visível, mas na maioria das vezes ele é sutil e se acumula ao longo do tempo.
            </p>
            <p style={{ fontSize: '17px', marginBottom: '20px' }}>
              Pode ser energia mental gasta em decisões que poderiam ser mais simples, oportunidades que você deixa passar ou relacionamentos que não se desenvolvem como poderiam.
            </p>
            <p style={{ fontSize: '17px', marginBottom: 0 }}>
              O custo não precisa ser permanente. Com consciência e ajustes estratégicos, você pode reduzir significativamente esse impacto.
            </p>
          </section>

          {/* BLOCO 5 — O AJUSTE-CHAVE */}
          <section style={{ marginBottom: '96px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>
              BLOCO 5 — O AJUSTE-CHAVE
            </h2>
            <p style={{ fontStyle: 'italic', fontSize: '15px', opacity: 0.7, marginBottom: '32px' }}>
              O que muda a forma como você decide
            </p>
            <p style={{ fontSize: '17px', marginBottom: '20px' }}>
              {planParagraphs[0] || 'O ajuste não é sobre virar uma pessoa completamente diferente, mas sobre criar pequenas mudanças que geram grandes resultados.'}
            </p>
            <p style={{ fontSize: '17px', marginBottom: '20px' }}>
              {planParagraphs[1] || 'Comece observando quando o padrão aparece e, em vez de reagir automaticamente, dê a si mesmo um momento para escolher conscientemente.'}
            </p>
            <p style={{ fontSize: '17px', marginBottom: 0 }}>
              {planParagraphs[2] || 'Esses pequenos ajustes, feitos consistentemente, vão transformar a forma como você toma decisões.'}
            </p>
          </section>

          {/* BLOCO 6 — O QUE EVITAR */}
          <section style={{ marginBottom: '96px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>
              BLOCO 6 — O QUE EVITAR
            </h2>
            <p style={{ fontStyle: 'italic', fontSize: '15px', opacity: 0.7, marginBottom: '32px' }}>
              Erros comuns de quem tem esse padrão
            </p>
            <p style={{ fontSize: '17px', marginBottom: '20px' }}>
              Um erro comum é tentar mudar tudo de uma vez ou acreditar que você precisa eliminar completamente esse padrão.
            </p>
            <p style={{ fontSize: '17px', marginBottom: '20px' }}>
              Outro erro é ignorar o padrão e esperar que ele desapareça sozinho, ou culpar circunstâncias externas por algo que está dentro do seu controle.
            </p>
            <p style={{ fontSize: '17px', marginBottom: 0 }}>
              O caminho certo é reconhecer o padrão, entender sua função e fazer ajustes estratégicos quando ele não está servindo você.
            </p>
          </section>

          {/* BLOCO 7 — DESAFIO DE 7 DIAS */}
          <section style={{ marginBottom: '96px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>
              BLOCO 7 — DESAFIO DE 7 DIAS
            </h2>
            <p style={{ fontStyle: 'italic', fontSize: '15px', opacity: 0.7, marginBottom: '32px' }}>
              Experiência prática guiada
            </p>
            <p style={{ fontSize: '17px', marginBottom: '20px' }}>
              Durante os próximos 7 dias, observe uma decisão por dia onde você normalmente seguiria o padrão automático.
            </p>
            <p style={{ fontSize: '17px', marginBottom: '20px' }}>
              Antes de decidir, pare por 30 segundos e pergunte-se: esta decisão está alinhada com o que eu realmente quero agora?
            </p>
            <p style={{ fontSize: '17px', marginBottom: 0 }}>
              Não precisa mudar a decisão, apenas observe. Essa prática de observação consciente já vai começar a criar mudanças.
            </p>
          </section>

          {/* SEÇÃO FINAL — DOWNLOAD PDF */}
          <section style={{ marginTop: '96px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '26px', marginBottom: '16px' }}>
              Leve este relatório com você
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '32px' }}>
              Este material foi criado para ser relido com calma. Você pode baixar a versão em PDF para acessar quando quiser.
            </p>
            <button
              onClick={handleDownloadPDF}
              style={{
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: 600,
                backgroundColor: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '24px',
              }}
            >
              Download do Relatório em PDF
            </button>
          </section>

        </div>
      </div>
    </main>
  );
}
