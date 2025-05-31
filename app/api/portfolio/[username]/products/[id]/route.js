import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { username, id } = params;
    const position = parseInt(id);

    // Validate input parameters
    if (!username || !id || isNaN(position) || position < 1) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    await prisma.$connect();

    // Get product IDs with null checks
    const productIds = await prisma.product.findMany({
      where: {
        user: {
          username: username,
        },
      },
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
      },
    });

    if (!productIds || productIds.length === 0) {
      return NextResponse.json(
        { error: "No products found for this user" },
        { status: 404 }
      );
    }

    if (position > productIds.length) {
      return NextResponse.json(
        { error: "Position exceeds total product count" },
        { status: 404 }
      );
    }

    // Get product with all relations
    const product = await prisma.product.findUnique({
      where: {
        id: productIds[position - 1]?.id,
      },
      include: {
        user: {
          select: {
            username: true,
            shopName: true,
            portfolioColor: true,
            description: true,
          },
        },
        images: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Enhanced image path formatting with null checks
    const formatImagePath = (path) => {
      if (!path) return "/default-product.png";
      return path.startsWith("/") ? path : `/${path}`;
    };

    // Safe data transformation
    const responseData = {
      ...product,
      image: formatImagePath(product.image),
      images: product.images?.map((img) => ({
        ...img,
        path: formatImagePath(img.path || img.filename),
        url: formatImagePath(img.path || img.filename),
      })) || [],
      position: position,
      totalProducts: productIds.length,
      user: product.user || null,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect().catch(e => console.error("Prisma disconnect error:", e));
  }
}