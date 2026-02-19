import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kosmi - Leerplatform voor nieuwsgierige kinderen',
  description: 'Ontdek werelden, praat met karakters en leer door nieuwsgierig te zijn',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  )
}
