import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

function getUser(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  try { return jwt.verify(token, process.env.JWT_SECRET!) as { id: string } } catch { return null }
}

export async function GET(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, phone: true, avatarUrl: true, age: true, gender: true, bloodGroup: true, address: true }
  })
  return NextResponse.json({ profile })
}

export async function PUT(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, phone, age, gender, bloodGroup, address } = await req.json()
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name, phone, age: age ? parseInt(age) : null, gender, bloodGroup, address }
  })
  return NextResponse.json({ profile: updated })
}
