import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // Verify admin exists
    const admin = await prisma.user.findUnique({
      where: { 
        id: parseInt(id),
        role: 'ADMIN' 
      }
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      )
    }

    // Delete admin
    await prisma.user.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete admin' },
      { status: 500 }
    )
  }
}