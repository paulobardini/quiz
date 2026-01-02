"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { startSession } from "@/lib/api"
import { 
  checkAndClearStorageIfNeeded, 
  setSessionId, 
  getSessionId 
} from "@/lib/storage"

export function StartButton({ label = "Quero descobrir" }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = async () => {
    if (isLoading) return

    // Verifica e limpa o storage se necessário antes de iniciar
    // Isso garante que se passou 1 hora ou 5 redirecionamentos, limpa tudo
    checkAndClearStorageIfNeeded()

    // Após verificar/limpar, verifica se ainda existe sessão ativa
    const existingSessionId = getSessionId()
    if (existingSessionId) {
      router.push("/loading")
      return
    }

    // Se não existe sessão, permite iniciar novo teste normalmente

    setIsLoading(true)

    try {
      const response = await startSession({ questionCount: 28 })
      const sessionId = response.sessionId

      setSessionId(sessionId)

      router.push("/loading")
    } catch (error) {
      console.error("Erro ao iniciar sessão:", error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Erro ao iniciar o quiz. Tente novamente."
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button 
      className="lp-button"
      onClick={handleStart}
      disabled={isLoading}
    >
      <span className="lp-buttonLabel">{isLoading ? "Iniciando" : label}</span>
      {!isLoading && <span className="lp-arrow" aria-hidden="true">→</span>}
    </button>
  )
}

