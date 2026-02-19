import { generatePageMetadata } from '@payloadcms/next/utilities'
import config from '@/payload.config'
import { RootPage } from '@payloadcms/next/views'
import { Metadata } from 'next'

type Args = {
  params: {
    segments: string[]
  }
  searchParams: {
    [key: string]: string | string[]
  }
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, params, searchParams })

export default Page
