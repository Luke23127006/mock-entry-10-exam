import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function GET() {
  const startedAt = new Date().toISOString()

  // --- Gemini API check ---
  let geminiStatus: 'ok' | 'error' = 'error'
  let geminiLatencyMs: number | null = null
  let geminiError: string | null = null

  if (!process.env.GEMINI_API_KEY) {
    geminiError = 'GEMINI_API_KEY environment variable is not set'
  } else {
    const t0 = Date.now()
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
      const result = await model.generateContent('Reply with the single word: ok')
      const text = result.response.text().trim().toLowerCase()
      geminiLatencyMs = Date.now() - t0

      if (text.includes('ok')) {
        geminiStatus = 'ok'
      } else {
        geminiError = `Unexpected response: "${text}"`
      }
    } catch (err: any) {
      geminiLatencyMs = Date.now() - t0
      geminiError = err?.message ?? 'Unknown error'
    }
  }

  // --- Aggregate ---
  const healthy = geminiStatus === 'ok'

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      timestamp: startedAt,
      checks: {
        gemini: {
          status: geminiStatus,
          model: 'gemini-flash-latest',
          latencyMs: geminiLatencyMs,
          ...(geminiError ? { error: geminiError } : {}),
        },
      },
    },
    { status: healthy ? 200 : 503 }
  )
}
