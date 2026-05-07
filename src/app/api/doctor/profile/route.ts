import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

function getUser(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  try { return jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string } } catch { return null }
}

export async function GET(req: NextRequest) {
  const user = getUser(req)
  if (!user || user.role !== 'doctor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const profile = await prisma.doctorProfile.findUnique({ where: { userId: user.id }, include: { user: { select: { name: true, email: true, phone: true, avatarUrl: true } } } })
  return NextResponse.json({ profile })
}

export async function PUT(req: NextRequest) {
  const user = getUser(req)
  if (!user || user.role !== 'doctor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { specialization, experienceYears, consultationFee, bio, name, phone } = await req.json()
  await prisma.user.update({ where: { id: user.id }, data: { name, phone } })
  const profile = await prisma.doctorProfile.update({ where: { userId: user.id }, data: { specialization, experienceYears: Number(experienceYears), consultationFee: Number(consultationFee), bio } })
  return NextResponse.json({ profile })
}
