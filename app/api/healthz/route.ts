import { NextResponse } from 'next/server'
import { API_KEYS, probeKey } from '@/lib/gemini-client'

export async function GET() {
  const startedAt = new Date().toISOString()

  if (API_KEYS.length === 0) {
    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: startedAt,
        message: 'No GEMINI_API_KEY_N environment variables are configured.',
        checks: { gemini: [] },
      },
      { status: 503 },
    )
  }

  // Probe all keys in parallel
  const probeResults = await Promise.all(API_KEYS.map((_, i) => probeKey(i)))

  const keyChecks = probeResults.map((r, i) => ({
    key: `GEMINI_API_KEY_${i + 1}`,
    ...r,
  }))

  const okCount = keyChecks.filter((k) => k.status === 'ok').length
  const rateLimitedCount = keyChecks.filter((k) => k.status === 'rate_limited').length

  // Overall status
  let overallStatus: 'ok' | 'degraded' | 'down'
  if (okCount === API_KEYS.length) {
    overallStatus = 'ok'
  } else if (okCount > 0) {
    overallStatus = 'degraded'
  } else {
    overallStatus = 'down'
  }

  const httpStatus = overallStatus === 'down' ? 503 : overallStatus === 'degraded' ? 207 : 200

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: startedAt,
      summary: {
        total: API_KEYS.length,
        ok: okCount,
        rate_limited: rateLimitedCount,
        error: API_KEYS.length - okCount - rateLimitedCount,
      },
      checks: {
        gemini: keyChecks,
      },
    },
    { status: httpStatus },
  )
}
