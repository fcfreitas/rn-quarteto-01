import type { Segment, SegmentWithProjection, SegmentStatus, AthleteId } from '@/types/race'

/**
 * Formats seconds as MM:SS/km pace string
 */
export function formatPace(secondsPerKm: number): string {
  const minutes = Math.floor(secondsPerKm / 60)
  const seconds = Math.round(secondsPerKm % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`
}

/**
 * Formats a timestamp to HH:MM in America/Sao_Paulo timezone
 */
export function formatTime(timestamp: string | null): string {
  if (!timestamp) return '—'
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

/**
 * Formats a timestamp to HH:MM:SS in America/Sao_Paulo timezone
 */
export function formatTimeWithSeconds(timestamp: string | null): string {
  if (!timestamp) return '—'
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

/**
 * Returns the segment status based on actual times and race state
 */
function getStatus(segment: Segment, raceStarted: boolean): SegmentStatus {
  if (segment.actual_finish_time) return 'concluido'
  if (segment.actual_start_time && raceStarted) return 'em_andamento'
  return 'previsto'
}

/**
 * Calculates the average pace in seconds/km for an athlete based on completed segments.
 * Returns null if no completed segments exist for the athlete.
 */
function getAthletePace(
  segments: Segment[],
  athlete: AthleteId,
  upToSegmentId: number
): number | null {
  const completed = segments.filter(
    (s) =>
      s.athlete === athlete &&
      s.id < upToSegmentId &&
      s.actual_finish_time !== null &&
      s.actual_start_time !== null
  )

  if (completed.length === 0) return null

  const totalDistance = completed.reduce((sum, s) => sum + Number(s.distance_km), 0)
  const totalSeconds = completed.reduce((sum, s) => {
    const start = new Date(s.actual_start_time!).getTime()
    const finish = new Date(s.actual_finish_time!).getTime()
    return sum + (finish - start) / 1000
  }, 0)

  return totalSeconds / totalDistance
}

/**
 * Main projection function:
 * - For each segment, determines status and projected times.
 * - Completed segments use actual times.
 * - In-progress segments use actual start + projected duration.
 * - Pending segments cascade from the previous segment's projected finish.
 * - Athlete-specific pace is derived from their completed segments.
 */
export function calculateProjections(
  segments: Segment[],
  raceStarted: boolean
): SegmentWithProjection[] {
  const sorted = [...segments].sort((a, b) => a.segment_number - b.segment_number)
  const result: SegmentWithProjection[] = []

  let cascadeFinishMs: number | null = null

  for (const segment of sorted) {
    const status = getStatus(segment, raceStarted)

    // Actual pace for completed segments
    let actual_pace_seconds_per_km: number | null = null
    if (status === 'concluido' && segment.actual_start_time && segment.actual_finish_time) {
      const durationMs =
        new Date(segment.actual_finish_time).getTime() -
        new Date(segment.actual_start_time).getTime()
      actual_pace_seconds_per_km = durationMs / 1000 / Number(segment.distance_km)
    }

    // Determine projected pace for this segment
    const athletePace = getAthletePace(sorted, segment.athlete as AthleteId, segment.id)
    const plannedPace = segment.estimated_duration_seconds / Number(segment.distance_km)
    const projected_pace_seconds_per_km = athletePace ?? plannedPace

    // Calculate projected start and finish times
    let projectedStartMs: number
    let projectedFinishMs: number

    if (status === 'concluido') {
      projectedStartMs = new Date(segment.actual_start_time!).getTime()
      projectedFinishMs = new Date(segment.actual_finish_time!).getTime()
      cascadeFinishMs = projectedFinishMs
    } else if (status === 'em_andamento') {
      projectedStartMs = new Date(segment.actual_start_time!).getTime()
      const projectedDurationMs = projected_pace_seconds_per_km * Number(segment.distance_km) * 1000
      projectedFinishMs = projectedStartMs + projectedDurationMs
      cascadeFinishMs = projectedFinishMs
    } else {
      // Previsto — cascade from previous segment or use planned time
      if (cascadeFinishMs !== null) {
        projectedStartMs = cascadeFinishMs
      } else {
        projectedStartMs = new Date(segment.planned_start_time).getTime()
      }
      const projectedDurationMs = projected_pace_seconds_per_km * Number(segment.distance_km) * 1000
      projectedFinishMs = projectedStartMs + projectedDurationMs
      cascadeFinishMs = projectedFinishMs
    }

    result.push({
      ...segment,
      status,
      projected_start_time: new Date(projectedStartMs).toISOString(),
      projected_finish_time: new Date(projectedFinishMs).toISOString(),
      projected_pace_seconds_per_km,
      actual_pace_seconds_per_km,
    })
  }

  return result
}

/**
 * Returns the currently active segment (em_andamento), if any.
 */
export function getCurrentSegment(
  projections: SegmentWithProjection[]
): SegmentWithProjection | null {
  return projections.find((s) => s.status === 'em_andamento') ?? null
}

/**
 * Returns the next pending segment after the current active one.
 */
export function getNextSegment(
  projections: SegmentWithProjection[]
): SegmentWithProjection | null {
  const currentIdx = projections.findIndex((s) => s.status === 'em_andamento')
  if (currentIdx !== -1 && currentIdx + 1 < projections.length) {
    return projections[currentIdx + 1]
  }
  // If no segment in progress, return the first previsto
  return projections.find((s) => s.status === 'previsto') ?? null
}
