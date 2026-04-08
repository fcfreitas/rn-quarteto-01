import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Segment } from '@/types/race'

export async function GET() {
  const { data: segments, error: segError } = await supabase
    .from('segments')
    .select('*')
    .order('segment_number', { ascending: true })

  if (segError) {
    return NextResponse.json({ error: segError.message }, { status: 500 })
  }

  const { data: raceConfig, error: configError } = await supabase
    .from('race_config')
    .select('*')
    .eq('id', 1)
    .single()

  if (configError && configError.code !== 'PGRST116') {
    return NextResponse.json({ error: configError.message }, { status: 500 })
  }

  return NextResponse.json({
    segments: segments as Segment[],
    raceConfig: raceConfig ?? { id: 1, start_time: null, is_started: false },
  })
}
