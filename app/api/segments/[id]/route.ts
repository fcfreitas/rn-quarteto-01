import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'

function isAdmin(email: string | null | undefined): boolean {
  return email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const segmentId = parseInt(params.id, 10)
  if (isNaN(segmentId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const body = await req.json()
  const { actual_finish_time } = body

  if (!actual_finish_time) {
    return NextResponse.json({ error: 'actual_finish_time é obrigatório' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Busca o segment_number do trecho atual
  const { data: current, error: fetchError } = await supabase
    .from('segments')
    .select('segment_number')
    .eq('id', segmentId)
    .single()

  if (fetchError || !current) {
    return NextResponse.json({ error: 'Trecho não encontrado' }, { status: 404 })
  }

  // Atualiza chegada do trecho atual
  const { error: updateError } = await supabase
    .from('segments')
    .update({ actual_finish_time })
    .eq('id', segmentId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Propaga: start do próximo trecho = finish deste
  const { data: nextSegment } = await supabase
    .from('segments')
    .select('id')
    .eq('segment_number', current.segment_number + 1)
    .single()

  if (nextSegment) {
    await supabase
      .from('segments')
      .update({ actual_start_time: actual_finish_time })
      .eq('id', nextSegment.id)
  }

  return NextResponse.json({ ok: true })
}
