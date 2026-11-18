
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import pool from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const [rows] = await pool.execute(
      `SELECT user_id, name, email, password, role
       FROM \`USER\`
       WHERE email = ?`,
      [email.trim().toLowerCase()]
    );

    const users = rows as {
      user_id: number;
      name: string;
      email: string;
      password: string;
      role: string;
    }[];

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const user = users[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = await new SignJWT({
      userId: user.user_id,
      role: user.role,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(new TextEncoder().encode(secret));

    const response = NextResponse.json({
      success: true,
      message: "Login successful!",
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("kindconnect_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
