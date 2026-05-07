import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

function getDoctor(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string }
  } catch {
    return null
  }
}

// get current templates
export async function GET(req: NextRequest) {
  const user = getDoctor(req)
  if (!user || user.role !== 'doctor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: user.id },
    include: { availabilityTemplates: true },
  })

  return NextResponse.json({ templates: profile?.availabilityTemplates || [] })
}

// save templates
export async function POST(req: NextRequest) {
  const user = getDoctor(req)
  if (!user || user.role !== 'doctor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { templates } = await req.json()

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: user.id },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // delete old templates and insert new ones
  await prisma.availabilityTemplate.deleteMany({
    where: { doctorId: profile.id },
  })

  await prisma.availabilityTemplate.createMany({
    data: templates.map((t: any) => ({
      doctorId: profile.id,
      dayOfWeek: t.dayOfWeek,
      startTime: t.startTime,
      endTime: t.endTime,
      slotDurationMins: t.slotDurationMins || 30,
    })),
  })

  return NextResponse.json({ message: 'Availability saved' })
}