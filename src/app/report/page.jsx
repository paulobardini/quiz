"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportContainerRef = useRef(null);
  const [isTableOfContentsOpen, setIsTableOfContentsOpen] = useState(false);

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
      const profileKey = searchParams.get('profileKey');
      
      if (!profileKey) {
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
          const { getPremiumReport } = await import("@/lib/api");
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
        return;
      }

      // Buscar relatório premium por profileKey
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/report/premium?profileKey=${encodeURIComponent(profileKey)}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[PREMIUM REPORT] Erro na resposta:', response.status, errorData);
          setError(errorData);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setReport(data);
      } catch (error) {
        console.error('[PREMIUM REPORT] Erro ao carregar:', error);
        setError({ error: 'Erro ao carregar relatório premium' });
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [router, searchParams]);

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

  const scrollToBlock = (blockId) => {
    const element = document.getElementById(blockId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsTableOfContentsOpen(false);
    }
  };

  const extractProfileNameFromFirstParagraph = (blocks) => {
    if (!blocks || blocks.length === 0) return null;
    const firstBlock = blocks.find(b => b.order === 1) || blocks[0];
    if (firstBlock?.paragraphs && firstBlock.paragraphs.length > 0) {
      const firstParagraph = String(firstBlock.paragraphs[0] || '');
      // Tentar extrair nome do padrão do primeiro parágrafo (exemplo: "Seu padrão é X" ou "Padrão X")
      const match = firstParagraph.match(/(?:padrão|padrao|perfil)\s+([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][a-záàâãéêíóôõúç]+(?:\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][a-záàâãéêíóôõúç]+)*)/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
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

  if (error) {
    return (
      <main className="page-root result-page" style={{ position: 'relative' }}>
        <div
          className="page-bg"
          style={{ backgroundImage: `url(${LP_BG_URL})` }}
        />
        <div className="page-overlay" />
        <div style={{ 
          maxWidth: '720px', 
          margin: '0 auto', 
          padding: '80px 24px',
          position: 'relative',
          zIndex: 10
        }}>
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
          <div style={{ 
            position: 'relative',
            zIndex: 2,
            color: '#E5E5E5',
            textAlign: 'center',
            padding: '40px 20px'
          }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
              Relatório não encontrado
            </h1>
            <p style={{ fontSize: '16px', opacity: 0.8 }}>
              {error.error === 'profile_not_found' && 'Perfil não encontrado no banco de dados.'}
              {error.error === 'premium_not_found' && 'Conteúdo premium não encontrado para este perfil.'}
              {error.error === 'missing_profileKey' && 'Parâmetro profileKey é obrigatório.'}
              {!error.error && 'Erro ao carregar o relatório.'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!report) {
    return null;
  }

  // Se veio de premium_report_content (tem title e blocks) OU de /api/report/[resultId] com blocos
  if (report.title && report.blocks && Array.isArray(report.blocks) && report.blocks.length > 0) {
    console.log('[REPORT PAGE] Renderizando blocos dinâmicos:', report.blocks.length, 'blocos');
    const sortedBlocks = [...report.blocks].sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : parseInt(a.order || '0', 10);
      const orderB = typeof b.order === 'number' ? b.order : parseInt(b.order || '0', 10);
      return orderA - orderB;
    });

    const profileName = report.profileName || extractProfileNameFromFirstParagraph(sortedBlocks);

    return (
      <main className="page-root result-page" style={{ position: 'relative' }}>
        <div
          className="page-bg"
          style={{ 
            backgroundImage: `url(${LP_BG_URL})`,
            filter: 'blur(2px)'
          }}
        />
        <div className="page-overlay" />
        
        <div style={{ 
          maxWidth: '720px', 
          margin: '0 auto', 
          padding: '80px 24px',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            borderRadius: '8px',
            zIndex: 1
          }} />
          
          <div 
            ref={reportContainerRef} 
            style={{ 
              position: 'relative',
              zIndex: 2,
              color: '#E5E5E5'
            }}
          >
            {/* CAPA */}
            <section style={{
              width: '100%',
              padding: '56px 0 40px 0',
              background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.3) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              marginBottom: '64px',
              textAlign: 'center'
            }}>
              <h1 style={{ 
                fontSize: '42px', 
                fontWeight: 700, 
                marginBottom: '20px',
                color: '#E5E5E5',
                lineHeight: 1.2
              }}>
                {String(report.title || '')}
              </h1>
              
              <p style={{
                fontSize: '18px',
                opacity: 0.88,
                marginBottom: '24px',
                color: '#E5E5E5',
                lineHeight: 1.6
              }}>
                Leitura completa para entender seu padrão e ajustar decisões com método.
              </p>

              {profileName && (
                <div style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  marginBottom: '20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#E5E5E5',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}>
                  {String(profileName)}
                </div>
              )}

              <p style={{
                fontSize: '13px',
                opacity: 0.7,
                color: '#E5E5E5',
                marginTop: '16px'
              }}>
                Não é diagnóstico. É leitura orientativa baseada nas suas respostas.
              </p>
            </section>

            {/* SUMÁRIO - Desktop (fixo lateral) e Mobile (colapsável) */}
            <div style={{
              position: 'sticky',
              top: '120px',
              alignSelf: 'flex-start',
              zIndex: 100,
              display: 'none'
            }} className="table-of-contents-desktop">
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                minWidth: '240px'
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  color: '#E5E5E5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  opacity: 0.8
                }}>
                  Sumário
                </h3>
                <nav>
                  {sortedBlocks.map((block, idx) => (
                    <a
                      key={block.block_id || idx}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToBlock(block.block_id || `block-${idx}`);
                      }}
                      style={{
                        display: 'block',
                        padding: '8px 0',
                        fontSize: '14px',
                        color: '#E5E5E5',
                        opacity: 0.88,
                        cursor: 'pointer',
                        textDecoration: 'none',
                        borderBottom: idx < sortedBlocks.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.88'}
                    >
                      {String(block.title || '')}
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* Botão Mobile para Sumário */}
            <div style={{
              display: 'block',
              marginBottom: '32px'
            }} className="table-of-contents-mobile">
              <button
                onClick={() => setIsTableOfContentsOpen(!isTableOfContentsOpen)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  color: '#E5E5E5',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {isTableOfContentsOpen ? '▼ Ocultar capítulos' : '▶ Ver capítulos'}
              </button>
              
              {isTableOfContentsOpen && (
                <div style={{
                  marginTop: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  {sortedBlocks.map((block, idx) => (
                    <a
                      key={block.block_id || idx}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToBlock(block.block_id || `block-${idx}`);
                      }}
                      style={{
                        display: 'block',
                        padding: '10px 0',
                        fontSize: '14px',
                        color: '#E5E5E5',
                        opacity: 0.88,
                        cursor: 'pointer',
                        textDecoration: 'none',
                        borderBottom: idx < sortedBlocks.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
                      }}
                    >
                      {String(block.title || '')}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* BLOCOS PREMIUM */}
            {sortedBlocks.map((block, index) => (
              <section 
                id={block.block_id || `block-${index}`}
                key={block.block_id || index}
                style={{ 
                  marginBottom: index < sortedBlocks.length - 1 ? '88px' : '0',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '20px',
                  padding: '36px'
                }}
              >
                <div style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#E5E5E5',
                  opacity: 0.8,
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Bloco {block.order || index + 1}
                </div>

                <h2 style={{ 
                  fontSize: '32px', 
                  fontWeight: 600, 
                  marginBottom: '10px',
                  marginTop: '0',
                  color: '#E5E5E5',
                  lineHeight: 1.3
                }}>
                  {String(block.title || '')}
                </h2>
                
                {block.subtitle && (
                  <p style={{ 
                    fontStyle: 'italic', 
                    fontSize: '16px', 
                    opacity: 0.7, 
                    marginTop: '10px',
                    marginBottom: '32px',
                    color: '#E5E5E5',
                    lineHeight: 1.5
                  }}>
                    {String(block.subtitle)}
                  </p>
                )}
                
                <div style={{
                  maxWidth: '68ch'
                }}>
                  {block.paragraphs && Array.isArray(block.paragraphs) && block.paragraphs.length > 0 && (
                    <>
                      {block.paragraphs.map((text, idx) => {
                        if (!text || String(text).trim() === '') return null;
                        return (
                          <p 
                            key={idx}
                            style={{ 
                              fontSize: '18px', 
                              lineHeight: 1.75,
                              opacity: 0.88,
                              marginBottom: idx < block.paragraphs.length - 1 ? '24px' : '0',
                              color: '#E5E5E5'
                            }}
                          >
                            {String(text)}
                          </p>
                        );
                      })}
                    </>
                  )}
                </div>
                
                {index < sortedBlocks.length - 1 && (
                  <div style={{
                    marginTop: '48px',
                    height: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    width: '80px'
                  }} />
                )}
              </section>
            ))}

            {/* RODAPÉ PREMIUM */}
            <section style={{ 
              marginTop: '96px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '20px',
              padding: '48px 36px',
              textAlign: 'center'
            }}>
              <h2 style={{ 
                fontSize: '28px', 
                marginBottom: '16px',
                color: '#E5E5E5',
                fontWeight: 600
              }}>
                Leve este relatório com você
              </h2>
              <p style={{ 
                fontSize: '16px', 
                opacity: 0.88, 
                marginBottom: '32px',
                color: '#E5E5E5',
                lineHeight: 1.6
              }}>
                Este material foi criado para ser relido com calma. Você pode baixar a versão em PDF para acessar quando quiser.
              </p>
              <button
                onClick={handleDownloadPDF}
                style={{
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5M13.3333 8.33333L10 11.6667M10 11.6667L6.66667 8.33333M10 11.6667V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Baixar PDF
              </button>
              <p style={{
                fontSize: '13px',
                opacity: 0.7,
                color: '#E5E5E5',
                marginTop: '16px'
              }}>
                Recomendado para leitura offline
              </p>
            </section>
          </div>
        </div>

        <style jsx>{`
          @media (min-width: 1200px) {
            .table-of-contents-desktop {
              display: block !important;
              position: fixed;
              right: max(24px, calc((100vw - 1200px) / 2));
              top: 120px;
              max-width: 260px;
            }
            .table-of-contents-mobile {
              display: none !important;
            }
          }
          @media (max-width: 1199px) {
            .table-of-contents-desktop {
              display: none !important;
            }
            .table-of-contents-mobile {
              display: block !important;
            }
          }
        `}</style>
      </main>
    );
  }

  // Fallback para estrutura antiga (se não veio de premium_report_content)
  const blocks = report.premium_report_content?.blocks || [];
  const sortedBlocks = [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0));
  const profileName = report.profileName || extractProfileNameFromFirstParagraph(sortedBlocks);

  return (
    <main className="page-root result-page" style={{ position: 'relative' }}>
      <div
        className="page-bg"
        style={{ 
          backgroundImage: `url(${LP_BG_URL})`,
          filter: 'blur(2px)'
        }}
      />
      <div className="page-overlay" />
      
      <div style={{ 
        maxWidth: '720px', 
        margin: '0 auto', 
        padding: '80px 24px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          borderRadius: '8px',
          zIndex: 1
        }} />
        
        <div 
          ref={reportContainerRef} 
          style={{ 
            position: 'relative',
            zIndex: 2,
            color: '#E5E5E5'
          }}
        >
          {/* CAPA */}
          <section style={{
            width: '100%',
            padding: '56px 0 40px 0',
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.3) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            marginBottom: '64px',
            textAlign: 'center'
          }}>
            <h1 style={{ 
              fontSize: '42px', 
              fontWeight: 700, 
              marginBottom: '20px',
              color: '#E5E5E5',
              lineHeight: 1.2
            }}>
              {String(report.title || 'Relatório Premium')}
            </h1>
            
            <p style={{
              fontSize: '18px',
              opacity: 0.88,
              marginBottom: '24px',
              color: '#E5E5E5',
              lineHeight: 1.6
            }}>
              Leitura completa para entender seu padrão e ajustar decisões com método.
            </p>

            {profileName && (
              <div style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                marginBottom: '20px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#E5E5E5',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                {String(profileName)}
              </div>
            )}

            <p style={{
              fontSize: '13px',
              opacity: 0.7,
              color: '#E5E5E5',
              marginTop: '16px'
            }}>
              Não é diagnóstico. É leitura orientativa baseada nas suas respostas.
            </p>
          </section>

          {/* SUMÁRIO - Desktop (fixo lateral) e Mobile (colapsável) */}
          <div style={{
            position: 'sticky',
            top: '120px',
            alignSelf: 'flex-start',
            zIndex: 100,
            display: 'none'
          }} className="table-of-contents-desktop">
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              minWidth: '240px'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '16px',
                color: '#E5E5E5',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                opacity: 0.8
              }}>
                Sumário
              </h3>
              <nav>
                {sortedBlocks.map((block, idx) => (
                  <a
                    key={block.block_id || idx}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToBlock(block.block_id || `block-${idx}`);
                    }}
                    style={{
                      display: 'block',
                      padding: '8px 0',
                      fontSize: '14px',
                      color: '#E5E5E5',
                      opacity: 0.88,
                      cursor: 'pointer',
                      textDecoration: 'none',
                      borderBottom: idx < sortedBlocks.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.88'}
                  >
                    {String(block.title || '')}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Botão Mobile para Sumário */}
          <div style={{
            display: 'block',
            marginBottom: '32px'
          }} className="table-of-contents-mobile">
            <button
              onClick={() => setIsTableOfContentsOpen(!isTableOfContentsOpen)}
              style={{
                width: '100%',
                padding: '14px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                color: '#E5E5E5',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              {isTableOfContentsOpen ? '▼ Ocultar capítulos' : '▶ Ver capítulos'}
            </button>
            
            {isTableOfContentsOpen && (
              <div style={{
                marginTop: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                {sortedBlocks.map((block, idx) => (
                  <a
                    key={block.block_id || idx}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToBlock(block.block_id || `block-${idx}`);
                    }}
                    style={{
                      display: 'block',
                      padding: '10px 0',
                      fontSize: '14px',
                      color: '#E5E5E5',
                      opacity: 0.88,
                      cursor: 'pointer',
                      textDecoration: 'none',
                      borderBottom: idx < sortedBlocks.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
                    }}
                  >
                    {String(block.title || '')}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* BLOCOS PREMIUM */}
          {sortedBlocks.map((block, index) => (
            <section 
              id={block.block_id || `block-${index}`}
              key={block.block_id || index}
              style={{ 
                marginBottom: index < sortedBlocks.length - 1 ? '88px' : '0',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '20px',
                padding: '36px'
              }}
            >
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#E5E5E5',
                opacity: 0.8,
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Bloco {block.order || index + 1}
              </div>

              <h2 style={{ 
                fontSize: '32px', 
                fontWeight: 600, 
                marginBottom: '10px',
                marginTop: '0',
                color: '#E5E5E5',
                lineHeight: 1.3
              }}>
                {String(block.title || '')}
              </h2>
              
              {block.subtitle && (
                <p style={{ 
                  fontStyle: 'italic', 
                  fontSize: '16px', 
                  opacity: 0.7, 
                  marginTop: '10px',
                  marginBottom: '32px',
                  color: '#E5E5E5',
                  lineHeight: 1.5
                }}>
                  {String(block.subtitle)}
                </p>
              )}
              
              <div style={{
                maxWidth: '68ch'
              }}>
                {block.paragraphs && Array.isArray(block.paragraphs) && block.paragraphs.length > 0 && (
                  <>
                    {block.paragraphs.map((text, idx) => {
                      if (!text || String(text).trim() === '') return null;
                      return (
                        <p 
                          key={idx}
                          style={{ 
                            fontSize: '18px', 
                            lineHeight: 1.75,
                            opacity: 0.88,
                            marginBottom: idx < block.paragraphs.length - 1 ? '24px' : '0',
                            color: '#E5E5E5'
                          }}
                        >
                          {String(text)}
                        </p>
                      );
                    })}
                  </>
                )}
              </div>
              
              {index < sortedBlocks.length - 1 && (
                <div style={{
                  marginTop: '48px',
                  height: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  width: '80px'
                }} />
              )}
            </section>
          ))}

          {/* RODAPÉ PREMIUM */}
          <section style={{ 
            marginTop: '96px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '20px',
            padding: '48px 36px',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              fontSize: '28px', 
              marginBottom: '16px',
              color: '#E5E5E5',
              fontWeight: 600
            }}>
              Leve este relatório com você
            </h2>
            <p style={{ 
              fontSize: '16px', 
              opacity: 0.88, 
              marginBottom: '32px',
              color: '#E5E5E5',
              lineHeight: 1.6
            }}>
              Este material foi criado para ser relido com calma. Você pode baixar a versão em PDF para acessar quando quiser.
            </p>
            <button
              onClick={handleDownloadPDF}
              style={{
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: 600,
                backgroundColor: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5M13.3333 8.33333L10 11.6667M10 11.6667L6.66667 8.33333M10 11.6667V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Baixar PDF
            </button>
            <p style={{
              fontSize: '13px',
              opacity: 0.7,
              color: '#E5E5E5',
              marginTop: '16px'
            }}>
              Recomendado para leitura offline
            </p>
          </section>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 1024px) {
          .table-of-contents-desktop {
            display: block !important;
            position: fixed;
            right: calc((100vw - 720px) / 2 - 280px);
            top: 120px;
          }
          .table-of-contents-mobile {
            display: none !important;
          }
        }
        @media (max-width: 1023px) {
          .table-of-contents-desktop {
            display: none !important;
          }
          .table-of-contents-mobile {
            display: block !important;
          }
        }
      `}</style>
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
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
    }>
      <ReportContent />
    </Suspense>
  );
}
