import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "USER", // Only show regular users
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        products: {
          take: 2, // Get first 2 products
          orderBy: {
            createdAt: "desc", // Newest first
          },
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}