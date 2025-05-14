import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';

// Handle GET request (fetch admin data)
export async function GET(request, { params }) {
  const { id } = params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        role: true,
        passwordExpires: true
      }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[GET /api/admins/[id]]', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch user' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Handle PUT request (update admin data)
export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const updateData = {};

  if (body.password) {
    const hashedPassword = await hash(body.password, 10);
    updateData.password = hashedPassword;
  }

  if (body.passwordExpires) {
    updateData.passwordExpires = new Date(body.passwordExpires);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        passwordExpires: true
      }
    });

    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[PUT /api/admins/[id]]', error);
    return new Response(JSON.stringify({ error: 'Failed to update admin' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
