'use client'

import useSWR from 'swr'
import { calculateProjections, getCurrentSegment, getNextSegment } from '@/lib/projections'
import type { Segment, RaceConfig } from '@/types/race'
import FlorianopolisSilhouette from '@/components/public/FlorianopolisSilhouette'
import RaceStatus from '@/components/public/RaceStatus'
import SegmentsTable from '@/components/public/SegmentsTable'

interface ApiResponse {
  segments: Segment[]
  raceConfig: RaceConfig
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function PublicPage() {
  const { data, error, isLoading } = useSWR<ApiResponse>('/api/segments', fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  })

  const projections =
    data ? calculateProjections(data.segments, data.raceConfig.is_started) : []
  const currentSegment = getCurrentSegment(projections)
  const nextSegment = getNextSegment(projections)
  const raceConfig = data?.raceConfig ?? { start_time: null, is_started: false }

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        className="relative overflow-hidden py-10 px-4"
        style={{
          background: 'linear-gradient(180deg, var(--color-primary-dark) 0%, var(--color-bg) 100%)',
          borderBottom: '1px solid var(--color-primary-mid)',
        }}
      >
        {/* Silhueta decorativa */}
        <div className="absolute right-0 top-0 h-full w-72 sm:w-96 pointer-events-none">
          <FlorianopolisSilhouette />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--color-accent)' }}
          >
            RN Assessoria Esportiva
          </p>
          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight uppercase"
            style={{ color: 'var(--color-white)' }}
          >
            Volta à Ilha
          </h1>
          <p
            className="text-3xl sm:text-4xl font-black"
            style={{ color: 'var(--color-accent)' }}
          >
            2026
          </p>
          <p
            className="mt-2 text-base font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Quarteto 01
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-5">
            <InfoChip label="Data" value="11/04/2026" />
            <InfoChip label="Largada prevista" value="06:10 BRT" />
            <InfoChip label="Distância total" value="148,9 km" />
            <InfoChip label="Trechos" value="19" />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {isLoading && (
          <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
            Carregando dados...
          </div>
        )}
        {error && (
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #f87171', color: '#f87171' }}
          >
            Erro ao carregar dados. Tentando novamente...
          </div>
        )}
        {data && (
          <>
            <RaceStatus
              raceConfig={raceConfig}
              projections={projections}
              currentSegment={currentSegment}
              nextSegment={nextSegment}
            />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white">Todos os trechos</h2>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Atualiza a cada 30s
                </span>
              </div>
              <SegmentsTable projections={projections} />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs" style={{ color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-primary-mid)' }}>
        RN Assessoria Esportiva — Volta à Ilha 2026 — Florianópolis/SC
      </footer>
    </main>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col items-center px-4 py-2 rounded-lg"
      style={{ background: 'rgba(139,53,204,0.2)', border: '1px solid var(--color-primary-mid)' }}
    >
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  )
}
