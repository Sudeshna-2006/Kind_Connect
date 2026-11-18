import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import pool from "@/lib/db";

async function getNGOId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kindconnect_token")?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "NGO") return null;

    const [rows]: any = await pool.execute(
      "SELECT ngo_id FROM NGO WHERE user_id = ?",
      [payload.userId]
    );

    return rows.length ? rows[0].ngo_id : null;
  } catch {
    return null;
  }
}

// GET: View applications for this NGO's opportunities
export async function GET() {
  try {
    const ngoId = await getNGOId();

    if (!ngoId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [applications]: any = await pool.execute(
      `SELECT
        a.application_id,
        a.status,
        a.application_date,
        a.message,
        u.name AS volunteer_name,
        u.email AS volunteer_email,
        o.title AS opportunity_title
       FROM APPLICATION a
       JOIN VOLUNTEER v ON a.volunteer_id = v.volunteer_id
       JOIN \`USER\` u ON v.user_id = u.user_id
       JOIN OPPORTUNITY o ON a.opportunity_id = o.opportunity_id
       WHERE o.ngo_id = ?
       ORDER BY a.application_date DESC`,
      [ngoId]
    );

    return NextResponse.json({ success: true, applications });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Could not fetch applications" },
      { status: 500 }
    );
  }
}

// PATCH: Accept or reject an application
export async function PATCH(request: NextRequest) {
  try {
    const ngoId = await getNGOId();

    if (!ngoId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { applicationId, status } = await request.json();

    if (
      !applicationId ||
      !["Accepted", "Rejected"].includes(status)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid application details" },
        { status: 400 }
      );
    }

    const [result]: any = await pool.execute(
      `UPDATE APPLICATION a
       JOIN OPPORTUNITY o ON a.opportunity_id = o.opportunity_id
       SET a.status = ?
       WHERE a.application_id = ? AND o.ngo_id = ?`,
      [status, applicationId, ngoId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Could not update application" },
      { status: 500 }
    );
  }
}