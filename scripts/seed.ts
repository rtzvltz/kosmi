/**
 * Seed script voor Kosmi
 * Run met: npx tsx scripts/seed.ts
 *
 * Vereist: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *           PAYLOAD_ADMIN_EMAIL, PAYLOAD_ADMIN_PASSWORD,
 *           NEXT_PUBLIC_APP_URL (bijv. https://jouw-app.vercel.app)
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
const ADMIN_EMAIL = process.env.PAYLOAD_ADMIN_EMAIL || 'admin@kosmi.nl'
const ADMIN_PASSWORD = process.env.PAYLOAD_ADMIN_PASSWORD || ''

// Helper: maak Lexical richText JSON
function richText(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text, version: 1 }],
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// Helper: POST naar Payload API
async function payloadPost(token: string, collection: string, data: object) {
  const res = await fetch(`${APP_URL}/api/${collection}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(data),
  })
  const json = await res.json() as any
  if (!res.ok) {
    console.error(`Fout bij aanmaken ${collection}:`, JSON.stringify(json))
    throw new Error(`Payload fout: ${res.status}`)
  }
  return json.doc || json
}

async function loginPayload(): Promise<string> {
  const res = await fetch(`${APP_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  const json = await res.json() as any
  if (!res.ok || !json.token) {
    console.error('Payload login mislukt. Controleer PAYLOAD_ADMIN_EMAIL en PAYLOAD_ADMIN_PASSWORD.')
    console.error(JSON.stringify(json))
    process.exit(1)
  }
  return json.token
}

async function main() {
  console.log('🌱 Kosmi seed gestart...')
  console.log(`   App URL: ${APP_URL}`)

  // ── PAYLOAD LOGIN ────────────────────────────────────────────────
  console.log('\n🔑 Inloggen bij Payload CMS...')
  const token = await loginPayload()
  console.log('✅ Ingelogd bij Payload')

  // ── WERELDEN ─────────────────────────────────────────────────────
  console.log('\n🌍 Werelden aanmaken...')

  const wereldNatuur = await payloadPost(token, 'worlds', {
    title: 'De Natuur',
    slug: 'de-natuur',
    description: 'Ontdek planten, dieren, het weer en alles wat leeft om ons heen.',
    published: true,
  })
  console.log(`✅ Wereld: ${wereldNatuur.title}`)

  const wereldGeschiedenis = await payloadPost(token, 'worlds', {
    title: 'De Geschiedenis',
    slug: 'de-geschiedenis',
    description: 'Reis terug in de tijd en ontdek hoe mensen vroeger leefden.',
    published: true,
  })
  console.log(`✅ Wereld: ${wereldGeschiedenis.title}`)

  const wereldLichaam = await payloadPost(token, 'worlds', {
    title: 'Het Menselijk Lichaam',
    slug: 'het-menselijk-lichaam',
    description: 'Ontdek hoe jouw lichaam werkt van je hersenen tot je tenen.',
    published: true,
  })
  console.log(`✅ Wereld: ${wereldLichaam.title}`)

  // ── KARAKTERS ─────────────────────────────────────────────────────
  console.log('\n🐞 Karakters aanmaken...')

  const kever = await payloadPost(token, 'characters', {
    name: 'Kever Karel',
    slug: 'kever-karel',
    world: wereldNatuur.id,
    personaDescription: 'Een nieuwsgierige kever die alles weet over de natuur.',
    toneGuide: 'Vrolijk, enthousiast, gebruikt eenvoudige woorden. Stelt zelf ook vragen.',
    knowledgeScope: 'dieren, planten, insecten, natuur, het bos, de tuin, de weide',
    offTopicRedirect: 'Hmm, dat weet ik niet zo goed — ik ben meer een natuur-expert! Vraag me iets over dieren of planten.',
    systemPrompt: `Je bent Kever Karel, een vrolijke en nieuwsgierige kever die in het bos woont.
Je weet heel veel over de natuur: dieren, planten, insecten, het bos en de tuin.
Je praat vriendelijk en enthousiast, en gebruikt eenvoudige woorden die kinderen begrijpen.
Je stelt soms zelf een vraagje terug om het gesprek leuk te houden.
Antwoord altijd in het Nederlands. Maximaal 3 zinnen per antwoord.
Bij vragen buiten je kennisgebied zeg je: "Hmm, dat weet ik niet zo goed — ik ben meer een natuur-expert!"`,
  })
  console.log(`✅ Karakter: ${kever.name}`)

  const ridder = await payloadPost(token, 'characters', {
    name: 'Ridder Roeland',
    slug: 'ridder-roeland',
    world: wereldGeschiedenis.id,
    personaDescription: 'Een dappere ridder uit de middeleeuwen die verhalen vertelt over vroeger.',
    toneGuide: 'Trots maar vriendelijk, vertelt graag verhalen, gebruikt soms oude woorden maar legt die uit.',
    knowledgeScope: 'ridders, kastelen, middeleeuwen, geschiedenis, koningen, oorlogen, vroeger',
    offTopicRedirect: 'Goede vraag, jonge reiziger! Maar dat valt buiten mijn kennis als ridder. Vraag me iets over de geschiedenis!',
    systemPrompt: `Je bent Ridder Roeland, een dappere ridder uit de middeleeuwen.
Je weet veel over de geschiedenis: ridders, kastelen, koningen, middeleeuwse gebruiken en het leven vroeger.
Je praat met trots maar bent vriendelijk voor kinderen. Je gebruikt soms oude woorden maar legt die uit.
Je vertelt graag kleine verhalen om dingen uit te leggen.
Antwoord altijd in het Nederlands. Maximaal 3 zinnen per antwoord.`,
  })
  console.log(`✅ Karakter: ${ridder.name}`)

  // ── TOPICS ───────────────────────────────────────────────────────
  console.log('\n📚 Topics aanmaken...')

  const topicInsecten = await payloadPost(token, 'topics', {
    title: 'Insecten',
    slug: 'insecten',
    world: wereldNatuur.id,
    description: 'Leer alles over de kleine beestjes die overal om ons heen leven.',
    published: true,
  })
  console.log(`✅ Topic: ${topicInsecten.title}`)

  const topicMiddeleeuwen = await payloadPost(token, 'topics', {
    title: 'De Middeleeuwen',
    slug: 'de-middeleeuwen',
    world: wereldGeschiedenis.id,
    description: 'Ontdek hoe mensen leefden in de tijd van ridders en kastelen.',
    published: true,
  })
  console.log(`✅ Topic: ${topicMiddeleeuwen.title}`)

  const topicHersenen = await payloadPost(token, 'topics', {
    title: 'De Hersenen',
    slug: 'de-hersenen',
    world: wereldLichaam.id,
    description: 'Ontdek hoe jouw brein denkt, voelt en alles regelt.',
    published: true,
  })
  console.log(`✅ Topic: ${topicHersenen.title}`)

  // ── COURSES ──────────────────────────────────────────────────────
  console.log('\n🎓 Cursussen aanmaken...')

  const cursusInsecten = await payloadPost(token, 'courses', {
    title: 'Kleine beestjes, grote wereld',
    slug: 'kleine-beestjes-grote-wereld',
    topic: topicInsecten.id,
    description: 'Een ontdekkingstocht door de wereld van insecten.',
    targetGroepMin: 1,
    targetGroepMax: 8,
    published: true,
  })
  console.log(`✅ Cursus: ${cursusInsecten.title}`)

  const cursusRidders = await payloadPost(token, 'courses', {
    title: 'Ridders en Kastelen',
    slug: 'ridders-en-kastelen',
    topic: topicMiddeleeuwen.id,
    description: 'Leer leven als een ridder in de middeleeuwen.',
    targetGroepMin: 2,
    targetGroepMax: 8,
    published: true,
  })
  console.log(`✅ Cursus: ${cursusRidders.title}`)

  const cursusHersenen = await payloadPost(token, 'courses', {
    title: 'Jouw brein aan het werk',
    slug: 'jouw-brein-aan-het-werk',
    topic: topicHersenen.id,
    description: 'Hoe denkt, onthoudt en voelt jouw brein?',
    targetGroepMin: 3,
    targetGroepMax: 8,
    published: true,
  })
  console.log(`✅ Cursus: ${cursusHersenen.title}`)

  // ── LESSEN ───────────────────────────────────────────────────────
  console.log('\n📖 Lessen aanmaken...')

  // Les 1: Wat is een insect?
  await payloadPost(token, 'lessons', {
    title: 'Wat is een insect?',
    course: cursusInsecten.id,
    order: 1,
    characters: [kever.id],
    variants: [
      {
        targetGroep: 3,
        introText: 'Hoi! Weet jij wat een insect is? Kever Karel legt het je uit!',
        coreContent: richText('Een insect heeft altijd zes poten en drie lichaamsdelen: een kop, een borststuk en een achterlijf. Bijen, vlinders en mieren zijn allemaal insecten. Er zijn meer dan een miljoen soorten insecten op aarde!'),
        depthContent: richText('Insecten hebben geen botten. In plaats daarvan hebben ze een hard omhulsel van buiten, dat een exoskelet heet. Wanneer een insect groeit, moet het dit omhulsel afwerpen en een nieuw maken — dat heet vervellen.'),
        reflectionQuestion: 'Welk insect vind jij het mooist? Waarom?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
      {
        targetGroep: 5,
        introText: 'Vandaag leer je wat een insect precies is en wat ze zo bijzonder maakt.',
        coreContent: richText('Insecten zijn geleedpotigen met zes poten, drie lichaamsdelen (kop, thorax, abdomen) en meestal twee paar vleugels. Ze zijn koudbloedig en leven bijna overal op aarde. Met meer dan een miljoen bekende soorten zijn ze de grootste diergroep op aarde.'),
        depthContent: richText('Insecten communiceren op fascinerende manieren. Bijen dansen om de richting van bloemen aan te geven. Vuurvliegjes gebruiken lichtflitsen om een partner te vinden. Mieren gebruiken feromonen — chemische stoffen — om paden te markeren voor hun nestgenoten.'),
        reflectionQuestion: 'Waarom denk jij dat er zo ontzettend veel soorten insecten zijn?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
      {
        targetGroep: 7,
        introText: 'Insecten zijn de meest soortenrijke diergroep op aarde. Maar wat maakt een dier tot een insect?',
        coreContent: richText('Insecten (klasse Insecta) zijn geleedpotigen met een gesegmenteerd lichaam: kop, thorax en abdomen. Ze hebben zes poten, vaak vleugels en een exoskelet van chitine. Ze zijn ectotherm (koudbloedig) en maken een metamorfose door: ei, larve, pop en imago.'),
        depthContent: richText('Insecten spelen een cruciale rol in ecosystemen als bestuivers, decomposers en als voedsel voor andere dieren. Zonder insectenbestuiving zouden de meeste bloemplanten en veel gewassen niet kunnen reproduceren. Door habitatverlies en pesticiden nemen insectenpopulaties wereldwijd dramatisch af.'),
        reflectionQuestion: 'Wat zouden de gevolgen zijn als alle insecten zouden uitsterven?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
    ],
  })
  console.log('✅ Les: Wat is een insect?')

  // Les 2: Het leven van een vlinder
  await payloadPost(token, 'lessons', {
    title: 'Het leven van een vlinder',
    course: cursusInsecten.id,
    order: 2,
    characters: [kever.id],
    variants: [
      {
        targetGroep: 3,
        introText: 'Een vlinder begint als een eitje. Maar hoe wordt hij zo mooi?',
        coreContent: richText('Een vlinder begint als een klein eitje. Daarna komt er een rups uit. De rups eet veel en groeit. Dan maakt de rups een cocon. En ten slotte komt er een prachtige vlinder uit!'),
        depthContent: richText('In de cocon verandert de rups helemaal. Zijn lichaam wordt vloeibaar en bouwt zich opnieuw op als vlinder. Dit heet metamorfose.'),
        reflectionQuestion: 'Als jij kon veranderen in een dier, welk dier zou dat zijn?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
      {
        targetGroep: 5,
        introText: 'Vlinders maken een bijzondere reis door het leven. Vandaag ontdek je hoe.',
        coreContent: richText('Een vlinder doorloopt vier levensfasen: ei, rups (larve), pop (chrysalis) en vlinder (imago). Dit proces heet volledige metamorfose. De rups eet veel om energie op te slaan voor de transformatie in de pop.'),
        depthContent: richText('Sommige vlinders trekken duizenden kilometers. De monarchvlinder vliegt elk jaar van Canada naar Mexico — een reis van meer dan 4000 kilometer. Ze navigeren aan de hand van de zon en het magneetveld van de aarde.'),
        reflectionQuestion: 'Waarom denk jij dat vlinders zo ver reizen?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
      {
        targetGroep: 7,
        introText: 'De metamorfose van een vlinder is een van de meest opmerkelijke processen in de natuur.',
        coreContent: richText('Vlinders ondergaan holometabole metamorfose: vier duidelijk onderscheiden stadia (ei, larve, pupa, imago). Tijdens de pupale fase worden de larvale weefsels grotendeels afgebroken via histolyse en herbouwd tot adulte structuren via histogenese — aangestuurd door hormonen als ecdyson en juveniel hormoon.'),
        depthContent: richText('Recent onderzoek toont aan dat vlinders herinneringen uit hun rupsstadium kunnen bewaren na de metamorfose. Dit suggereert dat het zenuwstelsel, ondanks de radicale reorganisatie, gedeeltelijk intact blijft — met grote implicaties voor ons begrip van geheugen en neuro-plasticiteit.'),
        reflectionQuestion: 'Hoe zou jij onderzoeken of een vlinder zich dingen herinnert uit zijn tijd als rups?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
    ],
  })
  console.log('✅ Les: Het leven van een vlinder')

  // Les 3: Wat is een ridder?
  await payloadPost(token, 'lessons', {
    title: 'Wie was een ridder?',
    course: cursusRidders.id,
    order: 1,
    characters: [ridder.id],
    variants: [
      {
        targetGroep: 3,
        introText: 'Ridder Roeland vertelt je over zijn leven als ridder!',
        coreContent: richText('Een ridder was een soldaat op een paard. Ridders droegen een zwaar harnas van metaal. Ze beschermden de mensen in het dorp. Een ridder moest dapper en eerlijk zijn.'),
        depthContent: richText('Jongens begonnen te oefenen als ze 7 jaar oud waren. Eerst waren ze een page, daarna een schildknaap. Als ze goed genoeg waren werden ze ridder geslagen door de koning.'),
        reflectionQuestion: 'Zou jij een ridder willen zijn? Waarom wel of niet?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
      {
        targetGroep: 5,
        introText: 'In de middeleeuwen waren ridders de soldaten van de koning. Maar hun leven was niet zo glamoureus als in sprookjes.',
        coreContent: richText('Ridders waren gepantserde ruiters die vochten voor hun heer of koning. Ze volgden een strenge erecode: de ridderlijkheid. Een ridder moest dapper, eerlijk, vroom en beschermend zijn tegenover zwakkeren. Training begon al op jonge leeftijd.'),
        depthContent: richText('Een harnas van volledig plaatstaal woog tussen de 15 en 25 kilo. Ondanks dit gewicht konden ridders er goed in bewegen. De kosten van een harnas waren enorm — vergelijkbaar met een sportwagen nu. Alleen adellijke families konden dit betalen.'),
        reflectionQuestion: 'Welke eigenschappen van een ridder vind jij nog steeds waardevol vandaag de dag?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
      {
        targetGroep: 7,
        introText: 'De ridderstand was een complexe sociale en militaire instelling in het feodale systeem.',
        coreContent: richText('Ridders vormden de zware cavalerie in het middeleeuwse feodale systeem. Ze ontvingen land (een leen) van hun heer in ruil voor militaire dienst. De ridderlijke erecode (chevalerie) combineerde christelijke waarden, loyaliteit en militaire deugden. Het ridderschap was exclusief: alleen adellijke zonen konden ridder worden na een jarenlange opleiding.'),
        depthContent: richText('De kruistochten (1096–1291) transformeerden het ridderideaal en leidden tot de vorming van ridderorden zoals de Tempeliers en de Johannieten. Deze orden combineerden monastieke en militaire functies en verwierven enorme politieke en economische macht — totdat de Franse koning Filips IV de Tempeliers in 1307 liet arresteren en hun bezittingen confisqueerde.'),
        reflectionQuestion: 'Hoe zorgde het feodale systeem er zowel voor dat ridders macht hadden als dat hun macht begrensd bleef?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
    ],
  })
  console.log('✅ Les: Wie was een ridder?')

  // Les 4: Kastelen
  await payloadPost(token, 'lessons', {
    title: 'Leven in een kasteel',
    course: cursusRidders.id,
    order: 2,
    characters: [ridder.id],
    variants: [
      {
        targetGroep: 3,
        introText: 'Hoe was het om in een kasteel te wonen?',
        coreContent: richText('Een kasteel was een grote sterke burcht van steen. Er woonde een ridder of een koning. Het kasteel had hoge muren en een slotgracht met water eromheen. Zo konden vijanden er moeilijk in komen.'),
        depthContent: richText('In een kasteel woonden veel mensen: de ridder en zijn familie, maar ook koks, soldaten, stalknechten en dienaren. Het was druk en rumoerig, en het rook er niet zo lekker!'),
        reflectionQuestion: 'Wat zou jij als eerste veranderen als jij in een kasteel woonde?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
      {
        targetGroep: 5,
        introText: 'Kastelen waren veel meer dan alleen maar een huis voor ridders.',
        coreContent: richText('Kastelen dienden als verdedigingswerk, woonplaats en machtscentrum tegelijk. Ze werden gebouwd op strategische plekken: op heuvels, bij rivieren of aan grenzen. De ontwikkeling ging van houten motte-and-bailey kastelen naar massieve stenen burchten met torens, ophaalbruggen en slotgrachten.'),
        depthContent: richText('Het dagelijks leven in een kasteel was niet luxueus. De meeste vertrekken waren koud en donker. Toiletten waren gaten in de muur die uitkwamen boven de slotgracht. Toch was de grote zaal 's avonds gezellig: er werd gezongen, gedanst en verteld door rondreizende dichters (troubadours).'),
        reflectionQuestion: 'Welke slimme verdedigingsconstructies zou jij zelf toevoegen aan een kasteel?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
      {
        targetGroep: 7,
        introText: 'Kasteelarchitectuur weerspiegelt de politieke en militaire ontwikkelingen van de middeleeuwen.',
        coreContent: richText('Middeleeuwse kastelen evolueerden van simpele houten palissaden (10e eeuw) naar complexe concentrische steenbouw (13e-14e eeuw). Elementen als machiolaties, schietgaten, valluiken en dubbele poortgebouwen (barbicans) weerspiegelen de wapenwedloop tussen aanval en verdediging. Met de introductie van buskruit en kanonnen (14e-15e eeuw) verloren kastelen hun militaire relevantie.'),
        depthContent: richText('De bouw van een groot kasteel kostte evenveel als het jaarinkomen van een koninkrijk. Edward I van Engeland gaf een fortuin uit aan zijn "ijzeren ring" van kastelen in Wales om de bevolking te onderdrukken na de verovering (1277-1295). Dit is een vroeg voorbeeld van architectuur als instrument van koloniale controle — een thema dat historici nog steeds bestuderen.'),
        reflectionQuestion: 'Op welke manieren gebruiken moderne overheden nog steeds gebouwen en ruimte als instrument van macht?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
    ],
  })
  console.log('✅ Les: Leven in een kasteel')

  // Les 5: De hersenen
  await payloadPost(token, 'lessons', {
    title: 'Wat doen je hersenen?',
    course: cursusHersenen.id,
    order: 1,
    characters: [],
    variants: [
      {
        targetGroep: 3,
        introText: 'Jouw hersenen zitten in je hoofd en regelen alles!',
        coreContent: richText('Je hersenen zijn als de baas van je lichaam. Ze vertellen je armen en benen wat ze moeten doen. Ze helpen je ook denken, voelen en dromen. Je hersenen werken zelfs als je slaapt!'),
        depthContent: richText('Je hersenen zijn verdeeld in twee helften: links en rechts. De linkerhelft regelt de rechterkant van je lichaam, en andersom. Heel bijzonder toch?'),
        reflectionQuestion: 'Wat zou er gebeuren als je hersenen even pauze namen?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
      {
        targetGroep: 5,
        introText: 'Je hersenen zijn het meest ingewikkelde orgaan van je lichaam. Maar hoe werken ze?',
        coreContent: richText('De hersenen bestaan uit miljarden zenuwcellen (neuronen) die met elkaar communiceren via elektrische signalen. Ze zijn verdeeld in gebieden met eigen functies: de grote hersenen voor denken en bewegen, de kleine hersenen voor balans, en de hersenstam voor basisfuncties zoals ademhaling.'),
        depthContent: richText('Slaap is cruciaal voor je hersenen. Tijdens diepe slaap worden herinneringen van korte naar lange termijn overgebracht. Het brein "reinigt" zichzelf ook: het glymfatisch systeem spoelt afvalstoffen weg die overdag ophopen. Slaaptekort leidt aantoonbaar tot slechtere concentratie en geheugen.'),
        reflectionQuestion: 'Hoe zou jij je hersenen kunnen trainen om beter te worden in iets?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
      {
        targetGroep: 7,
        introText: 'De menselijke hersenen zijn het meest complexe bekende object in het universum.',
        coreContent: richText('Het menselijk brein bevat ~86 miljard neuronen met ~100 biljoen synaptische verbindingen. De neocortex — sterk vergroot ten opzichte van andere zoogdieren — is verantwoordelijk voor hogere cognitieve functies: taal, abstract denken en bewustzijn. Neuroplasticiteit stelt het brein in staat zich gedurende het hele leven te reorganiseren als reactie op ervaring.'),
        depthContent: richText('Het "hard problem of consciousness" — waarom subjectieve ervaring (qualia) ontstaat uit fysieke hersenprocessen — is nog steeds onopgelost. Filosofen als David Chalmers betogen dat een volledig materialistische verklaring tekortschiet. Intussen tonen neuroimaging-studies dat bewuste beslissingen tot seconden vóór bewuste waarneming al in hersenactiviteit zijn terug te vinden (Libet-experimenten), wat vragen oproept over vrije wil.'),
        reflectionQuestion: 'Als bewustzijn volledig door hersenactiviteit wordt bepaald, wat betekent dat dan voor het idee van vrije wil?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
    ],
  })
  console.log('✅ Les: Wat doen je hersenen?')

  // Les 6: Geheugen
  await payloadPost(token, 'lessons', {
    title: 'Hoe werkt je geheugen?',
    course: cursusHersenen.id,
    order: 2,
    characters: [],
    variants: [
      {
        targetGroep: 3,
        introText: 'Hoe onthoud jij dingen? Je geheugen helpt je daarbij!',
        coreContent: richText('Je geheugen is als een grote bibliotheek in je hoofd. Dingen die je vaak doet, onthoudt je beter. Zoals fietsen: eerst was het moeilijk, maar nu gaat het vanzelf! Je brein heeft dat onthouden.'),
        depthContent: richText('Als je slaapt, sorteert je brein alles wat je die dag hebt geleerd. Daarom is goed slapen zo belangrijk als je iets nieuws leert!'),
        reflectionQuestion: 'Wat is het oudste wat jij je nog kunt herinneren?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
      {
        targetGroep: 5,
        introText: 'Jouw geheugen werkt op een slimmere manier dan je denkt.',
        coreContent: richText('Er zijn drie soorten geheugen: het sensorisch geheugen (seconden), het werkgeheugen (korte termijn, minuten) en het langetermijngeheugen. Informatie gaat van kort naar lang termijn door herhaling en koppeling aan emotie of betekenis. De hippocampus is het hersengebied dat hierbij centraal staat.'),
        depthContent: richText('De "vergeetcurve" van Hermann Ebbinghaus (1885) toont dat we 70% vergeten binnen 24 uur na leren — tenzij we herhalen. Gespreide herhaling (spaced repetition) is bewezen de meest effectieve leertechniek. Apps zoals Anki gebruiken dit principe.'),
        reflectionQuestion: 'Welke trucs gebruik jij om dingen te onthouden voor een proefwerk?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
      {
        targetGroep: 7,
        introText: 'Geheugen is geen opname maar een reconstructie — en dat heeft grote gevolgen.',
        coreContent: richText('Geheugenconsolidatie verloopt in twee fasen: synaptische consolidatie (uren) en systemische consolidatie (weken-jaren), waarbij herinneringen van de hippocampus naar de neocortex worden overgebracht. Herinneringen zijn niet statisch maar worden bij elke heractivering opnieuw opgeslagen (reconsolidatie), wat ze vatbaar maakt voor verandering.'),
        depthContent: richText('Elizabeth Loftus toonde aan dat valse herinneringen relatief eenvoudig kunnen worden geïmplanteerd door misleidende informatie na een gebeurtenis. Dit heeft grote implicaties voor ooggetuigenverklaringen in rechtszaken: meerdere veroordeelden die later vrijgesproken werden via DNA-bewijs, waren aanvankelijk veroordeeld op basis van zelfverzekerde maar onjuiste ooggetuigenverklaringen.'),
        reflectionQuestion: 'Als geheugen zo onbetrouwbaar is, hoe zouden rechtbanken dan moeten omgaan met ooggetuigenverklaringen?',
        pointsBase: 100,
        pointsDepthBonus: 50,
      },
    ],
  })
  console.log('✅ Les: Hoe werkt je geheugen?')

  // ── SUPABASE GEBRUIKERS ──────────────────────────────────────────
  console.log('\n👨‍👩‍👧‍👦 Supabase gebruikers aanmaken...')

  // Ouder
  const { data: parentAuth, error: parentAuthError } = await supabase.auth.admin.createUser({
    email: 'ouder@test.nl',
    password: 'test123456',
    email_confirm: true,
  })

  if (parentAuthError && !parentAuthError.message.includes('already been registered')) {
    console.error('Fout bij ouder aanmaken:', parentAuthError)
  } else if (parentAuth?.user) {
    await supabase.from('profiles').upsert({
      id: parentAuth.user.id,
      email: 'ouder@test.nl',
      name: 'Test Ouder',
      role: 'parent',
    })

    // Kinderen
    const kinderen = [
      { name: 'Emma', groep: 3, email: 'emma@test.nl' },
      { name: 'Lars', groep: 6, email: 'lars@test.nl' },
    ]

    for (const kind of kinderen) {
      const { data: childAuth } = await supabase.auth.admin.createUser({
        email: kind.email,
        password: 'test123456',
        email_confirm: true,
      })
      if (childAuth?.user) {
        await supabase.from('profiles').upsert({
          id: childAuth.user.id,
          name: kind.name,
          display_name: kind.name,
          role: 'student',
          groep: kind.groep,
          parent_id: parentAuth.user.id,
        })
        await supabase.from('parent_child_links').upsert({
          parent_id: parentAuth.user.id,
          child_id: childAuth.user.id,
        })
        console.log(`✅ Kind: ${kind.name} (groep ${kind.groep})`)
      }
    }
    console.log('✅ Ouder: ouder@test.nl / test123456')
  }

  // School
  const { data: school } = await supabase
    .from('schools')
    .insert({ name: 'Basisschool De Ontdekking', brin_code: '00AA00', city: 'Amsterdam' })
    .select()
    .single()

  if (school) {
    const { data: schoolAdminAuth } = await supabase.auth.admin.createUser({
      email: 'school@test.nl',
      password: 'test123456',
      email_confirm: true,
    })
    if (schoolAdminAuth?.user) {
      await supabase.from('profiles').upsert({
        id: schoolAdminAuth.user.id,
        email: 'school@test.nl',
        name: 'Juf Marieke',
        role: 'school_admin',
        school_id: school.id,
      })
    }
    await supabase.from('class_assignments').insert({
      school_id: school.id,
      class_label: 'Groep 5A',
      groep: 5,
    })
    console.log('✅ School: school@test.nl / test123456')
  }

  // ── KLAAR ────────────────────────────────────────────────────────
  console.log('\n🎉 Seed voltooid!')
  console.log('\nTest accounts:')
  console.log('  Ouder:  ouder@test.nl  / test123456')
  console.log('  Kind 1: Emma (groep 3) — emma@test.nl / test123456')
  console.log('  Kind 2: Lars (groep 6) — lars@test.nl / test123456')
  console.log('  School: school@test.nl / test123456')
  console.log('\nPayload content:')
  console.log('  3 werelden, 3 topics, 3 cursussen, 6 lessen, 2 karakters')
}

main().catch(console.error)
