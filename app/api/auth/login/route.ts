import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyPassword } from '@/lib/password'
import type { User } from '@/types/database'

const EXPIRY_SECONDS = 60 * 60 * 24 * 7

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const { username, password } = body ?? {}

  if (!username || !password) {
    return NextResponse.json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' }, { status: 400 })
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, username, password, full_name, role')
    .eq('username', String(username).trim())
    .single<User>()

  if (!user || !(await verifyPassword(String(password), user.password))) {
    return NextResponse.json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true, role: user.role })
  response.cookies.set('session_user_id', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: EXPIRY_SECONDS,
    path: '/',
  })

  return response
}
