import { NextResponse } from 'next/server'
import { verifyAdminCredentials, createAdminToken, setAdminToken } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Validate credentials
    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = await createAdminToken(username)

    // Set token in httpOnly cookie
    await setAdminToken(token)

    return NextResponse.json({
      success: true,
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
