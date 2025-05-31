import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId || isNaN(parseInt(userId))) {
    return NextResponse.json(
      { error: 'Valid userId is required' },
      { status: 400 }
    )
  }

  try {
    const products = await prisma.product.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Fetch products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const username = formData.get('username')?.toString().trim()
    const name = formData.get('name')?.toString().trim()
    const description = formData.get('description')?.toString().trim() || ''
    const link = formData.get('link')?.toString().trim() || ''
    const price = formData.get('price')?.toString().trim()
    const imageFile = formData.get('image')

    // Validate required fields
    if (!username || !imageFile || !name || !price) {
      return NextResponse.json(
        { error: 'Username, name, price, and image are required' },
        { status: 400 }
      )
    }

    // Validate price
    const priceValue = parseFloat(price)
    if (isNaN(priceValue)) {
      return NextResponse.json(
        { error: 'Price must be a valid number' },
        { status: 400 }
      )
    }

    // Find user by username (profileLink)
    const user = await prisma.user.findUnique({
      where: { profileLink: username }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Validate image file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, JPG, PNG, and WebP images are allowed' },
        { status: 400 }
      )
    }

    if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json(
        { error: 'Image must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate unique sanitized filename
    const originalName = imageFile.name.replace(/[^a-zA-Z0-9-_.]/g, '')
    const extension = path.extname(originalName).toLowerCase()
    const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Write file to disk
    const filePath = path.join(uploadsDir, filename)
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    await fs.promises.writeFile(filePath, buffer)

    // Create product in database
    const product = await prisma.product.create({
      data: {
        name,
        description,
        link,
        price: priceValue,
        image: `/uploads/${filename}`, // Relative path
        userId: user.id,
        username: user.username
      }
    })

    return NextResponse.json(product, { status: 201 })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    )
  }
}
