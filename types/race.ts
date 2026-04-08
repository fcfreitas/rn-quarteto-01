export type AthleteId = 'Fabio' | 'Lara' | 'Renata' | 'Jeferson'

export interface RaceConfig {
  id: number
  start_time: string | null
  is_started: boolean
  created_at: string
}

export interface Segment {
  id: number
  segment_number: number
  athlete: AthleteId
  route_name: string
  distance_km: number
  estimated_duration_seconds: number
  planned_start_time: string
  planned_finish_time: string
  actual_start_time: string | null
  actual_finish_time: string | null
  created_at: string
}

export type SegmentStatus = 'previsto' | 'em_andamento' | 'concluido'

export interface SegmentWithProjection extends Segment {
  status: SegmentStatus
  projected_start_time: string
  projected_finish_time: string
  projected_pace_seconds_per_km: number
  actual_pace_seconds_per_km: number | null
}

export const ATHLETE_COLORS: Record<AthleteId, string> = {
  Fabio: '#B060FF',
  Lara: '#E040FB',
  Renata: '#CE93D8',
  Jeferson: '#FFFFFF',
}
