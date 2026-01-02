"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  getSessionId, 
  checkAndClearStorageIfNeeded,
  incrementHomeRedirectCount,
} from "@/lib/storage";

const LP_BG_URL =
  process.env.NEXT_PUBLIC_LP_BG_URL ||
  "https://i.ibb.co/yn3dKqtQ/pexels-njeromin-28203471.jpg";

export default function LoadingPage() {
  const router = useRouter();
  const hasExecuted = useRef(false);

  useEffect(() => {
    if (hasExecuted.current) return;
    hasExecuted.current = true;

    const sessionId = getSessionId();

    if (!sessionId) {
      // Incrementa o contador antes de verificar se deve limpar
      incrementHomeRedirectCount();
      // Verifica e limpa o storage se necessário (após incrementar)
      if (checkAndClearStorageIfNeeded()) {
        router.push("/");
        return;
      }
      router.push("/");
      return;
    }

    // Verifica e limpa o storage se necessário (mesmo com sessionId válido)
    if (checkAndClearStorageIfNeeded()) {
      router.push("/");
      return;
    }

    router.push("/quiz");
  }, [router]);

  return (
    <main className="page-root">
      <div
        className="page-bg"
        style={{ backgroundImage: `url(${LP_BG_URL})` }}
      />
      <div className="page-overlay" />
      <section className="page-center">
        <div className="page-card loading-card" style={{ maxWidth: "380px", borderRadius: "24px", padding: "44px 36px" }}>
          <div className="loading-spinner-wrapper">
            <div className="loading-spinner" />
            <div className="loading-pulse" />
          </div>
          <h2 className="text-lg font-medium text-white mb-0" style={{ letterSpacing: "-0.01em" }}>
            Organizando sua experiência...
          </h2>
        </div>
      </section>
    </main>
  );
}

