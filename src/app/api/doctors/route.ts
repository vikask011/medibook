import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const specialization = searchParams.get('specialization')
    const search = searchParams.get('search')

    const doctors = await prisma.doctorProfile.findMany({
      where: {
        isVerified: true,
        ...(specialization && { specialization }),
        ...(search && {
          OR: [
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { specialization: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { avgRating: 'desc' },
    })

    return NextResponse.json({ doctors })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}