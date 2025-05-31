// app/api/portfolio/[username]/products/[id]/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { username, id } = params
    const productId = parseInt(id)

    // Validate product ID
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      )
    }

    // Find user first to verify existence
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, shopName: true, portfolioColor: true, storeImage: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: `User ${username} not found` },
        { status: 404 }
      )
    }

    // Find product with images
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: user.id
      },
      include: {
        productImages: {
          orderBy: { createdAt: 'desc' },
          take: 4 // Limit to 4 images
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: `Product ${id} not found for ${username}` },
        { status: 404 }
      )
    }

    // Prepare response
    const response = {
      ...product,
      shopName: user.shopName,
      portfolioColor: user.portfolioColor,
      storeImage: user.storeImage,
      images: product.productImages
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}