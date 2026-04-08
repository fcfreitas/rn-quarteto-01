import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Volta à Ilha 2026 — RN Quarteto 01',
  description:
    'Acompanhamento em tempo real do revezamento Volta à Ilha 2026 — RN Assessoria Esportiva Quarteto 01',
  openGraph: {
    title: 'Volta à Ilha 2026 — RN Quarteto 01',
    description: 'Acompanhamento em tempo real do revezamento',
    locale: 'pt_BR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
