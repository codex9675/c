// app/api/products/[id]/images/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function GET(request, { params }) {
  try {
    const productImages = await prisma.productImage.findMany({
      where: { productId: parseInt(params.id) },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(productImages)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch product images' },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image')
    const productId = parseInt(params.id)

    // Validate image file
    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file size (1MB limit)
    if (imageFile.size > 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size must be less than 1MB' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Save file
    const filename = `product-${productId}-${Date.now()}${path.extname(imageFile.name)}`
    const filePath = path.join(uploadsDir, filename)
    const fileBuffer = await imageFile.arrayBuffer()
    fs.writeFileSync(filePath, Buffer.from(fileBuffer))

    // Create database record
    const productImage = await prisma.productImage.create({
      data: {
        filename,
        productId
      }
    })

    return NextResponse.json(productImage)
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}