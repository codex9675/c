import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

const ALLOWED_PLANS = ["BASIC", "PROFESSIONAL", "ENTERPRISE"];

// GET all admins
export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
        plan: {
          in: ALLOWED_PLANS,
        },
      },
      select: {
        id: true,
        username: true,
        role: true,
        plan: true,
        profileLink: true,
        passwordExpires: true,
        createdAt: true,
        themeColor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 }
    );
  }
}

// POST create a new admin
export async function POST(request) {
  try {
    const body = await request.json();
    let { username, password, passwordExpires, plan, portfolioUrl } = body;

    if (!username || !password || !passwordExpires) {
      return NextResponse.json(
        { error: "Username, password, and expiration date are required" },
        { status: 400 }
      );
    }

    plan = (plan || "BASIC").toUpperCase();
    if (!ALLOWED_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: `Invalid plan. Must be one of: ${ALLOWED_PLANS.join(", ")}` },
        { status: 400 }
      );
    }

    const generateProfileLink = (username) =>
      username
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");

    const profileLink = portfolioUrl || generateProfileLink(username);

    const existingUser = await prisma.user.findFirst({
      where: {
        profileLink,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Portfolio URL already in use" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: "ADMIN",
        plan,
        profileLink,
        passwordExpires: new Date(passwordExpires),
        themeColor: "#ffffff",
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        username: user.username,
        plan: user.plan,
        profileLink: user.profileLink,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin" },
      { status: 500 }
    );
  }
}

// DELETE an admin
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Admin ID is required" },
        { status: 400 }
      );
    }

    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid admin ID" }, { status: 400 });
    }

    // Delete related products (if you have a Product model)
    await prisma.product.deleteMany({
      where: { userId: numericId },
    });

    // Then delete the user
    await prisma.user.delete({
      where: { id: numericId },
    });

    return NextResponse.json({
      message: "Admin permanently deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to delete admin",
        details: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
