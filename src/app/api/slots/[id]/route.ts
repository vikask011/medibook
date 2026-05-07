import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const slot = await prisma.appointmentSlot.findUnique({ where: { id } })
    if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    return NextResponse.json({ slot })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
