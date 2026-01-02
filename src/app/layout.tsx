import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mapa de Decisão",
  description: "Descubra seu perfil através do nosso quiz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning style={{ margin: 0, padding: 0, overflow: "hidden" }}>
      <head>
        <meta charSet="utf-8" />
        <title>Mapa de Decisão</title>
      </head>
      <body className="antialiased" suppressHydrationWarning style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}

