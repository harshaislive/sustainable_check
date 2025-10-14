import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip API routes - they handle their own authentication
  if (pathname.startsWith('/api/admin/')) {
    return NextResponse.next()
  }

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verify token
    const session = await verifyAdminToken(token)
    if (!session) {
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin-token')
      return response
    }
  }

  // Redirect from /admin to /admin/dashboard if logged in
  if (pathname === '/admin' || pathname === '/admin/') {
    const token = request.cookies.get('admin-token')?.value
    if (token) {
      const session = await verifyAdminToken(token)
      if (session) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    }
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
