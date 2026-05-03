# MockEntry10Exam — Task Tracker

## Phase 1: Project Setup
- [x] Bootstrap Next.js project (App Router, TypeScript, Tailwind)
- [x] Install @supabase/supabase-js, lucide-react
- [x] Initialize shadcn/ui; add Button, Input, Form, Label, Card, RadioGroup, Checkbox, Textarea
- [x] Create `.env.local` with Supabase credential placeholders
- [x] Create `lib/supabase.ts` — Supabase singleton client
- [x] Create `types/database.ts` — User, Exam, ExamContent, Question, ExamAttempt interfaces

## Phase 2: Authentication (upcoming)
- [ ] Login page (`/login`) — username + password, no Supabase Auth
- [ ] Session management (cookie / localStorage)
- [ ] Protected route middleware

## Phase 3: Exam Engine (upcoming)
- [ ] Exam listing page
- [ ] Exam attempt page — render all 4 parts (A/B/C/D)
- [ ] Auto-save draft answers to Supabase
- [ ] Submit & score single/multiple choice questions

## Phase 4: Admin / Teacher (upcoming)
- [ ] Exam creation UI
- [ ] View student attempts & provide writing feedback

---

## Review
_To be updated after each implementation phase._
