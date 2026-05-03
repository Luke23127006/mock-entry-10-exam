# MockEntry10Exam — Task Tracker

## Phase 1: Project Setup
- [x] Bootstrap Next.js project (App Router, TypeScript, Tailwind)
- [x] Install @supabase/supabase-js, lucide-react
- [x] Initialize shadcn/ui; add Button, Input, Form, Label, Card, RadioGroup, Checkbox, Textarea
- [x] Create `.env.local` with Supabase credential placeholders
- [x] Create `lib/supabase.ts` — Supabase singleton client
- [x] Create `types/database.ts` — User, Exam, ExamContent, Question, ExamAttempt interfaces

## Phase 2: Authentication ✅
- [x] Login page (`/login`) — username + password, no Supabase Auth
- [x] Session management — JWT in httpOnly cookie via `jose` (7-day expiry)
- [x] Password hashing — `bcryptjs` (12 rounds)
- [x] Server Actions — `login()`, `logout()` in `app/actions/auth.ts`
- [x] Protected route proxy — `proxy.ts` (Next.js 16 convention)
- [x] Dashboard placeholder — `app/(protected)/dashboard/page.tsx`

## Phase 3: Exam Engine ✅
- [x] `types/database.ts` — added `part: 'A'|'B'|'C'|'D'` and `pointValue: number` to Question
- [x] `lib/scoring.ts` — pure scoreExam() function (single/multiple auto-score, writing skipped)
- [x] `app/actions/exam.ts` — startExam (create/resume), saveAnswersDraft, submitExam
- [x] `components/exam/` — ExamPartHeader, SingleChoiceQuestion, WritingQuestion, ExamTimer, AnswerSheet
- [x] `app/(protected)/exam/[attemptId]/page.tsx` — ownership-guarded server page
- [x] `app/(protected)/exam/[attemptId]/result/page.tsx` — per-question score breakdown
- [x] `app/(protected)/dashboard/page.tsx` — real exam list with Start/Resume/View result CTA

## Phase 4: Admin / Teacher ✅
- [x] Role system — `UserRole`, `WritingFeedback` types; `role` in `SessionUser` + JWT; login redirects by role
- [x] `app/actions/teacher.ts` — `createExam`, `submitWritingFeedback` (role-guarded)
- [x] `lib/scoring.ts` — added `computeFinalScore(autoScore, feedback)`
- [x] `components/teacher/ExamBuilderForm.tsx` — react-hook-form + useFieldArray per part
- [x] `components/teacher/PartSection.tsx` — per-part question list with Add/Remove
- [x] `components/teacher/QuestionEditorCard.tsx` — type/content/options/correctAnswer/rubric editor
- [x] `components/teacher/WritingFeedbackCard.tsx` — per-question score + comment display
- [x] `app/(teacher)/layout.tsx` — role guard; non-teachers → /dashboard
- [x] `app/(teacher)/teacher/page.tsx` — teacher dashboard with exam list
- [x] `app/(teacher)/teacher/exams/new/page.tsx` — exam builder page
- [x] `app/(teacher)/teacher/attempts/page.tsx` — all completed attempts list
- [x] `app/(teacher)/teacher/attempts/[attemptId]/page.tsx` — writing feedback form

---

## Review

### Phase 4 (2026-05-03)
- `Control<SomeType>` is not assignable to `Control<any>` due to contravariance — cast with `control as Control<any>` inside components using dynamic field paths; keep the prop type concrete
- Inline `useWatch` calls can't be wrapped in arrow functions (hooks rule) — assign `control as Control<any>` to a local `const` and call `useWatch` directly

### Phase 3 (2026-05-03)
- `Button` from `@base-ui/react` has no `asChild` prop — use `buttonVariants()` directly on `<Link>` instead
- Next.js 16 dynamic route `params` is a `Promise<{...}>` — must `await params` before destructuring

### Phase 2 (2026-05-03)
- JWT session via `jose`, httpOnly cookie, 7-day expiry
- `proxy.ts` (Next.js 16) replaces the deprecated `middleware.ts` convention — export name must be `proxy`, not `middleware`
- `bcryptjs` (pure JS, 12 rounds) — no native deps, works in all environments
- Build clean: zero TS errors, zero warnings
