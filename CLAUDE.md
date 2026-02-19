# Kosmi — Claude Code Instructie

## Belangrijk: hoe je communiceert

De persoon die je begeleidt is geen developer. Geef daarom altijd:

- Stap-voor-stap instructies in gewone Nederlandse taal
- Exacte commando's die je kunt kopiëren en plakken
- Uitleg van wat een commando doet voordat je het geeft
- Een melding als er iets mis kan gaan en wat je dan moet doen
- Geen aannames over wat iemand al weet

Als je een nieuw account of service nodig hebt, leg dan uit:
1. Ga naar [url]
2. Klik op [knop]
3. Vul in [wat]
4. Kopieer [wat] en plak het in [waar]

Geef altijd aan wanneer een stap klaar is en wat de volgende stap is.

---

## Wat je bouwt

Kosmi is een leerplatform voor Nederlandse basisschoolkinderen (groep 1–8). Kinderen verkennen werelden, praten met interactieve karakters, en verdienen punten voor nieuwsgierigheid.

Er is één beheerder: de founder. Die beheert alle content via Payload CMS. Geen teacher-creatie, geen review workflows. Content wordt gemaakt door de admin en geconsumeerd door kinderen.

Twee afnemertypen, dezelfde content:
- **Gezin** — ouder beheert 1–3 kind-profielen, betaalt per kind
- **School** — klassen met leerlingen, betaalt per klas

---

## Stack

| Laag | Keuze |
|---|---|
| Framework | Next.js 14 (App Router) |
| CMS + Admin UI | Payload CMS 3 (geïntegreerd in Next.js) |
| Database | Postgres via Supabase |
| Auth | Payload Auth (admin) + Supabase Auth (ouders, scholen, leerlingen) |
| Betalingen | Stripe |
| AI — chat + generatie | Anthropic Claude (claude-sonnet-4-5) |
| AI — spraak output | ElevenLabs TTS |
| AI — spraak input | OpenAI Whisper |
| Styling | Tailwind CSS |
| Deploy | Vercel + GitHub |

Alles in één repo. Payload draait op `/admin`. De leerling- en ouder-app draait op de rest van de Next.js routes.

---

## Omgevingsvariabelen

Maak een bestand `.env.local` aan in de root van het project met:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# Payload
PAYLOAD_SECRET=

# AI
ANTHROPIC_API_KEY=
ELEVENLABS_API_KEY=
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=https://jouwprojectnaam.vercel.app
```

Leg aan de gebruiker uit waar elke waarde vandaan komt en hoe je die ophaalt. Geef per service de exacte stappen.

---

## Payload CMS collecties

Definieer deze collecties in `payload.config.ts`.

### Worlds
```ts
{
  slug: 'worlds',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'published', type: 'checkbox', defaultValue: false },
  ]
}
```

### Topics
```ts
{
  slug: 'topics',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true },
    { name: 'world', type: 'relationship', relationTo: 'worlds', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'published', type: 'checkbox', defaultValue: false },
  ]
}
```

### Courses
```ts
{
  slug: 'courses',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true },
    { name: 'topic', type: 'relationship', relationTo: 'topics', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'targetGroepMin', type: 'number', min: 1, max: 8 },
    { name: 'targetGroepMax', type: 'number', min: 1, max: 8 },
    { name: 'published', type: 'checkbox', defaultValue: false },
  ]
}
```

### Lessons
```ts
{
  slug: 'lessons',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'course', type: 'relationship', relationTo: 'courses', required: true },
    { name: 'order', type: 'number', required: true },
    { name: 'characters', type: 'relationship', relationTo: 'characters', hasMany: true },
    {
      name: 'variants',
      type: 'array',
      fields: [
        { name: 'targetGroep', type: 'number', min: 1, max: 8, required: true },
        { name: 'introText', type: 'textarea' },
        { name: 'coreContent', type: 'richText' },
        { name: 'coreImage', type: 'upload', relationTo: 'media' },
        { name: 'coreImageCredit', type: 'text' },
        { name: 'depthContent', type: 'richText' },
        { name: 'depthImage', type: 'upload', relationTo: 'media' },
        { name: 'depthImageCredit', type: 'text' },
        { name: 'reflectionQuestion', type: 'text' },
        { name: 'pointsBase', type: 'number', defaultValue: 100 },
        { name: 'pointsDepthBonus', type: 'number', defaultValue: 50 },
      ]
    }
  ]
}
```

### Characters
```ts
{
  slug: 'characters',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true },
    { name: 'world', type: 'relationship', relationTo: 'worlds', required: true },
    { name: 'personaDescription', type: 'textarea' },
    { name: 'toneGuide', type: 'textarea' },
    { name: 'knowledgeScope', type: 'textarea', admin: { description: 'Komma-gescheiden lijst van onderwerpen' } },
    { name: 'offTopicRedirect', type: 'text' },
    { name: 'elevenLabsVoiceId', type: 'text', admin: { description: 'Voice ID uit ElevenLabs dashboard' } },
    { name: 'systemPrompt', type: 'textarea', admin: { description: 'Volledig LLM system prompt. Nooit naar client sturen.' } },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
  ]
}
```

### Media
Gebruik Payload's standaard media collectie. Sla bestanden op via Vercel Blob.

---

## Gebruikers en auth

Payload beheert alleen de admin (de founder). Alle andere gebruikers zitten in Supabase Auth + een `profiles` tabel.

### Supabase tabellen

```sql
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brin_code text,
  city text,
  active boolean default true,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  role text check (role in ('parent', 'student', 'school_admin')) not null,
  school_id uuid references schools(id),
  parent_id uuid references profiles(id),
  groep integer check (groep between 1 and 8),
  display_name text,
  points_total integer default 0,
  created_at timestamptz default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  type text check (type in ('family', 'school')),
  status text check (status in ('active', 'cancelled', 'past_due')) default 'active',
  stripe_subscription_id text,
  stripe_customer_id text,
  child_count integer default 1,
  class_count integer default 1,
  started_at timestamptz default now(),
  ends_at timestamptz
);

