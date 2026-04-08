'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Segment, RaceConfig } from '@/types/race'
import { calculateProjections } from '@/lib/projections'
import StartRaceButton from '@/components/admin/StartRaceButton'
import SegmentEditor from '@/components/admin/SegmentEditor'
import TestModeToggle from '@/components/admin/TestModeToggle'
import ElapsedTimer from '@/components/public/ElapsedTimer'
import Link from 'next/link'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [segments, setSegments] = useState<Segment[]>([])
  const [raceConfig, setRaceConfig] = useState<RaceConfig>({
    id: 1,
    start_time: null,
    is_started: false,
    created_at: '',
  })
  const [loading, setLoading] = useState(true)
  const [testMode, setTestMode] = useState(false)
  const [clearing, setClearing] = useState(false)

  // Auth guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/segments')
    if (res.ok) {
      const json = await res.json()
      setSegments(json.segments)
      setRaceConfig(json.raceConfig)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15_000)
    return () => clearInterval(interval)
  }, [fetchData])

  async function handleStart() {
    const res = await fetch('/api/race/start', { method: 'POST' })
    if (res.ok) {
      await fetchData()
    }
  }

  async function handleReset() {
    const res = await fetch('/api/race/start', { method: 'DELETE' })
    if (res.ok) {
      await fetchData()
    }
  }

  async function handleRegisterFinish(segmentId: number, finishTime: string) {
    const res = await fetch(`/api/segments/${segmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actual_finish_time: finishTime }),
    })
    if (!res.ok) {
      const json = await res.json()
      throw new Error(json.error ?? 'Erro desconhecido')
    }
    await fetchData()
  }

  async function handleClearTestData() {
    setClearing(true)
    await fetch('/api/race/start', { method: 'DELETE' })
    await fetchData()
    setClearing(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Carregando painel...</p>
      </div>
    )
  }

  const isAdmin = session?.user?.email === ADMIN_EMAIL

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: 'var(--color-bg)' }}>
        <div
          className="rounded-xl p-8 text-center max-w-sm w-full"
          style={{ background: 'var(--color-surface)', border: '1px solid #f87171' }}
        >
          <p className="text-4xl mb-3">🚫</p>
          <h2 className="text-xl font-bold text-white mb-2">Acesso não autorizado</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
            Conectado como <strong className="text-white">{session?.user?.email}</strong>.
            Este painel é restrito ao administrador.
          </p>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="px-6 py-2 rounded-lg font-semibold hover:opacity-80 transition-opacity"
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            Sair
          </button>
        </div>
      </div>
    )
  }

  const projections = calculateProjections(segments, raceConfig.is_started)

  return (
    <main className="min-h-screen pb-12" style={{ background: 'var(--color-bg)' }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between gap-3"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-primary-mid)' }}
      >
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs font-medium hover:underline" style={{ color: 'var(--color-text-muted)' }}>
            ← Página pública
          </Link>
          <span style={{ color: 'var(--color-primary-mid)' }}>|</span>
          <h1 className="text-sm font-bold text-white">Admin — Volta à Ilha 2026</h1>
        </div>
        <div className="flex items-center gap-3">
          <TestModeToggle testMode={testMode} onToggle={setTestMode} />
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="text-xs px-3 py-1 rounded-lg hover:opacity-80"
            style={{ background: 'var(--color-primary-dark)', color: 'var(--color-text-muted)', border: '1px solid var(--color-primary-mid)' }}
          >
            Sair
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-8">
        {/* Modo teste banner */}
        {testMode && (
          <div
            className="rounded-xl px-5 py-3 flex items-center gap-3"
            style={{ background: 'rgba(250,204,21,0.1)', border: '2px solid var(--color-warning)' }}
          >
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <p className="font-bold" style={{ color: 'var(--color-warning)' }}>MODO TESTE ATIVO</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Todos os campos são editáveis livremente, sem validações de sequência.
              </p>
            </div>
            <button
              onClick={handleClearTestData}
              disabled={clearing}
              className="text-xs px-3 py-1 rounded-lg font-semibold shrink-0 hover:opacity-80 disabled:opacity-50"
              style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid #f87171' }}
            >
              {clearing ? 'Limpando...' : 'Limpar dados de teste'}
            </button>
          </div>
        )}

        {/* Seção 1 — Controle da prova */}
        <section>
          <SectionTitle>Controle da Prova</SectionTitle>
          <div className="space-y-4">
            <StartRaceButton
              isStarted={raceConfig.is_started}
              startTime={raceConfig.start_time}
              onStart={handleStart}
              onReset={handleReset}
            />
            {raceConfig.is_started && raceConfig.start_time && (
              <div
                className="rounded-xl p-5 flex items-center justify-center"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-primary-mid)' }}
              >
                <ElapsedTimer startTime={raceConfig.start_time} />
              </div>
            )}
          </div>
        </section>

        {/* Seção 2 — Registro de chegadas */}
        <section>
          <SectionTitle>Registro de Chegadas</SectionTitle>
          <SegmentEditor
            projections={projections}
            testMode={testMode}
            onRegisterFinish={handleRegisterFinish}
          />
        </section>
      </div>
    </main>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs font-bold uppercase tracking-widest mb-4 pb-2"
      style={{ color: 'var(--color-accent)', borderBottom: '1px solid var(--color-primary-mid)' }}
    >
      {children}
    </h2>
  )
}
