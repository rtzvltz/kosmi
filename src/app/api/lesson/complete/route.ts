import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { lessonId, reflectionAnswer, depthAccessed } = await request.json()

    // Update of maak lesson progress aan
    const { error } = await supabase
      .from('lesson_progress')
      .upsert({
        student_id: user.id,
        lesson_payload_id: lessonId,
        completed: true,
        depth_accessed: depthAccessed,
        reflection_answer: reflectionAnswer,
        completed_at: new Date().toISOString(),
      }, {
        onConflict: 'student_id,lesson_payload_id'
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Complete lesson error:', error)
    return NextResponse.json(
      { error: error.message || 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
