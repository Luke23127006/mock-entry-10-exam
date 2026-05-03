'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.get('username'),
        password: formData.get('password'),
      }),
    })

    const data = await res.json()
    setIsPending(false)

    if (!res.ok) {
      setError(data.error ?? 'Đăng nhập thất bại.')
      return
    }

    router.push(data.role === 'teacher' ? '/teacher' : '/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>Nhập thông tin để vào hệ thống luyện thi</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="username"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                disabled={isPending}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="underline underline-offset-4 hover:text-foreground">
                Đăng ký
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
