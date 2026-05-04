import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Discord webhook intake is temporarily disabled while the adapter dependency chain is being hardened for production builds.',
    },
    { status: 501 }
  )
}
