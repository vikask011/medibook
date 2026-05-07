import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string }
  if (user.role !== 'patient') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { slotId, doctorId, symptoms, paymentId } = await req.json()

    // check slot is still available
    const slot = await prisma.appointmentSlot.findUnique({
      where: { id: slotId },
    })

    if (!slot || slot.isBooked || slot.isBlocked) {
      return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 })
    }

    // create appointment + mark slot booked in a transaction
    const appointment = await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.create({
        data: {
          patientId: user.id,
          doctorId,
          slotId,
          symptoms,
          paymentId,
          paymentStatus: 'paid',
          status: 'pending',
        },
      })

      await tx.appointmentSlot.update({
        where: { id: slotId },
        data: { isBooked: true },
      })

      // create notification for doctor
      const doctor = await tx.doctorProfile.findUnique({
        where: { id: doctorId },
      })

      if (doctor) {
        await tx.notification.create({
          data: {
            userId: doctor.userId,
            message: 'You have a new appointment booking',
            type: 'new_appointment',
          },
        })
      }

      return appt
    })

    return NextResponse.json({ appointment })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string }

  try {
    const appointments = await prisma.appointment.findMany({
      where: user.role === 'patient'
        ? { patientId: user.id }
        : undefined,
      include: {
        slot: true,
        doctor: {
          include: { user: { select: { name: true } } },
        },
        patient: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}