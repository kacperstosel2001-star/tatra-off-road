import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const REWRITE_FLAG = 'x-tatra-locale-rewrite'

/**
 * Public URLs:
 *   PL → `/`, `/cennik` (no prefix)
 *   EN → `/en`, `/en/cennik`
 *
 * Internally rewritten to `app/[lang]` (`/pl/...`).
 * Flag header prevents rewrite↔redirect loop.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Internal rewrite pass — never redirect
  if (request.headers.get(REWRITE_FLAG) === '1') {
    return NextResponse.next()
  }

  // Legacy DE → EN
  if (pathname === '/de' || pathname.startsWith('/de/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/de/, '/en') || '/en'
    return NextResponse.redirect(url, 301)
  }

  // English
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return NextResponse.next()
  }

  // Public hit on /pl/... → SEO redirect to bare path
  if (pathname === '/pl' || pathname.startsWith('/pl/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/pl/, '') || '/'
    return NextResponse.redirect(url, 301)
  }

  // Polish public URL → rewrite to /pl/...
  const rewritePath = pathname === '/' ? '/pl' : `/pl${pathname}`
  const url = new URL(`${rewritePath}${request.nextUrl.search}`, request.url)
  const headers = new Headers(request.headers)
  headers.set(REWRITE_FLAG, '1')
  return NextResponse.rewrite(url, { request: { headers } })
}

export const config = {
  matcher: ['/((?!admin|api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