create table parent_child_links (
  parent_id uuid references profiles(id),
  child_id uuid references profiles(id),
  primary key (parent_id, child_id)
);

create table class_assignments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  class_label text,
  groep integer,
  created_at timestamptz default now()
);

create table class_students (
  class_id uuid references class_assignments(id),
  student_id uuid references profiles(id),
  primary key (class_id, student_id)
);

create table points_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id),
  lesson_payload_id text,
  lesson_variant_groep integer,
  course_payload_id text,
  world_payload_id text,
  event_type text check (event_type in ('lesson_complete', 'depth_accessed', 'character_chat', 'course_complete', 'world_first_visit')),
  points_awarded integer,
  created_at timestamptz default now()
);
```

RLS inschakelen op alle tabellen. Elke gebruiker leest en schrijft alleen eigen data.

---

## Prijzen en Stripe

### Gezin
| Situatie | Prijs |
|---|---|
| 1 kind | €4/maand |
| 2 kinderen | €6/maand |
| 3 kinderen | €8/maand |

Maak drie aparte Stripe prices aan op hetzelfde product.

### School
| Situatie | Prijs |
|---|---|
| Per klas | €175/jaar |
| Onbeperkt (hele school) | €900/jaar |

### API routes

**`POST /api/stripe/create-checkout`**
```ts
// body: { type: 'family_1' | 'family_2' | 'family_3' | 'school_class' | 'school_unlimited' }
// → maak Stripe Checkout Session aan
// → return { url: checkoutUrl }
```

**`POST /api/stripe/webhook`**
Luister naar:
- `checkout.session.completed` → schrijf subscription naar DB
- `customer.subscription.updated` → update status
- `customer.subscription.deleted` → zet status op `cancelled`

**`GET /api/stripe/portal`**
Maak Stripe Customer Portal sessie aan voor abonnementsbeheer.

---

## App structuur

```
/app
  /(auth)
    /login
    /register
      /family
      /school
  /(student)
    /dashboard
    /worlds
    /worlds/[slug]
    /worlds/[slug]/[topicSlug]
    /worlds/[slug]/[topicSlug]/[courseSlug]
    /lesson/[lessonId]
    /lesson/[lessonId]/depth
    /profile
  /(parent)
    /parent/dashboard
    /parent/children
    /parent/children/add
    /parent/subscription
  /(school)
    /school/dashboard
    /school/classes
    /school/classes/[id]
    /school/subscription
  /admin
  /api
    /stripe/create-checkout
    /stripe/webhook
    /stripe/portal
    /ai/chat
    /ai/tts
    /ai/stt
    /ai/generate-lesson
    /points
```

---

## AI routes

### `POST /api/ai/chat`

```ts
// body: {
//   characterId: string,
//   message: string,
//   studentGroep: number,
//   studentDisplayName: string,
//   conversationHistory: { role: 'user' | 'assistant', content: string }[]
// }

const character = await payload.findByID({ collection: 'characters', id: characterId })

const systemPrompt = `
${character.systemPrompt}

De leerling heet ${studentDisplayName} en zit in groep ${studentGroep}.
Pas je taalgebruik aan op dit niveau.
Blijf binnen je kennisgebied: ${character.knowledgeScope}.
Bij vragen buiten je kennisgebied zeg je: "${character.offTopicRedirect}"
Spreek de leerling aan bij naam waar dat natuurlijk voelt.
Antwoord altijd in het Nederlands.
Maximaal 3 zinnen per antwoord.
`

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 300,
  system: systemPrompt,
  messages: [...conversationHistory, { role: 'user', content: message }]
})

return { response: response.content[0].text }
```

### `POST /api/ai/tts`

```ts
// body: { text: string, voiceId: string }

