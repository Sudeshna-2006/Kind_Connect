import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        DATABASE() AS databaseName,
        (
          SELECT COUNT(*)
          FROM information_schema.tables
          WHERE table_schema = DATABASE()
        ) AS tableCount
    `);

    return NextResponse.json({
      success: true,
      message: "MySQL connection successful!",
      data: rows,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not connect to MySQL. Check your configuration.",
      },
      { status: 500 }
    );
  }
}