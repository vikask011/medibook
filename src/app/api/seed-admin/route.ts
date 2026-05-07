import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const existing = await prisma.user.findUnique({ where: { email: 'admin@medibook.com' } })
    if (existing) return NextResponse.json({ message: 'Admin already exists' })
    const passwordHash = await bcrypt.hash('admin', 10)
    await prisma.user.create({ data: { name: 'Admin', email: 'admin@medibook.com', passwordHash, role: 'admin' } })
    return NextResponse.json({ message: 'Admin created', email: 'admin@medibook.com', password: 'admin' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
