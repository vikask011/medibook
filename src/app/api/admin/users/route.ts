import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return false
  try { const d = jwt.verify(token, process.env.JWT_SECRET!) as { role: string }; return d.role === 'admin' } catch { return false }
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const users = await prisma.user.findMany({ where: { role: 'patient' }, select: { id: true, name: true, email: true, phone: true, createdAt: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ users })
}
