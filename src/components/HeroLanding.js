"use client"

import { useEffect } from "react"
import { StartButton } from "./StartButton"
import { checkAndClearStorageIfNeeded } from "@/lib/storage"

export function HeroLanding() {
  useEffect(() => {
    // Verifica e limpa o storage se necessário ao carregar a home
    checkAndClearStorageIfNeeded()
  }, [])
  // Use o link direto da imagem do ImgBB (não a página)
  // Para obter: acesse https://ibb.co/yn3dKqtQ e copie o "Direct link" ou "Image link"
  const bgUrl = process.env.NEXT_PUBLIC_LP_BG_URL || "https://i.ibb.co/yn3dKqtQ/pexels-njeromin-28203471.jpg"

  return (
    <main className="lp-root">
      <div
        className="lp-bg"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />

      <div className="lp-overlay" />

      <section className="lp-center">
        <div className="lp-card">
          <div className="lp-journey-indicator" aria-hidden="true">
            <span className="lp-journey-dot"></span>
            <span className="lp-journey-line"></span>
          </div>

          <h1 className="lp-title">
            Você está vivendo com consciência  
            ou no automático?
          </h1>

          <p className="lp-subtitle">
            Em poucos minutos, você identifica o padrão que mais interfere nas suas escolhas hoje.
          </p>

          <StartButton label="Quero descobrir" />

          <p className="lp-footnote">
            Leva cerca de 15 minutos.  
            Responda com sinceridade. Não existe resposta certa ou errada.
          </p>

          <p className="lp-privacy">
            Suas respostas são privadas e não são compartilhadas.
          </p>
        </div>
      </section>
    </main>
  )
}

