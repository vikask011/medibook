import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

function timeToMins(t: string) { const [h, m] = t.split(':').map(Number); return h * 60 + m }
function minsToTime(m: number) { return `${Math.floor(m/60).toString().padStart(2,'0')}:${(m%60).toString().padStart(2,'0')}` }

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string }
  if (user.role !== 'doctor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: user.id }, include: { availabilityTemplates: true } })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (!profile.availabilityTemplates.length) return NextResponse.json({ error: 'No templates set' }, { status: 400 })

  const slots = []
  for (let i = 0; i < 30; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const template = profile.availabilityTemplates.find(t => t.dayOfWeek === d.getDay())
    if (!template) continue
    const slotDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0))
    const start = timeToMins(template.startTime)
    const end = timeToMins(template.endTime)
    for (let t = start; t + template.slotDurationMins <= end; t += template.slotDurationMins) {
      slots.push({ doctorId: profile.id, date: slotDate, startTime: minsToTime(t), endTime: minsToTime(t + template.slotDurationMins), isBooked: false, isBlocked: false })
    }
  }

  await prisma.appointmentSlot.deleteMany({ where: { doctorId: profile.id, isBooked: false, date: { gte: new Date() } } })
  await prisma.appointmentSlot.createMany({ data: slots })
  return NextResponse.json({ message: `Generated ${slots.length} slots` })
}
