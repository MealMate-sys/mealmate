import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') ?? '/plan'

  if (code) {
    // Redirect to client-side handler that exchanges the code
    return NextResponse.redirect(
      `${origin}/auth/confirm?code=${code}&redirectTo=${redirectTo}`
    )
  }

  return NextResponse.redirect(`${origin}${redirectTo}`)
}
