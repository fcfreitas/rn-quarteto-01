import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createServiceClient } from '@/lib/supabase'

function isAdmin(email: string | null | undefined): boolean {
  return email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const { error } = await supabase
    .from('race_config')
    .upsert({ id: 1, start_time: new Date().toISOString(), is_started: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Reset race_config
  const { error: configError } = await supabase
    .from('race_config')
    .upsert({ id: 1, start_time: null, is_started: false })

  if (configError) {
    return NextResponse.json({ error: configError.message }, { status: 500 })
  }

  // Reset all segment actual times
  const { error: segError } = await supabase
    .from('segments')
    .update({ actual_start_time: null, actual_finish_time: null })
    .gte('id', 1)

  if (segError) {
    return NextResponse.json({ error: segError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
