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

  const blocks = report.premium_report_content?.blocks || [];
  const sortedBlocks = [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <main className="page-root result-page" style={{ position: 'relative' }}>
      <div
        className="page-bg"
        style={{ backgroundImage: `url(${LP_BG_URL})` }}
      />
      <div className="page-overlay" />
      
      {/* Container de leitura centralizado */}
      <div style={{ 
        maxWidth: '720px', 
        margin: '0 auto', 
        padding: '80px 24px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Painel de fundo escuro com opacidade alta */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          borderRadius: '8px',
          zIndex: 1
        }} />
        
        {/* Conteúdo do relatório */}
        <div 
          ref={reportContainerRef} 
          style={{ 
            position: 'relative',
            zIndex: 2,
            color: '#E5E5E5', 
            fontSize: '17px', 
            lineHeight: 1.65 
          }}
        >
          {sortedBlocks.map((block, index) => (
            <section 
              key={block.block_id || index}
              style={{ 
                marginBottom: index < sortedBlocks.length - 1 ? '96px' : '0'
              }}
            >
              {/* Título do bloco */}
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: 600, 
                marginBottom: '12px',
                color: '#E5E5E5'
              }}>
                {block.title || ''}
              </h2>
              
              {/* Subtítulo */}
              <p style={{ 
                fontStyle: 'italic', 
                fontSize: '15px', 
                opacity: 0.7, 
                marginBottom: '32px',
                color: '#E5E5E5'
              }}>
                {block.subtitle || ''}
              </p>
              
              {/* Parágrafos */}
              {block.paragraphs && block.paragraphs.length > 0 && (
                <>
                  <p style={{ 
                    fontSize: '17px', 
                    lineHeight: 1.65,
                    opacity: 0.9,
                    marginBottom: '20px',
                    color: '#E5E5E5'
                  }}>
                    {block.paragraphs[0] || ''}
                  </p>
                  {block.paragraphs[1] && (
                    <p style={{ 
                      fontSize: '17px', 
                      lineHeight: 1.65,
                      opacity: 0.9,
                      marginBottom: '20px',
                      color: '#E5E5E5'
                    }}>
                      {block.paragraphs[1]}
                    </p>
                  )}
                  {block.paragraphs[2] && (
                    <p style={{ 
                      fontSize: '17px', 
                      lineHeight: 1.65,
                      opacity: 0.9,
                      marginBottom: 0,
                      color: '#E5E5E5'
                    }}>
                      {block.paragraphs[2]}
                    </p>
                  )}
                </>
              )}
              
              {/* Linha separadora (exceto no último bloco) */}
              {index < sortedBlocks.length - 1 && (
                <div style={{
                  marginTop: '96px',
                  height: '1px',
                  backgroundColor: 'rgba(229, 229, 229, 0.2)',
                  width: '100%'
                }} />
              )}
            </section>
          ))}

          {/* SEÇÃO FINAL — DOWNLOAD PDF */}
          <section style={{ 
            marginTop: '96px', 
            textAlign: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            <h2 style={{ 
              fontSize: '26px', 
              marginBottom: '16px',
              color: '#E5E5E5'
            }}>
              Leve este relatório com você
            </h2>
            <p style={{ 
              fontSize: '16px', 
              opacity: 0.8, 
              marginBottom: '32px',
              color: '#E5E5E5'
            }}>
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
