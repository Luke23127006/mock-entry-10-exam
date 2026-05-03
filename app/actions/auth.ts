'use server'

import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { verifyPassword } from '@/lib/password'
import { createSession, deleteSession } from '@/lib/session'
import type { User } from '@/types/database'

export async function login(
  _prevState: { error: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' }
  }

  const { data: user, error: dbError } = await supabase
    .from('users')
    .select('id, username, password, full_name, role')
    .eq('username', username.trim())
    .single<User>()

  if (dbError || !user) {
    return { error: 'Tên đăng nhập hoặc mật khẩu không đúng.' }
  }

  const valid = await verifyPassword(password, user.password)
  if (!valid) {
    return { error: 'Tên đăng nhập hoặc mật khẩu không đúng.' }
  }

  await createSession({
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role ?? 'student',
  })
  redirect(user.role === 'teacher' ? '/teacher' : '/dashboard')
}

export async function logout(): Promise<void> {
  await deleteSession()
  redirect('/login')
}
