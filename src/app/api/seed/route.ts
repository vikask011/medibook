import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const existing = await prisma.user.findUnique({ where: { email: 'doctor@test.com' } })
    if (existing) return NextResponse.json({ message: 'Already seeded' })
    const passwordHash = await bcrypt.hash('123456', 10)
    const user = await prisma.user.create({
      data: {
        name: 'Rajesh Kumar', email: 'doctor@test.com', passwordHash, role: 'doctor',
        doctorProfile: { create: { specialization: 'Cardiologist', experienceYears: 10, consultationFee: 500, bio: 'Experienced cardiologist with 10+ years of practice in heart conditions.', isVerified: true, avgRating: 4.5 } }
      }
    })
    // Also seed a patient
    const pExists = await prisma.user.findUnique({ where: { email: 'patient@test.com' } })
    if (!pExists) {
      await prisma.user.create({ data: { name: 'Test Patient', email: 'patient@test.com', passwordHash, role: 'patient' } })
    }
    return NextResponse.json({ message: 'Seeded successfully', doctorEmail: 'doctor@test.com', patientEmail: 'patient@test.com', password: '123456' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
