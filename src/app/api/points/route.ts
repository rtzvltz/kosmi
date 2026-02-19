import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { lessonId, eventType, points } = await request.json()

    // Maak points event aan
    const { error } = await supabase.from('points_events').insert({
      student_id: user.id,
      lesson_payload_id: lessonId,
      event_type: eventType,
      points_awarded: points,
    })

    if (error) throw error

    // Totaal wordt automatisch bijgewerkt door de trigger
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Points API error:', error)
    return NextResponse.json(
      { error: error.message || 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
