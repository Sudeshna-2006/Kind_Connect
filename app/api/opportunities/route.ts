
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import pool from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

// GET: Fetch all open opportunities for volunteers
export async function GET() {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        o.opportunity_id,
        o.title,
        o.description,
        o.opportunity_type,
        o.location,
        o.start_date,
        o.end_date,
        o.volunteers_required,
        o.status,
        n.ngo_name
       FROM OPPORTUNITY o
       JOIN NGO n ON o.ngo_id = n.ngo_id
       WHERE o.status = 'Open'
       ORDER BY o.opportunity_id DESC`
    );

    return NextResponse.json({
      success: true,
      opportunities: rows,
    });
  } catch (error) {
    console.error("Fetch opportunities error:", error);

    return NextResponse.json(
      { success: false, message: "Could not fetch opportunities." },
      { status: 500 }
    );
  }
}

// POST: Allow authenticated NGOs to create opportunities
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kindconnect_token")?.value;
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    let payload;

    try {
      const verified = await jwtVerify(
        token,
        new TextEncoder().encode(secret)
      );
      payload = verified.payload;
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired login session." },
        { status: 401 }
      );
    }

    if (payload.role !== "NGO" || !payload.userId) {
      return NextResponse.json(
        { success: false, message: "Only NGOs can create opportunities." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      opportunityType,
      location,
      startDate,
      endDate,
      volunteersRequired,
    } = body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 150 ||
      typeof startDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      !Number.isInteger(Number(volunteersRequired)) ||
      Number(volunteersRequired) < 1
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide valid opportunity details." },
        { status: 400 }
      );
    }

    if (
      endDate &&
      (
        typeof endDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
        endDate < startDate
      )
    ) {
      return NextResponse.json(
        { success: false, message: "End date must be on or after the start date." },
        { status: 400 }
      );
    }

    const [ngoRows] = await pool.execute<RowDataPacket[]>(
      "SELECT ngo_id FROM NGO WHERE user_id = ?",
      [payload.userId]
    );

    if (ngoRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "NGO profile not found." },
        { status: 404 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO OPPORTUNITY
       (ngo_id, title, description, opportunity_type, location,
        start_date, end_date, volunteers_required, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Open')`,
      [
        ngoRows[0].ngo_id,
        title.trim(),
        description?.trim() || null,
        opportunityType?.trim() || null,
        location?.trim() || null,
        startDate,
        endDate || null,
        Number(volunteersRequired),
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Opportunity created successfully!",
        opportunityId: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Opportunity creation error:", error);

    return NextResponse.json(
      { success: false, message: "Could not create opportunity." },
      { status: 500 }
    );
  }
}
