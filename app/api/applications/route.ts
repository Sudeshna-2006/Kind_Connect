
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import pool from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

async function getVolunteerId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kindconnect_token")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    throw new Error("UNAUTHORIZED");
  }

  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(secret)
  );

  if (payload.role !== "Volunteer" || !payload.userId) {
    throw new Error("FORBIDDEN");
  }

  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT volunteer_id FROM VOLUNTEER WHERE user_id = ?",
    [payload.userId]
  );

  if (rows.length === 0) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  return rows[0].volunteer_id as number;
}

// GET: View applications submitted by the logged-in volunteer
export async function GET() {
  try {
    const volunteerId = await getVolunteerId();

    const [applications] = await pool.execute<RowDataPacket[]>(
      `SELECT
        a.application_id,
        a.opportunity_id,
        a.application_date,
        a.status,
        a.message,
        o.title,
        o.location,
        o.opportunity_type,
        n.ngo_name
       FROM APPLICATION a
       JOIN OPPORTUNITY o
         ON a.opportunity_id = o.opportunity_id
       JOIN NGO n
         ON o.ngo_id = n.ngo_id
       WHERE a.volunteer_id = ?
       ORDER BY a.application_id DESC`,
      [volunteerId]
    );

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Fetch applications error:", error);

    const message = error instanceof Error ? error.message : "";

    const status =
      message === "UNAUTHORIZED" ? 401 :
      message === "FORBIDDEN" ? 403 :
      message === "PROFILE_NOT_FOUND" ? 404 : 500;

    return NextResponse.json(
      { success: false, message: "Could not fetch applications." },
      { status }
    );
  }
}

// POST: Apply for an opportunity
export async function POST(request: NextRequest) {
  try {
    const volunteerId = await getVolunteerId();
    const body = await request.json();

    const opportunityId = Number(body.opportunityId);
    const applicationMessage =
      typeof body.message === "string" ? body.message.trim() : "";

    if (
      !Number.isInteger(opportunityId) ||
      opportunityId < 1
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid opportunity ID." },
        { status: 400 }
      );
    }

    // Check that the opportunity exists and is open
    const [opportunities] = await pool.execute<RowDataPacket[]>(
      `SELECT opportunity_id
       FROM OPPORTUNITY
       WHERE opportunity_id = ? AND status = 'Open'`,
      [opportunityId]
    );

    if (opportunities.length === 0) {
      return NextResponse.json(
        { success: false, message: "This opportunity is unavailable." },
        { status: 404 }
      );
    }

    // Prevent duplicate applications
    const [existing] = await pool.execute<RowDataPacket[]>(
      `SELECT application_id
       FROM APPLICATION
       WHERE volunteer_id = ? AND opportunity_id = ?`,
      [volunteerId, opportunityId]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "You have already applied for this opportunity." },
        { status: 409 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO APPLICATION
       (volunteer_id, opportunity_id, message)
       VALUES (?, ?, ?)`,
      [
        volunteerId,
        opportunityId,
        applicationMessage || null,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully!",
        applicationId: result.insertId,
        status: "Pending",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit application error:", error);

    const message = error instanceof Error ? error.message : "";

    const status =
      message === "UNAUTHORIZED" ? 401 :
      message === "FORBIDDEN" ? 403 :
      message === "PROFILE_NOT_FOUND" ? 404 : 500;

    return NextResponse.json(
      {
        success: false,
        message: "Could not submit application. Please try again.",
      },
      { status }
    );
  }
}
