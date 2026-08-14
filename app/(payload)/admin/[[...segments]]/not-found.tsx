/* THIS FILE WAS GENERATED FOR PAYLOAD CMS. */
import type { Metadata } from 'next'

import config from '@payload-config'
import { NotFoundPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments?: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

async function normalizeParams(params: Args['params']) {
  const resolved = await params
  return { segments: resolved?.segments ?? [] }
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({
    config,
    params: normalizeParams(params),
    searchParams,
  })

const NotFound = ({ params, searchParams }: Args) =>
  NotFoundPage({
    config,
    params: normalizeParams(params),
    searchParams,
    importMap,
  })

export default NotFound
