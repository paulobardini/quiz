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

  const toCamelCase = (text) => {
    if (!text) return text;
    const str = String(text);
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const removeBlockPrefix = (title) => {
    if (!title) return title;
    const str = String(title);
    // Remove padrões como "Bloco 1:", "Bloco 2:", "Bloco 1 -", etc.
    return str.replace(/^Bloco\s+\d+\s*[:\-]\s*/i, '').trim();
  };

  const breakDaysLines = (text) => {
    if (!text) return text;
    const textStr = String(text);
    
    // Quebra linha antes de "Dias" ou "Dia" seguidos de números
    // Padrão: "Dias X e Y:" ou "Dia X:"
    let result = textStr;
    
    // Primeiro, quebra antes de "Dias" seguido de números e "e" (ex: "Dias 1 e 2:")
    result = result.replace(/([^\n])(Dias\s+\d+\s+e\s+\d+[:\-])/gi, '$1\n$2');
    
    // Depois, quebra antes de "Dia" seguido de número (mas não se já for parte de "Dias")
    // Usa uma abordagem mais simples: quebra antes de "Dia" seguido de espaço e número
    result = result.replace(/([^\n])(Dia\s+\d+[:\-])/gi, (match, before, dayPart) => {
      // Verifica se não é parte de "Dias" (verificando os últimos caracteres antes)
      const lastChars = before.slice(-5).toLowerCase();
      if (lastChars.includes('dias')) {
        return match; // Não quebra se for parte de "Dias"
      }
      return before + '\n' + dayPart;
    });
    
    // Converte quebras de linha em <br> para HTML
    result = result.replace(/\n/g, '<br />');
    
    return result;
  };

  const highlightKeyPhrases = (text) => {
    if (!text) return text;
    let textStr = String(text);
    
    // Primeiro, quebra linhas para Dias/Dia
    textStr = breakDaysLines(textStr);
    
    // Frases-chave obrigatórias
    const keyPhrases = [
      'Aqui, o problema não é você. É o processo.',
      'O ajuste aqui não é decidir melhor. É encerrar decisões.',
      'Consciência não muda tudo de uma vez.',
      'aqui, o problema não é você. É o processo.',
      'o ajuste aqui não é decidir melhor. É encerrar decisões.',
      'consciência não muda tudo de uma vez.'
    ];

    let result = textStr;
    keyPhrases.forEach(phrase => {
      const regex = new RegExp(`(${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      result = result.replace(regex, (match) => {
        return `<span style="display: block; font-size: 1.15em; max-width: 85%; margin: 32px auto; line-height: 1.6; opacity: 0.95; text-align: center;">${match}</span>`;
      });
    });

    return result;
  };

  const shouldHaveCard = (blockOrder) => {
    // Bloco 4: card pesado
    // Bloco 5: card mais claro
    // Bloco 7: card de fechamento
    return blockOrder === 4 || blockOrder === 5 || blockOrder === 7;
  };

  const getBlockVisualStyle = (blockOrder) => {
    const baseStyle = {
      marginBottom: '72px'
    };

    switch(blockOrder) {
      case 1:
        // Mais respiro e mais luz
        return { ...baseStyle, paddingTop: '48px', paddingBottom: '48px', opacity: 0.95 };
      case 3:
        // Mais fechado e denso
        return { ...baseStyle, paddingTop: '32px', paddingBottom: '32px', opacity: 0.88 };
      case 4:
        // Contraste mais forte
        return { ...baseStyle, paddingTop: '40px', paddingBottom: '40px', opacity: 0.92 };
      case 5:
        // Clarear levemente
        return { ...baseStyle, paddingTop: '40px', paddingBottom: '40px', opacity: 0.90 };
      case 7:
        // Sensação clara de encerramento
        return { ...baseStyle, paddingTop: '48px', paddingBottom: '48px', opacity: 0.93 };
      default:
        return baseStyle;
    }
  };

  const getCardStyle = (blockOrder) => {
    if (blockOrder === 4) {
      // Card pesado
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '40px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
      };
    } else if (blockOrder === 5) {
      // Card mais claro
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '40px',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)'
      };
    } else if (blockOrder === 7) {
      // Card de fechamento
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius: '8px',
        padding: '40px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)'
      };
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


    return (
      <main className="page-root result-page" style={{ 
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#0F0F0F',
        background: `
          radial-gradient(circle at 20% 50%, rgba(18, 18, 18, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(14, 14, 14, 0.3) 0%, transparent 50%),
          #0F0F0F
        `,
        backgroundSize: '100% 100%',
        backgroundAttachment: 'fixed'
      }}>
        {/* Granulação sutil */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.015) 0px, transparent 1px, transparent 2px, rgba(255, 255, 255, 0.015) 3px),
            repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.015) 0px, transparent 1px, transparent 2px, rgba(255, 255, 255, 0.015) 3px)
          `,
          backgroundSize: '100px 100px',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.4
        }} />
        
        <div style={{ 
          maxWidth: '720px', 
          margin: '0 auto', 
          padding: '80px 24px',
          position: 'relative',
          zIndex: 10
        }}>
          
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
              padding: '32px 0 32px 0',
              marginBottom: '48px',
              textAlign: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '32px'
            }}>
              <h1 style={{ 
                fontSize: '36px', 
                fontWeight: 400, 
                marginBottom: '20px',
                color: '#E5E5E5',
                lineHeight: 1.4,
                letterSpacing: '-0.3px'
              }}>
                {toCamelCase(report.title || '')}
              </h1>
              
              <p style={{
                fontSize: '16px',
                opacity: 0.7,
                marginBottom: '0',
                color: '#E5E5E5',
                lineHeight: 1.6,
                fontWeight: 300,
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Leitura completa para entender seu padrão e ajustar decisões com método. Não é diagnóstico. É leitura orientativa baseada nas suas respostas.
              </p>
            </section>

            {/* SUMÁRIO - Desktop (fixo lateral) e Mobile (colapsável) */}
            <div style={{
              position: 'sticky',
              top: '100px',
              alignSelf: 'flex-start',
              zIndex: 100,
              display: 'none'
            }} className="table-of-contents-desktop">
              <div style={{
                backgroundColor: 'transparent',
                border: 'none',
                padding: '0',
                minWidth: '200px'
              }}>
                <h3 style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  marginBottom: '16px',
                  color: '#E5E5E5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  opacity: 0.6,
                  fontWeight: 300
                }}>
                  Índice
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
                        opacity: 0.7,
                        cursor: 'pointer',
                        textDecoration: 'none',
                        borderBottom: 'none',
                        transition: 'opacity 0.2s',
                        fontWeight: 300,
                        lineHeight: 1.6
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                    >
                      {removeBlockPrefix(block.title || '')}
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* Botão Mobile para Sumário */}
            <div style={{
              display: 'block',
              marginBottom: '40px'
            }} className="table-of-contents-mobile">
              <button
                onClick={() => setIsTableOfContentsOpen(!isTableOfContentsOpen)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  color: '#E5E5E5',
                  fontSize: '14px',
                  fontWeight: 300,
                  cursor: 'pointer',
                  textAlign: 'left',
                  opacity: 0.7
                }}
              >
                {isTableOfContentsOpen ? 'Ocultar índice' : 'Índice'}
              </button>
              
              {isTableOfContentsOpen && (
                <div style={{
                  marginTop: '16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '0'
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
                        opacity: 0.7,
                        cursor: 'pointer',
                        textDecoration: 'none',
                        borderBottom: 'none',
                        fontWeight: 300,
                        lineHeight: 1.6
                      }}
                    >
                      {removeBlockPrefix(block.title || '')}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* BLOCOS PREMIUM */}
            {sortedBlocks.map((block, index) => {
              const blockOrder = block.order || index + 1;
              const hasCard = shouldHaveCard(blockOrder);
              const visualStyle = getBlockVisualStyle(blockOrder);
              const cardStyle = hasCard ? getCardStyle(blockOrder) : null;

              return (
                <section 
                  id={block.block_id || `block-${index}`}
                  key={block.block_id || index}
                  style={visualStyle}
                >
                  {hasCard ? (
                    <div style={cardStyle}>
                      <h2 style={{ 
                        fontSize: '28px', 
                        fontWeight: 400, 
                        marginBottom: '12px',
                        marginTop: '0',
                        color: '#E5E5E5',
                        lineHeight: 1.4,
                        letterSpacing: '-0.3px'
                      }}>
                        {removeBlockPrefix(block.title || '')}
                      </h2>
                      
                      {block.subtitle && (
                        <p style={{ 
                          fontStyle: 'italic', 
                          fontSize: '15px', 
                          opacity: 0.65, 
                          marginTop: '8px',
                          marginBottom: '28px',
                          color: '#E5E5E5',
                          lineHeight: 1.5,
                          fontWeight: 300
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
                              const textStr = String(text);
                              const highlightedText = highlightKeyPhrases(textStr);
                              const isKeyPhrase = highlightedText !== textStr;
                              
                              return (
                                <div
                                  key={idx}
                                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                                  style={{ 
                                    fontSize: isKeyPhrase ? '20px' : '17px', 
                                    lineHeight: isKeyPhrase ? 1.7 : 1.8,
                                    opacity: isKeyPhrase ? 0.92 : 0.85,
                                    marginBottom: idx < block.paragraphs.length - 1 ? (isKeyPhrase ? '36px' : '24px') : '0',
                                    color: '#E5E5E5',
                                    fontWeight: 300,
                                    transition: 'opacity 0.2s ease',
                                    textAlign: 'justify'
                                  }}
                                />
                              );
                            })}
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 style={{ 
                        fontSize: '28px', 
                        fontWeight: 400, 
                        marginBottom: '12px',
                        marginTop: '0',
                        color: '#E5E5E5',
                        lineHeight: 1.4,
                        letterSpacing: '-0.3px'
                      }}>
                        {removeBlockPrefix(block.title || '')}
                      </h2>
                      
                      {block.subtitle && (
                        <p style={{ 
                          fontStyle: 'italic', 
                          fontSize: '15px', 
                          opacity: 0.65, 
                          marginTop: '8px',
                          marginBottom: '28px',
                          color: '#E5E5E5',
                          lineHeight: 1.5,
                          fontWeight: 300
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
                              const textStr = String(text);
                              const highlightedText = highlightKeyPhrases(textStr);
                              const isKeyPhrase = highlightedText !== textStr;
                              
                              return (
                                <div
                                  key={idx}
                                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                                  style={{ 
                                    fontSize: isKeyPhrase ? '20px' : '17px', 
                                    lineHeight: isKeyPhrase ? 1.7 : 1.8,
                                    opacity: isKeyPhrase ? 0.92 : 0.85,
                                    marginBottom: idx < block.paragraphs.length - 1 ? (isKeyPhrase ? '36px' : '24px') : '0',
                                    color: '#E5E5E5',
                                    fontWeight: 300,
                                    transition: 'opacity 0.2s ease',
                                    textAlign: 'justify'
                                  }}
                                />
                              );
                            })}
                          </>
                        )}
                      </div>
                    </>
                  )}
                  
                  {index < sortedBlocks.length - 1 && !hasCard && (
                    <div style={{
                      marginTop: '56px',
                      height: '1px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      width: '100%'
                    }} />
                  )}
                </section>
              );
            })}

            {/* RODAPÉ PREMIUM */}
            <section style={{ 
              marginTop: '80px',
              paddingTop: '48px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center'
            }}>
              <h2 style={{ 
                fontSize: '22px', 
                marginBottom: '16px',
                color: '#E5E5E5',
                fontWeight: 400,
                letterSpacing: '-0.3px'
              }}>
                Leve este relatório com você
              </h2>
              <p style={{ 
                fontSize: '15px', 
                opacity: 0.7, 
                marginBottom: '28px',
                color: '#E5E5E5',
                lineHeight: 1.6,
                fontWeight: 300,
                maxWidth: '500px',
                margin: '0 auto 28px auto'
              }}>
                Este material foi criado para ser relido com calma. Você pode baixar a versão em PDF para acessar quando quiser.
              </p>
              <button
                onClick={handleDownloadPDF}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 400,
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  letterSpacing: '0.3px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.8 }}>
                  <path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5M13.3333 8.33333L10 11.6667M10 11.6667L6.66667 8.33333M10 11.6667V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Baixar PDF
              </button>
              <p style={{
                fontSize: '12px',
                opacity: 0.6,
                color: '#E5E5E5',
                marginTop: '16px',
                fontWeight: 300
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
              max-width: 200px;
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
  const sortedBlocksFallback = [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <main className="page-root result-page" style={{ 
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#0F0F0F',
      background: `
        radial-gradient(circle at 20% 50%, rgba(18, 18, 18, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(14, 14, 14, 0.3) 0%, transparent 50%),
        #0F0F0F
      `,
      backgroundSize: '100% 100%',
      backgroundAttachment: 'fixed'
    }}>
      {/* Granulação sutil */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.015) 0px, transparent 1px, transparent 2px, rgba(255, 255, 255, 0.015) 3px),
          repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.015) 0px, transparent 1px, transparent 2px, rgba(255, 255, 255, 0.015) 3px)
        `,
        backgroundSize: '100px 100px',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.4
      }} />
      
      <div style={{ 
        maxWidth: '720px', 
        margin: '0 auto', 
        padding: '80px 24px',
        position: 'relative',
        zIndex: 10
      }}>
        
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
            padding: '32px 0 40px 0',
            marginBottom: '80px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '40px'
          }}>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: 400, 
              marginBottom: '20px',
              color: '#E5E5E5',
              lineHeight: 1.4,
              letterSpacing: '-0.3px'
            }}>
              {toCamelCase(report.title || 'Relatório Premium')}
            </h1>
            
            <p style={{
              fontSize: '16px',
              opacity: 0.7,
              marginBottom: '0',
              color: '#E5E5E5',
              lineHeight: 1.6,
              fontWeight: 300,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Leitura completa para entender seu padrão e ajustar decisões com método. Não é diagnóstico. É leitura orientativa baseada nas suas respostas.
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
              backgroundColor: 'transparent',
              border: 'none',
              padding: '0',
              minWidth: '200px'
            }}>
              <h3 style={{
                fontSize: '12px',
                fontWeight: 400,
                marginBottom: '16px',
                color: '#E5E5E5',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                opacity: 0.6,
                fontWeight: 300
              }}>
                Índice
              </h3>
              <nav>
                {sortedBlocksFallback.map((block, idx) => (
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
                      opacity: 0.7,
                      cursor: 'pointer',
                      textDecoration: 'none',
                      borderBottom: 'none',
                      transition: 'opacity 0.2s',
                      fontWeight: 300,
                      lineHeight: 1.6
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
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
            marginBottom: '48px'
          }} className="table-of-contents-mobile">
            <button
              onClick={() => setIsTableOfContentsOpen(!isTableOfContentsOpen)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                color: '#E5E5E5',
                fontSize: '14px',
                fontWeight: 300,
                cursor: 'pointer',
                textAlign: 'left',
                opacity: 0.7
              }}
            >
              {isTableOfContentsOpen ? 'Ocultar índice' : 'Índice'}
            </button>
            
            {isTableOfContentsOpen && (
              <div style={{
                marginTop: '16px',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '0'
              }}>
                {sortedBlocksFallback.map((block, idx) => (
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
                      opacity: 0.7,
                      cursor: 'pointer',
                      textDecoration: 'none',
                      borderBottom: 'none',
                      fontWeight: 300,
                      lineHeight: 1.6
                    }}
                  >
                    {String(block.title || '')}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* BLOCOS PREMIUM */}
          {sortedBlocksFallback.map((block, index) => {
            const blockOrder = block.order || index + 1;
            const hasCard = shouldHaveCard(blockOrder);
            const visualStyle = getBlockVisualStyle(blockOrder);
            const cardStyle = hasCard ? getCardStyle(blockOrder) : null;

            return (
              <section 
                id={block.block_id || `block-${index}`}
                key={block.block_id || index}
                style={visualStyle}
              >
                {hasCard ? (
                  <div style={cardStyle}>
                      <h2 style={{ 
                        fontSize: '28px', 
                        fontWeight: 400, 
                        marginBottom: '12px',
                        marginTop: '0',
                        color: '#E5E5E5',
                        lineHeight: 1.4,
                        letterSpacing: '-0.3px'
                      }}>
                        {removeBlockPrefix(block.title || '')}
                      </h2>
                      
                      {block.subtitle && (
                        <p style={{ 
                          fontStyle: 'italic', 
                          fontSize: '15px', 
                          opacity: 0.65, 
                          marginTop: '8px',
                          marginBottom: '28px',
                          color: '#E5E5E5',
                          lineHeight: 1.5,
                          fontWeight: 300
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
                              const textStr = String(text);
                              const highlightedText = highlightKeyPhrases(textStr);
                              const isKeyPhrase = highlightedText !== textStr;
                              
                              return (
                                <div
                                  key={idx}
                                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                                  style={{ 
                                    fontSize: isKeyPhrase ? '20px' : '17px', 
                                    lineHeight: isKeyPhrase ? 1.7 : 1.8,
                                    opacity: isKeyPhrase ? 0.92 : 0.85,
                                    marginBottom: idx < block.paragraphs.length - 1 ? (isKeyPhrase ? '36px' : '24px') : '0',
                                    color: '#E5E5E5',
                                    fontWeight: 300,
                                    transition: 'opacity 0.2s ease',
                                    textAlign: 'justify'
                                  }}
                                />
                              );
                            })}
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 style={{ 
                        fontSize: '28px', 
                        fontWeight: 400, 
                        marginBottom: '12px',
                        marginTop: '0',
                        color: '#E5E5E5',
                        lineHeight: 1.4,
                        letterSpacing: '-0.3px'
                      }}>
                        {removeBlockPrefix(block.title || '')}
                      </h2>
                      
                      {block.subtitle && (
                        <p style={{ 
                          fontStyle: 'italic', 
                          fontSize: '15px', 
                          opacity: 0.65, 
                          marginTop: '8px',
                          marginBottom: '28px',
                          color: '#E5E5E5',
                          lineHeight: 1.5,
                          fontWeight: 300
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
                              const textStr = String(text);
                              const highlightedText = highlightKeyPhrases(textStr);
                              const isKeyPhrase = highlightedText !== textStr;
                              
                              return (
                                <div
                                  key={idx}
                                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                                  style={{ 
                                    fontSize: isKeyPhrase ? '20px' : '17px', 
                                    lineHeight: isKeyPhrase ? 1.7 : 1.8,
                                    opacity: isKeyPhrase ? 0.92 : 0.85,
                                    marginBottom: idx < block.paragraphs.length - 1 ? (isKeyPhrase ? '36px' : '24px') : '0',
                                    color: '#E5E5E5',
                                    fontWeight: 300,
                                    transition: 'opacity 0.2s ease',
                                    textAlign: 'justify'
                                  }}
                                />
                              );
                            })}
                          </>
                        )}
                      </div>
                    </>
                  )}
                  
                  {index < sortedBlocksFallback.length - 1 && !hasCard && (
                    <div style={{
                      marginTop: '56px',
                      height: '1px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      width: '100%'
                    }} />
                  )}
                </section>
              );
            })}

          {/* RODAPÉ PREMIUM */}
          <section style={{ 
            marginTop: '80px',
            paddingTop: '48px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              fontSize: '22px', 
              marginBottom: '16px',
              color: '#E5E5E5',
              fontWeight: 400,
              letterSpacing: '-0.3px'
            }}>
              Leve este relatório com você
            </h2>
            <p style={{ 
              fontSize: '15px', 
              opacity: 0.7, 
              marginBottom: '28px',
              color: '#E5E5E5',
              lineHeight: 1.6,
              fontWeight: 300,
              maxWidth: '500px',
              margin: '0 auto 28px auto'
            }}>
              Este material foi criado para ser relido com calma. Você pode baixar a versão em PDF para acessar quando quiser.
            </p>
            <button
              onClick={handleDownloadPDF}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 400,
                backgroundColor: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                letterSpacing: '0.3px'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.8 }}>
                <path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5M13.3333 8.33333L10 11.6667M10 11.6667L6.66667 8.33333M10 11.6667V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Baixar PDF
            </button>
            <p style={{
              fontSize: '12px',
              opacity: 0.6,
              color: '#E5E5E5',
              marginTop: '16px',
              fontWeight: 300
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
            max-width: 200px;
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
