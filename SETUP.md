# Kosmi — Opstartgids

Dit bestand is voor jou, niet voor Claude Code. Het legt uit wat je moet installeren, welke accounts je nodig hebt, en hoe je Claude Code opstart.

---

## Wat je nodig hebt — accounts aanmaken

Maak deze accounts aan voordat je begint. Alle gratis tiers zijn voldoende om te starten.

| Service | Waarvoor | Link |
|---|---|---|
| GitHub | Code opslaan en delen | github.com |
| Vercel | App online zetten | vercel.com |
| Supabase | Database en gebruikers | supabase.com |
| Anthropic | AI voor karakters en lessen | console.anthropic.com |
| ElevenLabs | Stemmen voor karakters | elevenlabs.io |
| OpenAI | Spraak-naar-tekst | platform.openai.com |
| Stripe | Betalingen | stripe.com |

Log bij Vercel en GitHub in met hetzelfde Google account — dat maakt de koppeling makkelijker.

---

## Wat je moet installeren op je computer

### 1. Node.js
Dit is de basis die de app nodig heeft om te draaien.

- Ga naar nodejs.org
- Download de versie met "LTS" erachter (dat is de stabiele versie)
- Installeer het zoals je elk programma installeert
- Check of het werkt: open Terminal en typ `node --version` — je ziet dan iets als `v20.11.0`

### 2. Claude Code
Dit is de AI-assistent die de app voor je bouwt.

- Open Terminal
- Typ dit commando en druk op Enter:
```
npm install -g @anthropic-ai/claude-code
```
- Wacht tot het klaar is
- Typ dan `claude --version` om te checken of het werkt

### 3. Git
Hiermee stuur je je code naar GitHub.

- Ga naar git-scm.com
- Download en installeer Git
- Check of het werkt: typ `git --version` in Terminal

---

## Terminal openen

**Op Mac:**
Druk Command + Spatie, typ "Terminal", druk Enter.

**Op Windows:**
Druk Windows-toets, typ "cmd" of "PowerShell", druk Enter.

---

## API keys ophalen

Elke service geeft je een geheime sleutel. Die plak je straks in een bestand. Hier staat per service waar je die vindt.

### Anthropic (Claude AI)
1. Ga naar console.anthropic.com
2. Log in
3. Klik linksboven op "API Keys"
4. Klik "Create Key"
5. Kopieer de sleutel — hij begint met `sk-ant-`

### ElevenLabs
1. Ga naar elevenlabs.io
2. Log in
3. Klik rechtsboven op je profielfoto → "Profile + API key"
4. Kopieer de API key

### OpenAI (voor Whisper spraakherkenning)
1. Ga naar platform.openai.com
2. Log in
3. Klik rechtsboven op je naam → "API keys"
4. Klik "Create new secret key"
5. Kopieer de sleutel — hij begint met `sk-`

### Supabase
1. Ga naar supabase.com
2. Maak een nieuw project aan — kies een naam (bijv. "kosmi") en een wachtwoord, sla dat wachtwoord op
3. Wacht tot het project is aangemaakt (duurt 1–2 minuten)
4. Ga naar Project Settings → API
5. Kopieer:
   - "Project URL" → dit is je `NEXT_PUBLIC_SUPABASE_URL`
   - "anon public" key → dit is je `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - "service_role" key → dit is je `SUPABASE_SERVICE_ROLE_KEY`
6. Ga naar Project Settings → Database → Connection string → kies "URI"
7. Kopieer die URL → dit is je `DATABASE_URL` (vervang `[YOUR-PASSWORD]` met het wachtwoord van stap 2)

### Stripe
1. Ga naar stripe.com
2. Maak een account aan
3. Je zit automatisch in "testmodus" — dit is prima voor nu
4. Ga naar Developers → API keys
5. Kopieer:
   - "Publishable key" → begint met `pk_test_`
   - "Secret key" → begint met `sk_test_`

---

## Project opstarten

### Stap 1 — Maak een projectmap aan

Open Terminal en typ:
```
mkdir kosmi
cd kosmi
```

### Stap 2 — Start Claude Code

Typ in Terminal (in de kosmi map):
```
claude
```

Claude Code opent nu. Je ziet een chat interface in je terminal.

### Stap 3 — Geef Claude Code de instructie

Kopieer dit en plak het in Claude Code:

```
Lees het bestand CLAUDE.md en bouw de Kosmi app volgens die instructies. Begin met:
1. Het project aanmaken met Next.js en Payload CMS
2. De Supabase tabellen aanmaken
3. De omgevingsvariabelen instellen

Geef me bij elke stap duidelijke instructies in gewone taal. Vertel me precies wat ik moet doen, welke commando's ik moet draaien, en waar ik dingen moet invullen. Ga ervan uit dat ik geen developer ben.
```

### Stap 4 — Volg de instructies van Claude Code

Claude Code begint te bouwen en vraagt je tussendoor om dingen te doen — zoals een waarde invullen of een commando uitvoeren. Doe wat hij vraagt.

---

## CLAUDE.md in het project zetten

Voordat je Claude Code start, moet het CLAUDE.md bestand in je projectmap staan. Kopieer het bestand naar de `kosmi` map die je in Stap 1 hebt aangemaakt.

---

## Als iets fout gaat

- Lees de foutmelding die Claude Code geeft — hij legt bijna altijd uit wat er mis is
- Kopieer de foutmelding en plak die terug in Claude Code met de vraag: "Wat moet ik doen om dit op te lossen?"
- Bij twijfel: vraag het gewoon in gewone taal

---

## Nadat de app gebouwd is

### App online zetten
Claude Code begeleidt je door de Vercel deploy. Die stappen staan ook in CLAUDE.md.

### Inloggen als admin
Ga naar `https://jouwapp.vercel.app/admin` en log in met het admin account dat tijdens de setup is aangemaakt.

### Testlink delen
Deel `https://jouwapp.vercel.app` met wie je de app wil laten testen. Ze kunnen zich registreren als ouder of school.

---

## Kosten om rekening mee te houden

Alle diensten hebben een gratis tier die ruim voldoende is voor testen. Pas als je echte gebruikers krijgt ga je betalen.

| Service | Gratis tier |
|---|---|
| Vercel | Gratis voor hobby projecten |
| Supabase | Gratis tot 500MB database |
| Anthropic | Eerste $5 gratis |
| ElevenLabs | 10.000 tekens per maand gratis |
| OpenAI | Eerste $5 gratis |
| Stripe | Gratis, betaalt 1.4% + €0.25 per transactie |

Zet bij Anthropic, ElevenLabs en OpenAI een uitgavenlimiet in — zo kun je nooit voor verrassingen komen te staan. Bij elk platform vind je dit onder "Billing" of "Usage limits".
