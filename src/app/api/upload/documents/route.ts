import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@/lib/s3'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let user: { id: string; role: string }
  try {
    user = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string }
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  if (user.role !== 'patient') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    if (files.length > 5) return NextResponse.json({ error: 'Max 5 files allowed' }, { status: 400 })

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    const maxSizeBytes = 10 * 1024 * 1024 // 10 MB per file

    const uploadPromises = files.map(async (file) => {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type not allowed: ${file.type}. Use PDF, JPG, or PNG.`)
      }
      if (file.size > maxSizeBytes) {
        throw new Error(`File too large: ${file.name}. Max size is 10MB.`)
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = file.name.split('.').pop()
      // Store only the S3 key — NOT the full URL
      const key = `appointments/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }))

      // Return only the key, not a full S3 URL
      return key
    })

    const keys = await Promise.all(uploadPromises)
    return NextResponse.json({ urls: keys })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}