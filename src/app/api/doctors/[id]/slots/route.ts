import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function timeToMins(t: string) { const [h, m] = t.split(':').map(Number); return h * 60 + m }
function minsToTime(m: number) { return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}` }

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get('date') // "YYYY-MM-DD"

    if (!dateParam) return NextResponse.json({ error: 'date query param required' }, { status: 400 })

    // Parse the date and build UTC day range to match how slots are stored
    const [year, month, day] = dateParam.split('-').map(Number)
    const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
    const dayEnd   = new Date(Date.UTC(year, month - 1, day, 23, 59, 59))

    // Check if this doctor has existing slots for this date in DB
    const existing = await prisma.appointmentSlot.findMany({
      where: {
        doctorId: id,
        date: { gte: dayStart, lte: dayEnd },
        isBooked: false,
        isBlocked: false,
      },
      orderBy: { startTime: 'asc' },
    })

    if (existing.length > 0) {
      return NextResponse.json({ slots: existing })
    }

    // No pre-generated slots found — auto-generate on the fly from templates
    const profile = await prisma.doctorProfile.findUnique({
      where: { id },
      include: { availabilityTemplates: true },
    })

    if (!profile || !profile.availabilityTemplates.length) {
      return NextResponse.json({ slots: [] })
    }

    const requestedDate = new Date(dayStart)
    const dayOfWeek = requestedDate.getUTCDay()
    const template = profile.availabilityTemplates.find(t => t.dayOfWeek === dayOfWeek)

    if (!template) return NextResponse.json({ slots: [] })

    // Generate slots for this specific day and persist them
    const start = timeToMins(template.startTime)
    const end   = timeToMins(template.endTime)
    const slotsToCreate = []

    for (let t = start; t + template.slotDurationMins <= end; t += template.slotDurationMins) {
      slotsToCreate.push({
        doctorId: id,
        date: dayStart,
        startTime: minsToTime(t),
        endTime: minsToTime(t + template.slotDurationMins),
        isBooked: false,
        isBlocked: false,
      })
    }

    if (slotsToCreate.length === 0) return NextResponse.json({ slots: [] })

    await prisma.appointmentSlot.createMany({ data: slotsToCreate, skipDuplicates: true })

    // Fetch freshly created slots so IDs are included
    const created = await prisma.appointmentSlot.findMany({
      where: {
        doctorId: id,
        date: { gte: dayStart, lte: dayEnd },
        isBooked: false,
        isBlocked: false,
      },
      orderBy: { startTime: 'asc' },
    })

    return NextResponse.json({ slots: created })
  } catch (error) {
    console.error('Slots fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}