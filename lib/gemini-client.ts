import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai'

// ── Collect all configured API keys ──────────────────────────────────────────
const API_KEYS: string[] = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
].filter((k): k is string => !!k)

if (API_KEYS.length === 0) {
  console.warn('[gemini-client] No GEMINI_API_KEY_N variables found.')
}

// ── Round-robin cursor (module-level → persists within a Node.js worker) ─────
let currentKeyIndex = 0

// ── Error classification ──────────────────────────────────────────────────────
function isRateLimitError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const e = err as Record<string, any>
  const status: number | string = e.status ?? e.statusCode ?? e.code ?? 0
  const msg: string = (e.message ?? '').toLowerCase()
  return (
    status === 429 ||
    String(status) === '429' ||
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('resource_exhausted') ||
    msg.includes('too many requests')
  )
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Send a single prompt to the Gemini API with automatic key-rotation on
 * rate-limit / quota errors (HTTP 429 / RESOURCE_EXHAUSTED).
 *
 * Strategy:
 *  1. Start from the current round-robin index.
 *  2. On a rate-limit error → immediately try the next key.
 *  3. On any other error → re-throw (it is not recoverable by switching keys).
 *  4. On success → advance the cursor so the next call starts from the
 *     following key (spreading load evenly across keys).
 */
export async function generateWithFallback(
  modelName: string,
  generationConfig: Partial<GenerationConfig>,
  prompt: string,
): Promise<string> {
  if (API_KEYS.length === 0) {
    throw new Error('[gemini-client] No Gemini API keys are configured.')
  }

  const startIdx = currentKeyIndex

  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    const idx = (startIdx + attempt) % API_KEYS.length
    const key = API_KEYS[idx]

    try {
      const genAI = new GoogleGenerativeAI(key)
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig })
      const result = await model.generateContent(prompt)

      // Advance cursor so subsequent calls round-robin across keys
      currentKeyIndex = (idx + 1) % API_KEYS.length
      return result.response.text()
    } catch (err: unknown) {
      if (isRateLimitError(err)) {
        console.warn(
          `[gemini-client] Key #${idx + 1} rate-limited.` +
            (attempt + 1 < API_KEYS.length
              ? ` Trying key #${((idx + 1) % API_KEYS.length) + 1}…`
              : ' All keys exhausted.'),
        )
        if (attempt + 1 < API_KEYS.length) continue // try next key
      }
      // Non-recoverable error or all keys exhausted → re-throw
      throw err
    }
  }

  throw new Error('[gemini-client] All Gemini API keys are rate-limited or exhausted.')
}

/**
 * Probe a single API key with a minimal prompt.
 * Returns latency on success, or an error message on failure.
 */
export async function probeKey(
  keyIndex: number,
): Promise<{ status: 'ok' | 'rate_limited' | 'error'; latencyMs: number; error?: string }> {
  const key = API_KEYS[keyIndex]
  if (!key) return { status: 'error', latencyMs: 0, error: 'Key not configured' }

  const t0 = Date.now()
  try {
    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
    const result = await model.generateContent('Reply with the single word: ok')
    const text = result.response.text().trim().toLowerCase()
    const latencyMs = Date.now() - t0
    if (text.includes('ok')) return { status: 'ok', latencyMs }
    return { status: 'error', latencyMs, error: `Unexpected response: "${text}"` }
  } catch (err: unknown) {
    const latencyMs = Date.now() - t0
    const message = err instanceof Error ? err.message : String(err)
    if (isRateLimitError(err)) return { status: 'rate_limited', latencyMs, error: message }
    return { status: 'error', latencyMs, error: message }
  }
}

export { API_KEYS }
