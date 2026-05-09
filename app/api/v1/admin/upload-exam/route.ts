import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let { title, content } = body

    // Support the new modular format from CONVERSION_GUIDE.md
    // If 'sections' is at the top level, we wrap it into the 'content' JSONB field
    if (!content && body.sections) {
      content = { sections: body.sections }
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title and content (or sections) are required' },
        { status: 400 }
      )
    }

    const { data: newExam, error } = await supabase
      .from('exams')
      .insert({ title, content })
      .select('id')
      .single()

    if (error || !newExam) {
      console.error('Failed to insert exam:', error)
      return NextResponse.json({ error: 'Failed to insert exam into database' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Exam uploaded successfully',
      examId: newExam.id 
    })
  } catch (error: any) {
    console.error('Upload exam error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error while uploading exam' },
      { status: 500 }
    )
  }
}
