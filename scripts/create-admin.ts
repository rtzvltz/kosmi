/**
 * Maakt de eerste Payload CMS admin-gebruiker aan.
 * Werkt alleen als er nog GEEN admin bestaat (vers systeem).
 *
 * Run met:
 *   NEXT_PUBLIC_APP_URL=https://jouw-app.vercel.app npx tsx scripts/create-admin.ts
 *
 * Of lokaal:
 *   npx tsx scripts/create-admin.ts
 */

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

const ADMIN_EMAIL = 'admin@kosmi.nl'
const ADMIN_PASSWORD = 'KosmiAdmin2026!'

async function main() {
  console.log(`\n🔐 Admin aanmaken op: ${APP_URL}`)
  console.log(`   Email:    ${ADMIN_EMAIL}`)
  console.log(`   Wachtwoord: ${ADMIN_PASSWORD}\n`)

  const res = await fetch(`${APP_URL}/api/users/first-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  })

  const json = await res.json() as any

  if (res.ok) {
    console.log('✅ Admin aangemaakt!')
    console.log(`\n👉 Ga naar: ${APP_URL}/admin`)
    console.log(`   Email:    ${ADMIN_EMAIL}`)
    console.log(`   Wachtwoord: ${ADMIN_PASSWORD}`)
  } else if (res.status === 403) {
    // Er bestaat al een gebruiker — probeer in te loggen om te bevestigen
    console.log('⚠️  Er bestaat al een admin. Probeer in te loggen...')
    const loginRes = await fetch(`${APP_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    })
    if (loginRes.ok) {
      console.log('✅ Admin bestaat al en inloggen werkt!')
      console.log(`\n👉 Ga naar: ${APP_URL}/admin`)
      console.log(`   Email:    ${ADMIN_EMAIL}`)
      console.log(`   Wachtwoord: ${ADMIN_PASSWORD}`)
    } else {
      console.error('❌ Er bestaat al een admin maar de inloggegevens kloppen niet.')
      console.error('   Ga naar /admin en gebruik de wachtwoord-vergeten functie.')
    }
  } else {
    console.error('❌ Fout bij aanmaken admin:', JSON.stringify(json, null, 2))
    process.exit(1)
  }
}

main().catch(console.error)
