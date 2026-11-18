
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { ResultSetHeader } from "mysql2";

export async function POST(request: NextRequest) {
  const connection = await pool.getConnection();

  try {
    const body = await request.json();

    const {
      name,
      email,
      phone,
      password,
      role,
      ngoName,
      ngoType,
      registrationNumber,
    } = body;

    if (!name || !email || !phone || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Please fill all required fields." },
        { status: 400 }
      );
    }

    if (!["Volunteer", "NGO"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid registration role." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must contain at least 8 characters." },
        { status: 400 }
      );
    }

    if (
      role === "NGO" &&
      (!ngoName || !ngoType || !registrationNumber)
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide all required NGO details." },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    const [existingUsers] = await connection.execute(
      "SELECT user_id FROM `USER` WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    if ((existingUsers as any[]).length > 0) {
      await connection.rollback();

      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    if (role === "NGO") {
      const [existingNGOs] = await connection.execute(
        "SELECT ngo_id FROM NGO WHERE registration_number = ?",
        [registrationNumber.trim()]
      );

      if ((existingNGOs as any[]).length > 0) {
        await connection.rollback();

        return NextResponse.json(
          { success: false, message: "This NGO registration number is already registered." },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [userResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO \`USER\`
       (name, email, password, phone, role)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        phone.trim(),
        role,
      ]
    );

    const userId = userResult.insertId;

    if (role === "Volunteer") {
      await connection.execute(
        "INSERT INTO VOLUNTEER (user_id) VALUES (?)",
        [userId]
      );
    } else {
      await connection.execute(
        `INSERT INTO NGO
         (user_id, ngo_name, ngo_type, registration_number, email, contact_number)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          ngoName.trim(),
          ngoType.trim(),
          registrationNumber.trim(),
          email.trim().toLowerCase(),
          phone.trim(),
        ]
      );
    }

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: `${role} account created successfully!`,
        userId,
        role,
      },
      { status: 201 }
    );
  } catch (error: any) {
    await connection.rollback();

    console.error("Registration API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Registration failed. Please check your details and try again.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
