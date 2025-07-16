import { addUserToTable } from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Add user to the users table
      await addUserToTable(data.user.id, data.user.email!, {
        full_name: data.user.user_metadata?.full_name,
        avatar_url: data.user.user_metadata?.avatar_url
      })

      // Handle the specific callback URL for production
      const isProduction = process.env.NODE_ENV === 'production'
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // Local development - use origin
        return NextResponse.redirect(`${origin}${next}`)
      } else if (isProduction) {
        // Production - redirect to the specific domain
        return NextResponse.redirect(`https://825chat.datapilotplus.com${next}`)
      } else {
        // Other environments - use forwarded host if available
        const forwardedHost = request.headers.get('x-forwarded-host')
        if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}
