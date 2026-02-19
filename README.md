# Kosmi 🌟

Een Nederlands leerplatform voor basisschoolkinderen (groep 1–8). Kinderen verkennen werelden, praten met interactieve AI-karakters, en verdienen punten voor nieuwsgierigheid.

## 📋 Overzicht

Kosmi biedt:
- **Interactieve lessen** aangepast per groepniveau
- **AI-karakters** waarmee kinderen kunnen chatten (powered by Claude)
- **Voice interaction** met spraakherkenning en text-to-speech
- **Puntensysteem** dat nieuwsgierigheid beloont
- **Verdiepingsoptie** voor extra uitdaging

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **CMS**: Payload CMS 3
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth
- **Betalingen**: Stripe
- **AI**: Anthropic Claude, ElevenLabs, OpenAI Whisper
- **Styling**: Tailwind CSS
- **Hosting**: Vercel

## 🚀 Quick Start (Lokaal)

### Vereisten

- Node.js 18+ geïnstalleerd
- Een Supabase account
- API keys voor Anthropic, ElevenLabs, en OpenAI

### Installatie

1. **Clone het project**
   ```bash
   cd /pad/naar/kosmi
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Maak .env.local aan**
   ```bash
   cp .env.example .env.local
   ```

4. **Vul .env.local in**

   Zie DEPLOYMENT.md voor gedetailleerde instructies over het verkrijgen van alle API keys.

5. **Supabase database setup**

   - Ga naar je Supabase dashboard
   - Open SQL Editor
   - Voer `supabase/schema.sql` uit

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open de app**

   Ga naar http://localhost:3000

8. **Maak admin account aan**

   Ga naar http://localhost:3000/admin en maak je eerste admin account aan.

9. **Run seed script (optioneel)**
   ```bash
   npm run seed
   ```

   Dit maakt test accounts aan (zie console output voor inloggegevens).

## 📁 Project Structuur

```
kosmi/
├── src/
│   ├── app/                 # Next.js app routes
│   │   ├── (auth)/          # Authenticatie pages
│   │   ├── (student)/       # Student app
│   │   ├── (parent)/        # Ouder dashboard
│   │   ├── (school)/        # School dashboard
│   │   ├── (payload)/       # Payload CMS admin
│   │   └── api/             # API routes
│   ├── lib/                 # Utilities
│   │   ├── supabase/        # Supabase clients
│   │   └── stripe.ts        # Stripe config
│   └── payload.config.ts    # Payload CMS config
├── scripts/
│   └── seed.ts              # Seed script
├── supabase/
│   └── schema.sql           # Database schema
├── DEPLOYMENT.md            # Deployment gids
└── SETUP.md                 # Setup instructies
```

## 🎯 Features

### Voor Leerlingen
- Verken werelden (De Natuur, Geschiedenis, etc.)
- Interactieve lessen aangepast aan groepniveau
- Chat met AI-karakters via tekst of spraak
- Verdien punten voor nieuwsgierigheid
- Optionele verdieping voor extra uitdaging

### Voor Ouders
- Beheer 1-3 kindprofielen
- Volg voortgang en punten
- Abonnementsbeheer via Stripe

### Voor Scholen
- Beheer klassen en leerlingen
- Twee abonnementsopties: per klas of schoolbreed
- Overzicht van voortgang

### Voor Admin (via Payload CMS)
- Beheer werelden, topics, cursussen en lessen
- Maak en pas karakters aan
- Upload media (afbeeldingen, audio)
- Gebruik AI om lesinhoud te genereren

## 💰 Prijzen

### Gezinnen
- 1 kind: €4/maand
- 2 kinderen: €6/maand
- 3 kinderen: €8/maand

### Scholen
- Per klas: €175/jaar
- Hele school: €900/jaar (onbeperkt)

## 🔐 Security

- Alle AI calls zijn server-side
- API keys worden nooit naar client gestuurd
- Character system prompts zijn server-only
- RLS (Row Level Security) op alle Supabase tabellen
- Audio wordt niet opgeslagen na transcriptie

## 📚 Documentatie

- **DEPLOYMENT.md**: Uitgebreide deployment gids voor Vercel
- **SETUP.md**: Setup instructies voor development
- **CLAUDE.md**: Volledige product specificatie

## 🧪 Test Accounts (na seed script)

Na het draaien van `npm run seed`:

```
Ouder: ouder@test.nl / test123456
Kind 1: Emma (groep 3)
Kind 2: Lars (groep 6)
School: school@test.nl / test123456
```

## 🚢 Deployment

Zie **DEPLOYMENT.md** voor een complete stap-voor-stap gids om te deployen naar Vercel.

Kort samengevat:
1. Supabase project aanmaken
2. Stripe producten aanmaken
3. AI API keys verkrijgen
4. Code naar GitHub pushen
5. Vercel project aanmaken
6. Environment variables instellen
7. Deployen!

## 📝 Licentie

Proprietary - Alle rechten voorbehouden

## 🙋 Support

Voor vragen of problemen:
- Check eerst DEPLOYMENT.md en deze README
- Bekijk de console logs voor errors
- Controleer of alle environment variables correct zijn ingevuld

---

**Gebouwd met ❤️ voor nieuwsgierige kinderen**
