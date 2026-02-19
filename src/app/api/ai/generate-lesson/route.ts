import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { topic, groepLevels, worldId } = await request.json()

    if (!topic || !groepLevels || !Array.isArray(groepLevels)) {
      return NextResponse.json(
        { error: 'Topic en groepLevels (array) zijn verplicht' },
        { status: 400 }
      )
    }

    // Genereer voor elk groepniveau een variant
    const variants = []

    for (const groep of groepLevels) {
      const prompt = `Genereer lesinhoud over "${topic}" voor een Nederlands kind in groep ${groep} (leeftijd ${4 + groep} jaar).

Maak het op maat voor dit niveau:
- Groep 1-2: heel simpel, korte zinnen, concrete voorbeelden
- Groep 3-4: iets uitgebreider, begin van lezen
- Groep 5-6: meer diepgang, eerste abstracte concepten
- Groep 7-8: complexere uitleg, kritisch denken

Lever JSON terug met deze structuur:
{
  "introText": "Korte introductie (1-2 zinnen) die voorgelezen wordt",
  "coreContent": "Hoofdtekst in HTML formaat, educatief en boeiend, 2-3 paragrafen",
  "depthContent": "Extra verdieping voor nieuwsgierige kinderen, 1-2 paragrafen",
  "reflectionQuestion": "Een open vraag die nadenken stimuleert",
  "pointsBase": 100,
  "pointsDepthBonus": 50
}

Gebruik simpele HTML tags zoals <p>, <strong>, <em>.`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const textContent = response.content[0]
      if (textContent.type !== 'text') {
        throw new Error('Unexpected response type')
      }

      // Parse JSON uit response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Geen JSON gevonden in response')
      }

      const variantData = JSON.parse(jsonMatch[0])
      variants.push({
        targetGroep: groep,
        ...variantData,
      })
    }

    return NextResponse.json({ variants })
  } catch (error: any) {
    console.error('Generate lesson API error:', error)
    return NextResponse.json(
      { error: error.message || 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
