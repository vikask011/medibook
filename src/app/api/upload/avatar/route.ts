import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string }
  try {
    const { avatarUrl } = await req.json()
    await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } })
    return NextResponse.json({ message: 'Avatar updated' })
  } catch {
    return NextResponse.json({ error: 'Failed to update avatar' }, { status: 500 })
  }
}
