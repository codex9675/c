import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const { username } = params;
    const session = await getServerSession(authOptions);

    // Verify session and ownership
    if (!session?.user || session.user.username !== username) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const productData = Object.fromEntries(formData);

    // Connect to database
    await prisma.$connect();

    // Create product linked to this user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        image: productData.image,
        userId: user.id
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload product' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}