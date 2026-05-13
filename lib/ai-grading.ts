import type { Question, WritingFeedback } from '@/types/database'
import { generateWithFallback } from '@/lib/gemini-client'

export async function gradeWritingWithAI(
  question: Question,
  studentAnswer: string
): Promise<WritingFeedback> {
  if (!studentAnswer || !studentAnswer.trim()) {
    return { score: 0, comment: 'Không có câu trả lời.', isAI: true }
  }

  const questionInfo = `
Section Instruction: ${(question as any)._sectionInstruction || 'No specific instruction'}
${(question as any)._sectionPassage ? `Section Reading Passage: ${(question as any)._sectionPassage}` : ''}
Question Content: ${question.content || (question as any).promptText || 'No prompt provided'}
${question.passage ? `Question-specific Passage: ${question.passage}` : ''}
${(question as any).prefix ? `Sentence Start (Prefix): ${(question as any).prefix}` : ''}
${question.correctAnswers && question.correctAnswers.length > 0 ? `Reference Correct Answers: ${question.correctAnswers.join('; ')}` : ''}
Rubric: ${question.rubric || 'No specific rubric provided, use general English writing standards'}
`.trim()

  const isShortWriting = (question.type || '').toLowerCase().includes('short_writing')

  const prompt = `You are a strict but helpful 9th-grade English teacher. Grade the following student's response based on the question details and reference correct answers provided.

### Question Details & Reference:
${questionInfo}

### Student's Answer:
${studentAnswer}

Grading Guidelines:
1. Semantic Accuracy: The student's response must be semantically equivalent to at least one reference answer.
2. ShortWriting Rules:
   - Perfect Answer (Correct fact + Correct grammar): 1.0
   - Minor Grammar Issues (Correct fact but minor error like missing 'the', small spelling slip): 0.5 to 0.8
   - Serious Mistakes (Wrong vocabulary, incorrect fact, or unintelligible grammar): 0.0
   - ${isShortWriting ? 'Keep the feedback VERY BRIEF (1 sentence max).' : ''}
3. Essay Rules: Grade based on grammar, vocabulary, and relevance.
4. Language: Always provide feedback in Vietnamese.

Provide:
1. A score from 0.0 to 1.0 (where 1.0 is full marks).
2. Constructive feedback in Vietnamese, pointing out grammar/spelling mistakes and suggesting better vocabulary. ${isShortWriting ? 'For this short question, just provide a quick note on correctness.' : 'Use HTML tags (<b>, <i>, <ul>, <li>, <br/>) to format the feedback.'}

Output the response purely in JSON format: { "score": number, "feedback": "string (HTML)" }.`

  try {
    const responseText = await generateWithFallback(
      'gemini-flash-latest',
      { responseMimeType: 'application/json' },
      prompt,
    )
    const parsed = JSON.parse(responseText)

    const aiScore = typeof parsed.score === 'number' ? parsed.score : 0
    const finalScore = Math.round(aiScore * (question.pointValue ?? 1) * 100) / 100

    return {
      score: finalScore,
      comment: typeof parsed.feedback === 'string' ? parsed.feedback : 'Error generating feedback.',
      isAI: true,
    }
  } catch (err) {
    console.error(`Gemini grading failed for question ${question.id}:`, err)
    return {
      score: 0,
      comment: 'An error occurred during AI auto-grading.',
      isAI: true,
    }
  }
}
