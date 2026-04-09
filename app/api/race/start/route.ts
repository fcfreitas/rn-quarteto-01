import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function isAdmin(email: string | null | undefined): boolean {
  return email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.email || !isAdmin(token.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const startTime = new Date().toISOString()

  const { error: configError } = await supabase
    .from('race_config')
    .upsert({ id: 1, start_time: startTime, is_started: true })

  if (configError) {
    return NextResponse.json({ error: configError.message }, { status: 500 })
  }

  const { error: segError } = await supabase
    .from('segments')
    .update({ actual_start_time: startTime })
    .eq('segment_number', 1)

  if (segError) {
    return NextResponse.json({ error: segError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, start_time: startTime })
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.email || !isAdmin(token.email)) {
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
