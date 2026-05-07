import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return false
  try { const d = jwt.verify(token, process.env.JWT_SECRET!) as { role: string }; return d.role === 'admin' } catch { return false }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { verified } = await req.json()
  await prisma.doctorProfile.update({ where: { id }, data: { isVerified: verified } })
  return NextResponse.json({ message: verified ? 'Doctor verified' : 'Doctor unverified' })
}
