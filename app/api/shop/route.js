import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function POST(request) {
  try {
    const formData = await request.formData()

    // Extract fields from formData
    const userId = formData.get('userId')
    const shopName = formData.get('shopName')
    const shopImage = formData.get('shopImage') // File object
    const shopPrice = parseFloat(formData.get('price') || '0')
    const description = formData.get('description') || ''
    const bgColor = formData.get('bgColor') || '#ffffff'

    // Validate required fields
    if (!userId || !shopName || !shopImage) {
      return NextResponse.json(
        { error: 'userId, shopName, and shopImage are required' },
        { status: 400 }
      )
    }

    const parsedUserId = Number(userId)
    if (isNaN(parsedUserId)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 })
    }

    // Handle image upload
    const fileName = `${Date.now()}-${shopImage.name}`
    const buffer = Buffer.from(await shopImage.arrayBuffer())

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    const filePath = path.join(uploadDir, fileName)

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    fs.writeFileSync(filePath, buffer)

    const relativeImagePath = `/uploads/${fileName}`

    // Check if shop already exists for this user
    const existingShop = await prisma.shop.findUnique({
      where: { userId: parsedUserId }
    })

    let shop
    if (existingShop) {
      // Update shop
      shop = await prisma.shop.update({
        where: { userId: parsedUserId },
        data: {
          name: shopName,
          image: relativeImagePath,
          description,
          backgroundColor: bgColor,
          price: shopPrice,
        },
      })
    } else {
      // Create shop
      shop = await prisma.shop.create({
        data: {
          userId: parsedUserId,
          name: shopName,
          image: relativeImagePath,
          description,
          backgroundColor: bgColor,
          price: shopPrice,
        },
      })
    }

    return NextResponse.json({
      message: existingShop ? 'Shop updated successfully!' : 'Shop created successfully!',
      shop,
    })
  } catch (error) {
    console.error('Error creating or updating shop:', error)
    return NextResponse.json(
      { error: 'Failed to create or update shop: ' + error.message },
      { status: 500 }
    )
  }
}
