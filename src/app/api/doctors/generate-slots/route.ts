import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string }
  if (user.role !== 'doctor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: user.id },
    include: { availabilityTemplates: true },
  })

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const templates = profile.availabilityTemplates
  if (templates.length === 0) return NextResponse.json({ error: 'No templates set' }, { status: 400 })

  // generate slots for next 30 days
  const slots = []
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const dayOfWeek = date.getDay()

    const template = templates.find(t => t.dayOfWeek === dayOfWeek)
    if (!template) continue

    const start = timeToMinutes(template.startTime)
    const end = timeToMinutes(template.endTime)
    const duration = template.slotDurationMins

    for (let time = start; time + duration <= end; time += duration) {
      slots.push({
        doctorId: profile.id,
        date: new Date(date.setHours(0, 0, 0, 0)),
        startTime: minutesToTime(time),
        endTime: minutesToTime(time + duration),
        isBooked: false,
        isBlocked: false,
      })
    }
  }

  // delete future unbooked slots and regenerate
  await prisma.appointmentSlot.deleteMany({
    where: {
      doctorId: profile.id,
      isBooked: false,
      date: { gte: new Date() },
    },
  })

  await prisma.appointmentSlot.createMany({ data: slots })

  return NextResponse.json({ message: `Generated ${slots.length} slots` })
}