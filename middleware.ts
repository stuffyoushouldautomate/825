import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // No-op middleware: all auth logic is now in server components or API routes
  return Response.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 