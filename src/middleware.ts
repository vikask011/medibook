import { NextRequest, NextResponse } from 'next/server'

const patientRoutes = ['/dashboard', '/book', '/appointments', '/notifications', '/profile']
const doctorRoutes = ['/doctor']
const adminRoutes = ['/admin']

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const { pathname } = req.nextUrl
  const isPatient = patientRoutes.some(r => pathname.startsWith(r))
  const isDoctor = doctorRoutes.some(r => pathname.startsWith(r))
  const isAdmin = adminRoutes.some(r => pathname.startsWith(r))
  if (!isPatient && !isDoctor && !isAdmin) return NextResponse.next()
  if (!token) return NextResponse.redirect(new URL('/login', req.url))
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/book/:path*', '/appointments/:path*', '/notifications/:path*', '/profile/:path*', '/doctor/:path*', '/admin/:path*'],
}
