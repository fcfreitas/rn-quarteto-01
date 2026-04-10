import type { SegmentWithProjection } from '@/types/race'
import { ATHLETE_COLORS } from '@/types/race'
import { formatTime, formatPace } from '@/lib/projections'

interface SegmentsTableProps {
  projections: SegmentWithProjection[]
}

function StatusBadge({ status }: { status: SegmentWithProjection['status'] }) {
  if (status === 'concluido') {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{ background: 'rgba(74,222,128,0.15)', color: 'var(--color-success)', border: '1px solid var(--color-success)' }}
      >
        Concluído
      </span>
    )
  }
  if (status === 'em_andamento') {
    return (
      <span
        className="badge-em-andamento inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{ background: 'rgba(250,204,21,0.15)', color: 'var(--color-warning)', border: '1px solid var(--color-warning)' }}
      >
        Em andamento
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: 'rgba(148,163,184,0.1)', color: 'var(--color-neutral)', border: '1px solid var(--color-neutral)' }}
    >
      Previsto
    </span>
  )
}

export default function SegmentsTable({ projections }: SegmentsTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl" style={{ border: '1px solid var(--color-primary-mid)' }}>
      <table className="w-full min-w-[820px] border-collapse text-sm">
        <thead>
          <tr style={{ background: 'var(--color-primary-dark)' }}>
            <th className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>#</th>
            <th className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Atleta</th>
            <th className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Trecho</th>
            <th className="px-3 py-3 text-right font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Km</th>
            <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Largada</th>
            <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Chegada</th>
            <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Pace previsto
            </th>
            <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Pace realizado
            </th>
            <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {projections.map((seg, idx) => {
            const isActive = seg.status === 'em_andamento'
            const isDone = seg.status === 'concluido'
            const rowBg = isActive
              ? 'rgba(250,204,21,0.05)'
              : isDone
              ? 'rgba(74,222,128,0.04)'
              : idx % 2 === 0
              ? 'rgba(45,17,85,0.6)'
              : 'rgba(26,10,46,0.8)'

            const startDisplay = seg.actual_start_time
              ? formatTime(seg.actual_start_time)
              : formatTime(seg.projected_start_time)
            const finishDisplay = seg.actual_finish_time
              ? formatTime(seg.actual_finish_time)
              : formatTime(seg.projected_finish_time)

            const startIsActual = !!seg.actual_start_time
            const finishIsActual = !!seg.actual_finish_time

            // Pace previsto: sempre calculado a partir da estimativa original
            const plannedPace = seg.estimated_duration_seconds / Number(seg.distance_km)

            // Pace realizado: apenas quando concluído com tempos reais
            const actualPace = seg.actual_pace_seconds_per_km

            return (
              <tr
                key={seg.id}
                style={{
                  background: rowBg,
                  borderBottom: '1px solid rgba(107,40,168,0.25)',
                  ...(isActive ? { outline: '1px solid rgba(250,204,21,0.3)' } : {}),
                }}
              >
                <td className="px-3 py-3 font-mono text-center" style={{ color: 'var(--color-text-muted)' }}>
                  {seg.segment_number}
                </td>
                <td className="px-3 py-3 font-semibold whitespace-nowrap" style={{ color: ATHLETE_COLORS[seg.athlete] }}>
                  {seg.athlete}
                </td>
                <td className="px-3 py-3 text-white">{seg.route_name}</td>
                <td className="px-3 py-3 text-right font-mono" style={{ color: 'var(--color-text-muted)' }}>
                  {Number(seg.distance_km).toFixed(1)}
                </td>
                <td className="px-3 py-3 text-center font-mono whitespace-nowrap">
                  <span style={{ color: startIsActual ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {startDisplay}
                  </span>
                  {!startIsActual && (
                    <span className="block text-xs" style={{ color: 'rgba(196,168,232,0.5)' }}>
                      prev
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 text-center font-mono whitespace-nowrap">
                  <span style={{ color: finishIsActual ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {finishDisplay}
                  </span>
                  {!finishIsActual && (
                    <span className="block text-xs" style={{ color: 'rgba(196,168,232,0.5)' }}>
                      est
                    </span>
                  )}
                </td>
                {/* Pace previsto — sempre visível */}
                <td className="px-3 py-3 text-center font-mono text-xs whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
                  {formatPace(plannedPace)}
                </td>
                {/* Pace realizado — só para trechos concluídos */}
                <td className="px-3 py-3 text-center font-mono text-xs whitespace-nowrap">
                  {actualPace !== null ? (
                    <span style={{ color: actualPace <= plannedPace ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {formatPace(actualPace)}
                    </span>
                  ) : (
                    <span style={{ color: 'rgba(196,168,232,0.3)' }}>—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-center">
                  <StatusBadge status={seg.status} />
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: 'var(--color-primary-dark)' }}>
            <td colSpan={3} className="px-3 py-3 font-semibold text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Total
            </td>
            <td className="px-3 py-3 text-right font-mono font-bold text-white">140</td>
            <td colSpan={5} />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
