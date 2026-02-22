import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      slug: 'worlds',
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          admin: {
            description: 'Unieke URL-vriendelijke naam (bijv. "de-natuur")',
          },
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'coverImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'published',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Alleen gepubliceerde werelden zijn zichtbaar voor leerlingen',
          },
        },
      ],
    },
    {
      slug: 'topics',
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
        },
        {
          name: 'world',
          type: 'relationship',
          relationTo: 'worlds',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'coverImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'published',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      slug: 'courses',
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
        },
        {
          name: 'topic',
          type: 'relationship',
          relationTo: 'topics',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'targetGroepMin',
          type: 'number',
          min: 1,
          max: 8,
          admin: {
            description: 'Minimale groep (bijv. 3)',
          },
        },
        {
          name: 'targetGroepMax',
          type: 'number',
          min: 1,
          max: 8,
          admin: {
            description: 'Maximale groep (bijv. 6)',
          },
        },
        {
          name: 'published',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      slug: 'lessons',
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'course',
          type: 'relationship',
          relationTo: 'courses',
          required: true,
        },
        {
          name: 'order',
          type: 'number',
          required: true,
          admin: {
            description: 'Volgorde binnen de cursus (bijv. 1, 2, 3)',
          },
        },
        {
          name: 'characters',
          type: 'relationship',
          relationTo: 'characters',
          hasMany: true,
          admin: {
            description: 'Karakters die beschikbaar zijn tijdens deze les',
          },
        },
        {
          name: 'variants',
          type: 'array',
          admin: {
            description: 'Verschillende versies van deze les per groepniveau',
          },
          fields: [
            {
              name: 'targetGroep',
              type: 'number',
              min: 1,
              max: 8,
              required: true,
              admin: {
                description: 'Voor welke groep is deze variant (bijv. 3)',
              },
            },
            {
              name: 'introText',
              type: 'textarea',
              admin: {
                description: 'Inleiding die voorgelezen wordt',
              },
            },
            {
              name: 'coreContent',
              type: 'richText',
              editor: lexicalEditor({}),
              admin: {
                description: 'De hoofdinhoud van de les',
              },
            },
            {
              name: 'coreImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'coreImageCredit',
              type: 'text',
              admin: {
                description: 'Bronvermelding voor de afbeelding',
              },
            },
            {
              name: 'depthContent',
              type: 'richText',
              editor: lexicalEditor({}),
              admin: {
                description: 'Extra verdieping (alleen getoond als kind ervoor kiest)',
              },
            },
            {
              name: 'depthImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'depthImageCredit',
              type: 'text',
            },
            {
              name: 'reflectionQuestion',
              type: 'text',
              admin: {
                description: 'Reflectievraag aan het einde',
              },
            },
            {
              name: 'pointsBase',
              type: 'number',
              defaultValue: 100,
              admin: {
                description: 'Punten voor voltooien van de basiscontent',
              },
            },
            {
              name: 'pointsDepthBonus',
              type: 'number',
              defaultValue: 50,
              admin: {
                description: 'Extra punten voor verdieping',
              },
            },
          ],
        },
      ],
    },
    {
      slug: 'characters',
      admin: {
        useAsTitle: 'name',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
        },
        {
          name: 'world',
          type: 'relationship',
          relationTo: 'worlds',
          required: true,
        },
        {
          name: 'personaDescription',
          type: 'textarea',
          admin: {
            description: 'Korte beschrijving van het karakter (zichtbaar voor leerlingen)',
          },
        },
        {
          name: 'toneGuide',
          type: 'textarea',
          admin: {
            description: 'Hoe praat dit karakter? (bijv. vriendelijk, enthousiast, rustig)',
          },
        },
        {
          name: 'knowledgeScope',
          type: 'textarea',
          admin: {
            description: 'Komma-gescheiden lijst van onderwerpen waar dit karakter over kan praten',
          },
        },
        {
          name: 'offTopicRedirect',
          type: 'text',
          admin: {
            description: 'Wat zegt het karakter als een vraag buiten het kennisgebied valt?',
          },
        },
        {
          name: 'elevenLabsVoiceId',
          type: 'text',
          admin: {
            description: 'Voice ID uit ElevenLabs dashboard (bijv. "21m00Tcm4TlvDq8ikWAM")',
          },
        },
        {
          name: 'systemPrompt',
          type: 'textarea',
          admin: {
            description: 'Volledige instructies voor de AI. NOOIT naar de client sturen!',
            rows: 10,
          },
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      slug: 'media',
      upload: {
        staticDir: path.resolve(dirname, '../media'),
      },
      fields: [
        {
          name: 'alt',
          type: 'text',
        },
      ],
    },
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    // Sync schema automatically on startup instead of running migrations at build time.
    // Safe for new projects; replace with "payload migrate" workflow once data exists.
    push: true,
  }),
  plugins: [
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            enabled: true,
            collections: {
              media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
})
