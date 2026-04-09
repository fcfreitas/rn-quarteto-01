import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function isAdmin(email: string | null | undefined): boolean {
  return email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const startTime = new Date().toISOString()

  // Salva horário de largada
  const { error: configError } = await supabase
    .from('race_config')
    .upsert({ id: 1, start_time: startTime, is_started: true })

  if (configError) {
    return NextResponse.json({ error: configError.message }, { status: 500 })
  }

  // Seta actual_start_time do primeiro trecho = horário de largada
  const { error: segError } = await supabase
    .from('segments')
    .update({ actual_start_time: startTime })
    .eq('segment_number', 1)

  if (segError) {
    return NextResponse.json({ error: segError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, start_time: startTime })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const { error: configError } = await supabase
    .from('race_config')
    .upsert({ id: 1, start_time: null, is_started: false })

  if (configError) {
    return NextResponse.json({ error: configError.message }, { status: 500 })
  }

  const { error: segError } = await supabase
    .from('segments')
    .update({ actual_start_time: null, actual_finish_time: null })
    .gte('id', 1)

  if (segError) {
    return NextResponse.json({ error: segError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
