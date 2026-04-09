import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function isAdmin(email: string | null | undefined): boolean {
  return email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.email || !isAdmin(token.email)) {
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

  const { data: current, error: fetchError } = await supabase
    .from('segments')
    .select('segment_number')
    .eq('id', segmentId)
    .single()

  if (fetchError || !current) {
    return NextResponse.json({ error: 'Trecho não encontrado' }, { status: 404 })
  }

  const { error: updateError } = await supabase
    .from('segments')
    .update({ actual_finish_time })
    .eq('id', segmentId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Propaga: actual_start_time do próximo trecho = actual_finish_time deste
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
