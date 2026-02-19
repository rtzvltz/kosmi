import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import LessonClient from './LessonClient'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>
}) {
  const { lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Haal profiel op
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'student' || !profile.groep) {
    redirect('/login')
  }

  // Haal les op uit Payload
  const payload = await getPayload({ config })
  const lesson = await payload.findByID({
    collection: 'lessons',
    id: lessonId,
  })

  if (!lesson) {
    redirect('/dashboard')
  }

  // Zoek de juiste variant voor dit groepniveau
  const variant = lesson.variants?.find(
    (v: any) => v.targetGroep === profile.groep
  ) || lesson.variants?.[0]

  if (!variant) {
    redirect('/dashboard')
  }

  // Haal karakters op
  const characterIds = Array.isArray(lesson.characters)
    ? lesson.characters.map((c: any) => (typeof c === 'string' ? c : c.id))
    : []

  const characters = await Promise.all(
    characterIds.map((id: string) =>
      payload.findByID({ collection: 'characters', id })
    )
  )

  // Haal voortgang op
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('student_id', user.id)
    .eq('lesson_payload_id', lessonId)
    .single()

  return (
    <LessonClient
      lesson={lesson}
      variant={variant}
      characters={characters.filter((c) => c !== null)}
      profile={profile}
      progress={progress}
    />
  )
}