const audio = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
  method: 'POST',
  headers: {
    'xi-api-key': process.env.ELEVENLABS_API_KEY!,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: { stability: 0.5, similarity_boost: 0.75 }
  })
})

return new Response(audio.body, { headers: { 'Content-Type': 'audio/mpeg' } })
```

### `POST /api/ai/stt`

```ts
// body: FormData met 'audio' blob
const transcription = await openai.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-1',
  language: 'nl',
})
return { transcript: transcription.text }
```

Sla audio nooit op.

### `POST /api/ai/generate-lesson`

```ts
// body: { topic: string, groepLevels: number[], worldId: string }
// Genereer via Anthropic voor elk groep niveau een variant
// Return JSON met alle variants klaar om in Payload op te slaan
```

Voeg een "Genereer les" knop toe in de Payload Lesson editor die deze route aanroept en de velden direct invult.

---

## Student lesflow

Volgorde in `/lesson/[lessonId]`:

1. Intro — tekst + ElevenLabs audio (auto-play groep 1–3, knop groep 4–8)
2. Core content — tekst + afbeelding met attribution
3. Karakterchat — chat UI, voice input via Whisper, antwoord via ElevenLabs
4. Depth prompt — prominente knop "Wil je meer weten? +50 punten"
5. Depth content — alleen als kind op de knop klikt
6. Reflectievraag — open, niet beoordeeld
7. Puntenoverzicht — verdiend in deze les + totaal

Selecteer de juiste lesvariant op basis van `profiles.groep`. Kies de variant met de dichtstbijzijnde `targetGroep`.

### Groep 1–3 UI
- Grotere knoppen en iconen
- Voice input is standaard
- Intro audio speelt automatisch

---

## Registratie flows

### Ouder
1. Naam, e-mail, wachtwoord
2. Kies aantal kinderen → Stripe Checkout
3. Na betaling: voeg kind-profielen toe (naam + groep)
4. Redirect naar `/parent/dashboard`

### School
1. Schoolnaam, contactpersoon, e-mail
2. Kies abonnement → Stripe Checkout
3. Na betaling: maak klassen aan, voeg leerlingen toe
4. Redirect naar `/school/dashboard`

Leerlingen loggen in via een unieke code of link — geen eigen e-mailadres nodig.

---

## Deploy naar Vercel

Leg de gebruiker stap voor stap uit hoe dit werkt. Gebruik deze volgorde:

**Stap 1 — GitHub repo aanmaken**
- Ga naar github.com en maak een gratis account als je die nog niet hebt
- Maak een nieuw repository aan, geef het de naam `kosmi`
- Zet de repo op Private

**Stap 2 — Code naar GitHub pushen**
Geef exact deze commando's:
```bash
git init
git add .
git commit -m "eerste versie"
git branch -M main
git remote add origin https://github.com/JOUWGEBRUIKERSNAAM/kosmi.git
git push -u origin main
```

**Stap 3 — Vercel account en koppeling**
- Ga naar vercel.com, maak een gratis account
- Klik op "Add New Project"
- Kies "Import Git Repository" en selecteer `kosmi`
- Klik op "Deploy" — Vercel bouwt de app automatisch

**Stap 4 — Environment variables in Vercel**
- Ga in Vercel naar jouw project → Settings → Environment Variables
- Voeg alle variabelen uit `.env.local` één voor één toe
- Klik daarna op "Redeploy" in het Deployments tabblad

**Stap 5 — Stripe webhook instellen**
- Ga naar dashboard.stripe.com → Developers → Webhooks
- Klik "Add endpoint"
- Vul in: `https://jouwprojectnaam.vercel.app/api/stripe/webhook`
- Selecteer events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Kopieer de "Signing secret" en plak die als `STRIPE_WEBHOOK_SECRET` in Vercel

Na elke `git push` herdeployt Vercel automatisch. De publieke URL kun je direct delen.

---

## Seed data

Maak `scripts/seed.ts` die aanmaakt:
- 1 ouder account met 2 kind-profielen (groep 3 en groep 6)
- 1 school met 1 klas (groep 5, 3 leerlingen)
- Via Payload REST API:
  - 3 werelden: "De Natuur", "De Geschiedenis", "Het Menselijk Lichaam"
  - Per wereld: 1 topic, 1 cursus, 2 lessen met variants voor groep 3, 5 en 7
  - 2 karakters: een kever voor De Natuur, een ridder voor De Geschiedenis

Draai met: `npx tsx scripts/seed.ts`

---

## Wat je NIET bouwt

- Teacher content-creatie
- Review workflows
- Leaderboards of badges
- Engelstalige content
- Mobiele app
- Analytics dashboard

---

## Veiligheidsregels

- Alle AI calls zijn server-side. Nooit API keys naar de client.
- Character `systemPrompt` nooit naar de client sturen.
- Whisper audio nooit opslaan na transcriptie.
- Alle afbeeldingen tonen attribution.
- RLS op alle Supabase tabellen.
- Payload admin alleen toegankelijk voor de founder.
