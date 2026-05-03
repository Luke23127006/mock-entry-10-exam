const PART_META: Record<string, { title: string; points: string }> = {
  A: { title: 'PRONUNCIATION — Ngữ âm', points: '1.0 điểm' },
  B: { title: 'STRUCTURES AND VOCABULARY — Ngữ pháp & Từ vựng', points: '3.0 điểm' },
  C: { title: 'READING COMPREHENSION — Đọc hiểu', points: '3.0 điểm' },
  D: { title: 'WRITING — Kỹ năng Viết', points: '3.0 điểm' },
}

interface Props {
  part: 'A' | 'B' | 'C' | 'D'
}

export default function ExamPartHeader({ part }: Props) {
  const meta = PART_META[part]
  return (
    <div className="border-l-4 border-primary pl-4 py-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Part {part}
      </p>
      <h2 className="font-bold text-base">{meta.title}</h2>
      <p className="text-xs text-muted-foreground">{meta.points}</p>
    </div>
  )
}
