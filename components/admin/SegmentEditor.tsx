'use client'

import { useState } from 'react'
import type { SegmentWithProjection } from '@/types/race'
import { ATHLETE_COLORS } from '@/types/race'
import { formatTimeWithSeconds } from '@/lib/projections'

interface SegmentEditorProps {
  projections: SegmentWithProjection[]
  testMode: boolean
  onRegisterFinish: (segmentId: number, finishTime: string) => Promise<void>
}

function toLocalTimeInput(isoString: string | null): string {
  if (!isoString) return ''
  const d = new Date(isoString)
  const h = d.toLocaleString('pt-BR', { hour: '2-digit', timeZone: 'America/Sao_Paulo' })
  const m = d.toLocaleString('pt-BR', { minute: '2-digit', timeZone: 'America/Sao_Paulo' })
  const s = d.toLocaleString('pt-BR', { second: '2-digit', timeZone: 'America/Sao_Paulo' })
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`
}

function parseTimeInput(timeStr: string): Date {
  // Parses HH:MM:SS and returns a Date for today (race day) in Sao Paulo timezone
  const [h, m, s] = timeStr.split(':').map(Number)
  // Use race date 2026-04-11
  const raceDate = new Date('2026-04-11T00:00:00-03:00')
  raceDate.setHours(h, m, s ?? 0, 0)
  // Re-construct in BRT
  const iso = `2026-04-11T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s ?? 0).padStart(2,'0')}-03:00`
  return new Date(iso)
}

interface RowProps {
  seg: SegmentWithProjection
  testMode: boolean
  onRegisterFinish: (segmentId: number, finishTime: string) => Promise<void>
}

function SegmentRow({ seg, testMode, onRegisterFinish }: RowProps) {
  const [editing, setEditing] = useState(false)
  const [timeInput, setTimeInput] = useState(
    seg.actual_finish_time ? toLocalTimeInput(seg.actual_finish_time) : ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isDone = seg.status === 'concluido'
  const isActive = seg.status === 'em_andamento'
  const canEdit = testMode || !isDone

  async function handleSubmit() {
    if (!timeInput || timeInput.length < 5) {
      setError('Informe o horário no formato HH:MM ou HH:MM:SS')
      return
    }
    setError('')
    setLoading(true)
    try {
      const timeFull = timeInput.length === 5 ? timeInput + ':00' : timeInput
      const date = parseTimeInput(timeFull)
      await onRegisterFinish(seg.id, date.toISOString())
      setEditing(false)
    } catch (e) {
      setError('Erro ao registrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3"
      style={{
        background: isActive ? 'rgba(250,204,21,0.05)' : isDone ? 'rgba(74,222,128,0.04)' : 'var(--color-bg)',
        border: `1px solid ${isActive ? 'rgba(250,204,21,0.3)' : isDone ? 'rgba(74,222,128,0.2)' : 'var(--color-primary-mid)'}`,
      }}
    >
      {/* Info do trecho */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span
          className="text-lg font-bold font-mono w-7 text-center shrink-0"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {seg.segment_number}
        </span>
        <div className="min-w-0">
          <p className="font-semibold" style={{ color: ATHLETE_COLORS[seg.athlete] }}>
            {seg.athlete}
          </p>
          <p className="text-sm text-white truncate">{seg.route_name}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {Number(seg.distance_km).toFixed(1)} km
          </p>
        </div>
      </div>

      {/* Horários */}
      <div className="flex flex-col gap-1 text-xs shrink-0">
        <span style={{ color: 'var(--color-text-muted)' }}>
          Largada:{' '}
          <span className="font-mono text-white">
            {seg.actual_start_time ? formatTimeWithSeconds(seg.actual_start_time) : '—'}
          </span>
        </span>
        <span style={{ color: 'var(--color-text-muted)' }}>
          Chegada:{' '}
          <span className="font-mono" style={{ color: isDone ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
            {seg.actual_finish_time ? formatTimeWithSeconds(seg.actual_finish_time) : '—'}
          </span>
        </span>
      </div>

      {/* Status */}
      <div className="shrink-0">
        {isDone && !editing ? (
          <div className="flex flex-col items-end gap-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(74,222,128,0.15)', color: 'var(--color-success)', border: '1px solid var(--color-success)' }}
            >
              Concluído
            </span>
            {testMode && (
              <button
                onClick={() => { setEditing(true); setTimeInput(toLocalTimeInput(seg.actual_finish_time)) }}
                className="text-xs underline"
                style={{ color: 'var(--color-accent)' }}
              >
                Editar
              </button>
            )}
          </div>
        ) : isActive && !editing ? (
          <div className="flex flex-col items-end gap-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold badge-em-andamento"
              style={{ background: 'rgba(250,204,21,0.15)', color: 'var(--color-warning)', border: '1px solid var(--color-warning)' }}
            >
              Em andamento
            </span>
            <button
              onClick={() => setEditing(true)}
              className="text-xs px-3 py-1 rounded-lg font-semibold transition-colors hover:opacity-80"
              style={{ background: 'var(--color-primary)', color: 'white' }}
            >
              Registrar chegada
            </button>
          </div>
        ) : !editing ? (
          canEdit ? (
            <button
              onClick={() => setEditing(true)}
              className="text-xs px-3 py-1 rounded-lg font-medium transition-colors hover:opacity-80"
              style={{ background: 'var(--color-primary-dark)', color: 'var(--color-text-muted)', border: '1px solid var(--color-primary-mid)' }}
            >
              Registrar
            </button>
          ) : (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Previsto</span>
          )
        ) : null}

        {editing && (
          <div className="flex flex-col gap-2 items-end">
            <input
              type="text"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              placeholder="HH:MM:SS"
              maxLength={8}
              className="px-2 py-1 rounded font-mono text-sm text-white w-28 text-right"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-primary)' }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="text-xs px-3 py-1 rounded-lg font-semibold hover:opacity-80 disabled:opacity-50"
                style={{ background: 'var(--color-primary)', color: 'white' }}
              >
                {loading ? '...' : 'Salvar'}
              </button>
              <button
                onClick={() => { setEditing(false); setError('') }}
                className="text-xs px-3 py-1 rounded-lg font-medium"
                style={{ background: 'var(--color-primary-dark)', color: 'var(--color-text-muted)' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SegmentEditor({ projections, testMode, onRegisterFinish }: SegmentEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      {projections.map((seg) => (
        <SegmentRow
          key={seg.id}
          seg={seg}
          testMode={testMode}
          onRegisterFinish={onRegisterFinish}
        />
      ))}
    </div>
  )
}
