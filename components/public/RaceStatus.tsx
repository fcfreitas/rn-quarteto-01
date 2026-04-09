'use client'

import type { SegmentWithProjection } from '@/types/race'
import { ATHLETE_COLORS } from '@/types/race'
import { formatTime, formatPace } from '@/lib/projections'
import ElapsedTimer from './ElapsedTimer'

interface RaceStatusProps {
  raceConfig: { start_time: string | null; is_started: boolean }
  projections: SegmentWithProjection[]
  currentSegment: SegmentWithProjection | null
  nextSegment: SegmentWithProjection | null
}

export default function RaceStatus({
  raceConfig,
  projections,
  currentSegment,
  nextSegment,
}: RaceStatusProps) {
  const allFinished = projections.length > 0 && projections.every((s) => s.status === 'concluido')

  if (!raceConfig.is_started) {
    return (
      <div
        className="rounded-xl p-6 text-center mb-6"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-primary-mid)' }}
      >
        <p className="text-lg font-semibold" style={{ color: 'var(--color-text-muted)' }}>
          A prova ainda não foi iniciada
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Largada prevista às <strong className="text-white">06:10</strong> — 11 de abril de 2026
        </p>
      </div>
    )
  }

  if (allFinished) {
    const last = projections[projections.length - 1]
    const firstActual = projections.find((s) => s.actual_start_time)
    const totalMs =
      firstActual && last.actual_finish_time
        ? new Date(last.actual_finish_time).getTime() -
          new Date(firstActual.actual_start_time!).getTime()
        : null
    const totalHours = totalMs ? Math.floor(totalMs / 3600000) : null
    const totalMins = totalMs ? Math.floor((totalMs % 3600000) / 60000) : null

    return (
      <div
        className="rounded-xl p-6 text-center mb-6"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-success)' }}
      >
        <p className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
          🏁 Prova concluída!
        </p>
        {totalHours !== null && (
          <p className="text-lg mt-2 text-white">
            Tempo total:{' '}
            <span className="font-mono font-bold">
              {totalHours}h{totalMins?.toString().padStart(2, '0')}min
            </span>
          </p>
        )}
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-5 mb-6"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-primary-mid)' }}
    >
      {/* Corredor atual — destaque principal */}
      {currentSegment && currentSegment.actual_start_time && (
        <div
          className="rounded-lg p-4 mb-4"
          style={{ background: 'rgba(250,204,21,0.07)', border: '1px solid rgba(250,204,21,0.35)' }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: 'var(--color-warning)' }}
              >
                ▶ Em andamento — Trecho {currentSegment.segment_number}
              </span>
              <span
                className="text-3xl font-extrabold"
                style={{ color: ATHLETE_COLORS[currentSegment.athlete] }}
              >
                {currentSegment.athlete}
              </span>
              <span className="text-base text-white">{currentSegment.route_name}</span>
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {Number(currentSegment.distance_km).toFixed(1)} km &bull; Pace estimado:{' '}
                {formatPace(currentSegment.projected_pace_seconds_per_km)}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Largada: {formatTime(currentSegment.actual_start_time)} &bull; Chegada est:{' '}
                {formatTime(currentSegment.projected_finish_time)}
              </span>
            </div>

            {/* Timer do corredor atual */}
            <div className="flex items-center justify-center min-w-[140px]">
              <ElapsedTimer
                startTime={currentSegment.actual_start_time}
                label="Correndo há"
                size="lg"
                color="var(--color-warning)"
              />
            </div>
          </div>
        </div>
      )}

      {/* Linha inferior: timer geral + próximo trecho */}
      <div className="flex flex-wrap gap-4 items-start justify-between">
        {/* Timer geral da prova */}
        {raceConfig.start_time && (
          <div className="flex items-center justify-center px-2">
            <ElapsedTimer
              startTime={raceConfig.start_time}
              label="Prova em andamento"
              size="sm"
              color="var(--color-text-muted)"
            />
          </div>
        )}

        {/* Próximo trecho */}
        {nextSegment && (
          <div className="flex flex-col gap-1 px-2">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Próximo — Trecho {nextSegment.segment_number}
            </span>
            <span
              className="text-lg font-bold"
              style={{ color: ATHLETE_COLORS[nextSegment.athlete] }}
            >
              {nextSegment.athlete}
            </span>
            <span className="text-sm text-white">{nextSegment.route_name}</span>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {Number(nextSegment.distance_km).toFixed(1)} km &bull; Largada est:{' '}
              {formatTime(nextSegment.projected_start_time)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
