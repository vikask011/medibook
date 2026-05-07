import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3 } from '@/lib/s3'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    jwt.verify(token, process.env.JWT_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  try {
    const { key } = await req.json()

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid key' }, { status: 400 })
    }

    // Prevent path traversal attacks
    if (key.includes('..') || key.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
    })

    // URL valid for 5 minutes — enough for a doctor to view the document
    const url = await getSignedUrl(s3, command, { expiresIn: 300 })

    return NextResponse.json({ url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate signed URL' }, { status: 500 })
  }
}