import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/password'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const { username, password, full_name } = body ?? {}

  if (!username || !password || !full_name) {
    return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin.' }, { status: 400 })
  }

  const hashed = await hashPassword(String(password))

  const { error } = await supabase
    .from('users')
    .insert({ username: String(username).trim(), password: hashed, full_name: String(full_name).trim(), role: 'student' })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Tên đăng nhập đã tồn tại.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Đăng ký thất bại. Vui lòng thử lại.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
