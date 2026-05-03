import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/database'

export type SessionUser = Pick<User, 'id' | 'username' | 'full_name' | 'role'>

const COOKIE_NAME = 'session_user_id'
const EXPIRY_SECONDS = 60 * 60 * 24 * 7 // 7 days

export async function createSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: EXPIRY_SECONDS,
    path: '/',
  })
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get(COOKIE_NAME)?.value
  if (!userId) return null

  const { data: user } = await supabase
    .from('users')
    .select('id, username, full_name, role')
    .eq('id', userId)
    .single<SessionUser>()

  return user ?? null
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
