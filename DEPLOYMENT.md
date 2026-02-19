# Kosmi - Deployment Gids

Deze gids helpt je stap voor stap om Kosmi te deployen naar Vercel.

## Wat je nodig hebt

Voordat je begint, zorg dat je accounts hebt bij:
- GitHub (gratis)
- Vercel (gratis)
- Supabase (gratis)
- Stripe (gratis, maar betaald voor live payments)
- Anthropic (API key nodig)
- ElevenLabs (API key nodig)
- OpenAI (API key nodig)

---

## Stap 1: Supabase Database Opzetten

1. **Ga naar [supabase.com](https://supabase.com)**
2. Klik op "Start your project"
3. Maak een gratis account aan als je die nog niet hebt
4. Klik op "New project"
5. Vul in:
   - Name: `kosmi`
   - Database Password: (kies een sterk wachtwoord en bewaar deze!)
   - Region: West EU (Netherlands)
6. Klik op "Create new project"
7. Wacht tot het project klaar is (dit kan 2-3 minuten duren)

### Database Schema Aanmaken

1. Klik in je Supabase project op "SQL Editor" in het linker menu
2. Klik op "+ New query"
3. Open het bestand `supabase/schema.sql` in je code editor
4. Kopieer de hele inhoud
5. Plak deze in de SQL Editor in Supabase
6. Klik op "Run" rechtsonder
7. Je zou nu "Success. No rows returned" moeten zien

### API Keys Ophalen

1. Klik op "Project Settings" (tandwiel icoon linksonder)
2. Klik op "API" in het linker menu
3. Noteer de volgende waarden:
   - **Project URL** (dit is je `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (dit is je `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** key (dit is je `SUPABASE_SERVICE_ROLE_KEY`) - GEHEIM!
4. Klik op "Database" in het linker menu
5. Scroll naar "Connection string" → "URI"
6. Kopieer de connection string en vervang `[YOUR-PASSWORD]` met je database wachtwoord
7. Dit is je `DATABASE_URL`

---

## Stap 2: Stripe Producten en Prijzen Aanmaken

1. **Ga naar [dashboard.stripe.com](https://dashboard.stripe.com)**
2. Maak een gratis account aan als je die nog niet hebt
3. Je ziet een melding "You're in test mode" - dat is prima voor nu

### Familie Prijzen Aanmaken

1. Klik op "Products" in het linker menu
2. Klik op "+ Add product"
3. Vul in:
   - Name: `Kosmi Familie 1 Kind`
   - Pricing model: `Standard pricing`
   - Price: `4` EUR
   - Billing period: `Monthly`
   - Recurring: ✓
4. Klik op "Save product"
5. Kopieer de **Price ID** (begint met `price_...`)
6. Dit is je `STRIPE_PRICE_FAMILY_1`

Herhaal dit voor:
- **Familie 2 Kinderen**: €6/maand → `STRIPE_PRICE_FAMILY_2`
- **Familie 3 Kinderen**: €8/maand → `STRIPE_PRICE_FAMILY_3`
- **School Per Klas**: €175/jaar (yearly) → `STRIPE_PRICE_SCHOOL_CLASS`
- **School Onbeperkt**: €900/jaar (yearly) → `STRIPE_PRICE_SCHOOL_UNLIMITED`

### API Keys Ophalen

1. Klik op "Developers" rechtsbovenin
2. Klik op "API keys"
3. Noteer:
   - **Publishable key** (begint met `pk_test_...`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (begint met `sk_test_...`) → `STRIPE_SECRET_KEY` - GEHEIM!

---

## Stap 3: AI API Keys Ophalen

### Anthropic (Claude)

1. Ga naar [console.anthropic.com](https://console.anthropic.com)
2. Maak een account aan
3. Klik op "Get API Keys"
4. Klik op "Create Key"
5. Geef een naam (bijv. "Kosmi")
6. Kopieer de key → `ANTHROPIC_API_KEY` - GEHEIM!

### ElevenLabs (Text-to-Speech)

1. Ga naar [elevenlabs.io](https://elevenlabs.io)
2. Maak een gratis account aan
3. Klik op je profiel icoon rechtsboven → "Profile"
4. Kopieer je API Key → `ELEVENLABS_API_KEY` - GEHEIM!

### OpenAI (Whisper STT)

1. Ga naar [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Maak een account aan
3. Klik op "+ Create new secret key"
4. Geef een naam (bijv. "Kosmi")
5. Kopieer de key → `OPENAI_API_KEY` - GEHEIM!

---

## Stap 4: Vercel Blob Storage

1. Dit wordt automatisch opgezet bij deployment naar Vercel
2. Je hoeft hier nu niks voor te doen

---

## Stap 5: GitHub Repository Aanmaken

1. **Ga naar [github.com](https://github.com)**
2. Klik op het "+" icoon rechtsboven → "New repository"
3. Vul in:
   - Repository name: `kosmi`
   - Description: "Leerplatform voor nieuwsgierige kinderen"
   - Visibility: **Private** (aangeraden)
4. Klik op "Create repository"
5. **Laat dit scherm open**, je hebt de commands zo nodig

---

## Stap 6: Code naar GitHub Pushen

Open een terminal (Command Prompt op Windows, Terminal op Mac) en ga naar de kosmi map:

```bash
cd /pad/naar/kosmi
```

Voer dan de volgende commando's uit:

```bash
git init
git add .
git commit -m "Eerste versie Kosmi"
git branch -M main
git remote add origin https://github.com/JOUWGEBRUIKERSNAAM/kosmi.git
git push -u origin main
```

**Let op**: Vervang `JOUWGEBRUIKERSNAAM` met je echte GitHub gebruikersnaam!

Als het goed is zie je nu al je code in GitHub staan.

---

## Stap 7: Deployen naar Vercel

1. **Ga naar [vercel.com](https://vercel.com)**
2. Klik op "Sign Up" en kies "Continue with GitHub"
3. Geef Vercel toegang tot je GitHub account
4. Klik op "Add New..." → "Project"
5. Zoek naar `kosmi` en klik op "Import"
6. Laat de Build settings zoals ze zijn
7. **Klik eerst NIET op Deploy!**

### Environment Variables Toevoegen

1. Scroll naar "Environment Variables"
2. Voeg ALLE onderstaande variabelen toe:

```
NEXT_PUBLIC_SUPABASE_URL=[jouw waarde]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[jouw waarde]
SUPABASE_SERVICE_ROLE_KEY=[jouw waarde]
DATABASE_URL=[jouw waarde]

PAYLOAD_SECRET=[maak een random string, bijv: klik24xopjekeyboard]

ANTHROPIC_API_KEY=[jouw waarde]
ELEVENLABS_API_KEY=[jouw waarde]
OPENAI_API_KEY=[jouw waarde]

STRIPE_SECRET_KEY=[jouw waarde]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[jouw waarde]

STRIPE_PRICE_FAMILY_1=[jouw waarde]
STRIPE_PRICE_FAMILY_2=[jouw waarde]
STRIPE_PRICE_FAMILY_3=[jouw waarde]
STRIPE_PRICE_SCHOOL_CLASS=[jouw waarde]
STRIPE_PRICE_SCHOOL_UNLIMITED=[jouw waarde]
```

3. **Nu** klik op "Deploy"
4. Wacht 2-3 minuten tot de deployment klaar is
5. Je krijgt een URL zoals `kosmi-abc123.vercel.app`

### Vercel Blob Storage Activeren

1. Ga naar je project in Vercel
2. Klik op "Storage"
3. Klik op "Create Database"
4. Kies "Blob"
5. Geef een naam: `kosmi-media`
6. Klik op "Create"
7. De `BLOB_READ_WRITE_TOKEN` wordt automatisch toegevoegd

### App URL Instellen

1. Ga naar je project → Settings → Environment Variables
2. Voeg toe:
```
NEXT_PUBLIC_APP_URL=https://jouw-project-naam.vercel.app
```
3. Klik op "Save"
4. Ga naar "Deployments" en klik op de "..." bij de laatste deployment
5. Klik op "Redeploy"

---

## Stap 8: Stripe Webhook Instellen

1. **Ga naar [dashboard.stripe.com](https://dashboard.stripe.com)**
2. Klik op "Developers" → "Webhooks"
3. Klik op "+ Add endpoint"
4. Vul in:
   - Endpoint URL: `https://jouw-project-naam.vercel.app/api/stripe/webhook`
   - Listen to: Events on your account
5. Klik op "Select events"
6. Zoek en selecteer:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
7. Klik op "Add events"
8. Klik op "Add endpoint"
9. Klik op je nieuwe endpoint
10. Scroll naar "Signing secret"
11. Klik op "Reveal" en kopieer de waarde
12. Ga naar Vercel → Settings → Environment Variables
13. Voeg toe: `STRIPE_WEBHOOK_SECRET=[waarde die je zojuist kopieerde]`
14. Redeploy je app

---

## Stap 9: Test Je App

1. Ga naar je Vercel URL
2. Klik op "Registreren"
3. Maak een test account aan
4. Je wordt doorgestuurd naar Stripe checkout
5. Gebruik een test kaart: `4242 4242 4242 4242`
   - Vervaldatum: elke datum in de toekomst (bijv. 12/34)
   - CVC: elk 3-cijferig nummer (bijv. 123)
   - Postcode: 1234AB

Als alles werkt zie je nu je dashboard!

---

## Stap 10: Admin Panel Setup

1. Ga naar `https://jouw-project-naam.vercel.app/admin`
2. Maak een admin account aan
3. Maak test content aan:
   - Worlds (werelden)
   - Topics (onderwerpen)
   - Courses (cursussen)
   - Lessons (lessen)
   - Characters (karakters)

---

## Problemen Oplossen

### Deployment faalt

- Check of alle environment variables correct zijn ingevuld
- Kijk naar de logs in Vercel → Deployments → [jouw deployment] → View Function Logs

### Database errors

- Controleer of je het schema.sql hebt uitgevoerd in Supabase
- Check of de DATABASE_URL correct is (inclusief wachtwoord)

### Stripe webhook werkt niet

- Controleer of de webhook URL exact klopt
- Kijk of de STRIPE_WEBHOOK_SECRET goed is ingevuld
- Redeploy je app na het toevoegen van de webhook secret

### AI APIs werken niet

- Check of je API keys geldig zijn
- Controleer of je credit hebt op je AI provider accounts

---

## Klaar! 🎉

Je Kosmi app is nu live en klaar voor gebruik. Deel de URL met je eerste gebruikers!

Voor verdere vragen of hulp, check de README.md of neem contact op met de founder.
