import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export async function GET(request, context) {
  const { path: segments } = context.params

  if (!segments || !Array.isArray(segments)) {
    return NextResponse.json({ error: 'Invalid image path' }, { status: 400 })
  }

  const filePath = path.join(process.cwd(), 'public', 'uploads', ...segments)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  const fileBuffer = fs.readFileSync(filePath)
  const ext = path.extname(filePath).toLowerCase()
  const mimeType = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  }[ext] || 'application/octet-stream'

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: { 'Content-Type': mimeType },
  })
}
