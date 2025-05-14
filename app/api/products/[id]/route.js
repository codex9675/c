import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, context) {
  const { id } = context.params

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
