import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  // Read session cookie to identify the user
  const cookieStore = await cookies()
  const userId = cookieStore.get('session_user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { attemptId, answers } = body as {
    attemptId: string
    answers: Record<string, string | string[]>
  }

  if (!attemptId || typeof answers !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { error } = await supabase
    .from('exam_attempts')
    .update({ answers })
    .eq('id', attemptId)
    .eq('user_id', userId)
    .eq('status', 'draft')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
