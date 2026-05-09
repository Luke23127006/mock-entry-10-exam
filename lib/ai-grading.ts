import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Question, WritingFeedback } from '@/types/database'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function gradeWritingWithAI(
  question: Question,
  studentAnswer: string
): Promise<WritingFeedback> {
  if (!studentAnswer || !studentAnswer.trim()) {
    return { score: 0, comment: 'Không có câu trả lời.', isAI: true }
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  })

  const questionInfo = `
Section Instruction: ${(question as any)._sectionInstruction || 'No specific instruction'}
${(question as any)._sectionPassage ? `Section Reading Passage: ${(question as any)._sectionPassage}` : ''}
Question Content: ${question.content || (question as any).promptText || 'No prompt provided'}
${question.passage ? `Question-specific Passage: ${question.passage}` : ''}
${(question as any).prefix ? `Sentence Start (Prefix): ${(question as any).prefix}` : ''}
Rubric: ${question.rubric || 'No specific rubric provided, use general English writing standards'}
`.trim()

  const prompt = `You are a strict but helpful 9th-grade English teacher. Grade the following student's writing based on the question details below.

### Question Details:
${questionInfo}

### Student's Answer:
${studentAnswer}

Provide:
1. A score out of 1.
2. Constructive feedback in Vietnamese, pointing out grammar/spelling mistakes and suggesting better vocabulary.

Output the response purely in JSON format: { "score": number, "feedback": "string" }.`

  try {
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
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
      isAI: true 
    }
  }
}
