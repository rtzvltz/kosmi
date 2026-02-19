/**
 * Seed script voor Kosmi
 *
 * Dit script maakt test data aan:
 * - 1 ouder account met 2 kinderen
 * - 1 school met 1 klas
 * - 3 werelden met topics, cursussen en lessen
 * - 2 karakters
 *
 * Run met: npm run seed
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PAYLOAD_API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Maak Payload admin user aan (handmatig via /admin)
  console.log('\n📝 STAP 1: Maak eerst een admin user aan via /admin')
  console.log('   Ga naar http://localhost:3000/admin en maak een account aan')

  // 2. Maak ouder account aan
  console.log('\n👨‍👩‍👧‍👦 STAP 2: Ouder account aanmaken...')

  const parentEmail = 'ouder@test.nl'
  const parentPassword = 'test123456'

  const { data: parentAuth, error: parentAuthError } = await supabase.auth.admin.createUser({
    email: parentEmail,
    password: parentPassword,
    email_confirm: true,
  })

  if (parentAuthError) {
    console.error('Error creating parent:', parentAuthError)
    return
  }

  console.log(`✅ Ouder aangemaakt: ${parentEmail} / ${parentPassword}`)

  // Maak parent profile
  const { error: parentProfileError } = await supabase
    .from('profiles')
    .insert({
      id: parentAuth.user.id,
      email: parentEmail,
      name: 'Test Ouder',
      role: 'parent',
    })

  if (parentProfileError) {
    console.error('Error creating parent profile:', parentProfileError)
    return
  }

  // Maak 2 kinderen aan
  console.log('\n👧👦 Kinderen aanmaken...')

  const children = [
    { name: 'Emma', groep: 3 },
    { name: 'Lars', groep: 6 },
  ]

  for (const child of children) {
    const { data: childAuth, error: childAuthError } = await supabase.auth.admin.createUser({
      email: `${child.name.toLowerCase()}@test.nl`,
      password: 'test123456',
      email_confirm: true,
    })

    if (childAuthError) {
      console.error(`Error creating child ${child.name}:`, childAuthError)
      continue
    }

    await supabase.from('profiles').insert({
      id: childAuth.user.id,
      name: child.name,
      display_name: child.name,
      role: 'student',
      groep: child.groep,
      parent_id: parentAuth.user.id,
    })

    await supabase.from('parent_child_links').insert({
      parent_id: parentAuth.user.id,
      child_id: childAuth.user.id,
    })

    console.log(`✅ Kind aangemaakt: ${child.name} (groep ${child.groep})`)
  }

  // 3. Maak school aan
  console.log('\n🏫 STAP 3: School aanmaken...')

  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .insert({
      name: 'Basisschool De Ontdekking',
      brin_code: '00AA00',
      city: 'Amsterdam',
    })
    .select()
    .single()

  if (schoolError) {
    console.error('Error creating school:', schoolError)
    return
  }

  console.log(`✅ School aangemaakt: ${school.name}`)

  // Maak school admin aan
  const { data: schoolAdminAuth, error: schoolAdminError } = await supabase.auth.admin.createUser({
    email: 'school@test.nl',
    password: 'test123456',
    email_confirm: true,
  })

  if (schoolAdminError) {
    console.error('Error creating school admin:', schoolAdminError)
    return
  }

  await supabase.from('profiles').insert({
    id: schoolAdminAuth.user.id,
    email: 'school@test.nl',
    name: 'Juf Marieke',
    role: 'school_admin',
    school_id: school.id,
  })

  console.log('✅ School admin aangemaakt: school@test.nl / test123456')

  // Maak klas aan
  const { data: classData } = await supabase
    .from('class_assignments')
    .insert({
      school_id: school.id,
      class_label: 'Groep 5A',
      groep: 5,
    })
    .select()
    .single()

  console.log('✅ Klas aangemaakt: Groep 5A')

  // 4. Payload data (handmatig via API of admin panel)
  console.log('\n🎨 STAP 4: Payload content aanmaken')
  console.log('   Ga naar http://localhost:3000/admin en maak aan:')
  console.log('   - 3 Werelden (bijv. "De Natuur", "De Geschiedenis", "Het Menselijk Lichaam")')
  console.log('   - Per wereld: 1 Topic en 1 Course')
  console.log('   - Per course: 2 Lessons met variants voor groep 3, 5 en 7')
  console.log('   - 2 Characters (bijv. een kever voor natuur, een ridder voor geschiedenis)')

  console.log('\n✅ Seed voltooid!')
  console.log('\nTest accounts:')
  console.log('- Ouder: ouder@test.nl / test123456')
  console.log('- Kind 1: Emma (groep 3)')
  console.log('- Kind 2: Lars (groep 6)')
  console.log('- School: school@test.nl / test123456')
  console.log('\nVergeet niet om Payload content aan te maken via /admin!')
}

main().catch(console.error)
