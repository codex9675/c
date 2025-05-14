import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  const products = await prisma.product.findMany({
    where: { userId: parseInt(userId) },
    include: {
      user: {
        select: {
          profileLink: true
        }
      }
    }
  })

  return NextResponse.json(products)
}

export async function POST(request) {
  const formData = await request.formData()
  const username = formData.get('username')
  const imageFile = formData.get('image')

  // Validate
  if (!username || !imageFile) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { profileLink: username }
  })

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  // Handle file upload
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  const filename = `${Date.now()}-${imageFile.name}`
  const filePath = path.join(uploadsDir, filename)
  const fileBuffer = await imageFile.arrayBuffer()
  fs.writeFileSync(filePath, Buffer.from(fileBuffer))

  // Create product
  const product = await prisma.product.create({
    data: {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      image: filename,
      userId: user.id
    }
  })

  return NextResponse.json(product)
}