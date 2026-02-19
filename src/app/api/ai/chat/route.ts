import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getPayload } from 'payload'
import config from '@/payload.config'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const {
      characterId,
      message,
      studentGroep,
      studentDisplayName,
      conversationHistory = [],
    } = await request.json()

    if (!characterId || !message || !studentGroep || !studentDisplayName) {
      return NextResponse.json(
        { error: 'Ontbrekende verplichte velden' },
        { status: 400 }
      )
    }

    // Haal karakter op uit Payload
    const payload = await getPayload({ config })
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
    })

    if (!character) {
      return NextResponse.json(
        { error: 'Karakter niet gevonden' },
        { status: 404 }
      )
    }

    // Bouw system prompt
    const systemPrompt = `${character.systemPrompt}

De leerling heet ${studentDisplayName} en zit in groep ${studentGroep}.
Pas je taalgebruik aan op dit niveau.
Blijf binnen je kennisgebied: ${character.knowledgeScope}.
Bij vragen buiten je kennisgebied zeg je: "${character.offTopicRedirect}"
Spreek de leerling aan bij naam waar dat natuurlijk voelt.
Antwoord altijd in het Nederlands.
Maximaal 3 zinnen per antwoord.`

    // Roep Claude aan
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      system: systemPrompt,
      messages: [
        ...conversationHistory.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: message },
      ],
    })

    const textContent = response.content[0]
    const responseText = textContent.type === 'text' ? textContent.text : ''

    return NextResponse.json({ response: responseText })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
