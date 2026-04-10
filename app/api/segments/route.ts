import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase'
import type { Segment } from '@/types/race'

// Força renderização dinâmica — impede Static Generation no build
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  // Chamar headers() é uma função dinâmica que garante
  // que o Next.js nunca gere esta rota estaticamente
  headers()

  const supabase = createServiceClient()

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

  return NextResponse.json(
    {
      segments: segments as Segment[],
      raceConfig: raceConfig ?? { id: 1, start_time: null, is_started: false },
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  )
}
