import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);

    // Verify authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate product ID
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Verify product ownership
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        user: {
          id: session.user.id,
        },
      },
      include: {
        images: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or access denied" },
        { status: 404 }
      );
    }

    // Check maximum images (4 additional images)
    if (product.images.length >= 4) {
      return NextResponse.json(
        { error: "Maximum 4 additional images allowed" },
        { status: 400 }
      );
    }

    // Handle file upload
    const formData = await request.formData();
    const imageFile = formData.get("image");

    if (!imageFile || typeof imageFile === "string") {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { error: "Image size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExt = path.extname(imageFile.name);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${session.user.id}-${productId}-${uniqueSuffix}${fileExt}`;
    const filePath = path.join(uploadsDir, filename);

    // Save file to disk
    const fileBuffer = await imageFile.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(fileBuffer));

    // Save to database
    const imageRecord = await prisma.productImage.create({
      data: {
        filename: filename,
        path: `/uploads/${filename}`,
        productId: productId,
      },
    });

    return NextResponse.json({
      success: true,
      image: imageRecord,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
