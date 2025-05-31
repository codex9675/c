import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;

    await prisma.$connect();

    // Get total count of users with products
    const total = await prisma.user.count({
      where: {
        products: {
          some: {},
        },
      },
    });

    // Calculate pagination values
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Fetch paginated users with their products
    const users = await prisma.user.findMany({
      where: {
        products: {
          some: {},
        },
      },
      select: {
        id: true,
        username: true,
        shopName: true, // This will be null if not set
        description: true,
        storeImage: true,
        portfolioColor: true,
         shop: {  // Include shop data if it exists
          select: {
            name: true,
            description: true,
            image: true,
            backgroundColor: true
          }
        },
        products: {
          take: 1,
          select: {
            id: true,
            image: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Format response with strict null preservation
    const formattedPortfolios = users.map((user) => {
      const shopName = user.shop?.name || user.shopName;
      const description = user.shop?.description || user.description;
      const coverImage =
        user.shop?.image || user.storeImage || user.products[0]?.image;
      return {
        id: user.id,
        username: user.username,
        shopName, // Will use shop.name if exists, otherwise user.shopName (may be null)
        description, // Will use shop.description if exists, otherwise user.description
        coverImage: coverImage
          ? coverImage.startsWith("/")
            ? coverImage
            : `/uploads/${coverImage}`
          : null,
        portfolioColor: user.shop?.backgroundColor || user.portfolioColor,
        hasProducts: user.products.length > 0,
        hasShop: !!user.shop, // Indicates if this user has a shop
      };
    });

    return NextResponse.json({
      data: formattedPortfolios,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolios" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
