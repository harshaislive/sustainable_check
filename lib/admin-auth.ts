import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export interface AdminSession {
  username: string
  isAdmin: true
  iat: number
  exp: number
}

// Verify admin credentials
export function verifyAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

// Create JWT token
export async function createAdminToken(username: string): Promise<string> {
  const token = await new SignJWT({ username, isAdmin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  return token
}

// Verify JWT token
export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    const payload = verified.payload
    if (payload && typeof payload.username === 'string' && typeof payload.isAdmin === 'boolean') {
      return payload as unknown as AdminSession
    }
    return null
  } catch (error) {
    return null
  }
}

// Get current admin session from cookies
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-token')?.value

  if (!token) {
    return null
  }

  return verifyAdminToken(token)
}

// Set admin token in cookie
export async function setAdminToken(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

// Clear admin token
export async function clearAdminToken() {
  const cookieStore = await cookies()
  cookieStore.delete('admin-token')
}

// Check if user is admin (for middleware)
export async function isAdmin(): Promise<boolean> {
  const session = await getAdminSession()
  return session !== null && session.isAdmin === true
}
