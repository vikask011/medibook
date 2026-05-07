import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  jwt.verify(token, process.env.JWT_SECRET!)
  const { id } = await params
  const { status } = await req.json()
  try {
    const appointment = await prisma.appointment.update({ where: { id }, data: { status } })

    // When doctor marks appointment as completed, notify the patient to leave a review
    if (status === 'completed') {
      await prisma.notification.create({
        data: {
          userId: appointment.patientId,
          message: `Your appointment is complete! Please leave a review for your doctor.`,
          type: 'review_request',
        },
      })
    }

    return NextResponse.json({ appointment })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}