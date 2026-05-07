import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

function getUser(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  try { return jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string } } catch { return null }
}

// POST /api/reviews — patient submits a review for a completed appointment
export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user || user.role !== 'patient') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { appointmentId, rating, comment } = await req.json()

  if (!appointmentId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  try {
    // Verify appointment belongs to this patient and is completed
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { reviews: true },
    })

    if (!appointment) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    if (appointment.patientId !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (appointment.status !== 'completed') return NextResponse.json({ error: 'Appointment not completed' }, { status: 400 })
    if (appointment.reviews.length > 0) return NextResponse.json({ error: 'Already reviewed' }, { status: 400 })

    // Create the review
    const review = await prisma.review.create({
      data: {
        appointmentId,
        patientId: user.id,
        doctorId: appointment.doctorId,
        rating,
        comment: comment || null,
      },
    })

    // Recalculate and update doctor's average rating
    const allReviews = await prisma.review.findMany({ where: { doctorId: appointment.doctorId } })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.doctorProfile.update({
      where: { id: appointment.doctorId },
      data: { avgRating },
    })

    // Notify the doctor
    const doctorProfile = await prisma.doctorProfile.findUnique({ where: { id: appointment.doctorId } })
    if (doctorProfile) {
      await prisma.notification.create({
        data: {
          userId: doctorProfile.userId,
          message: `You received a ${rating}-star review from a patient`,
          type: 'new_review',
        },
      })
    }

    return NextResponse.json({ review })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}