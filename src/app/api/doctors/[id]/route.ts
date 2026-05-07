import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, email: true } },
        reviews: { include: { patient: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })
    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    return NextResponse.json({ doctor })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
