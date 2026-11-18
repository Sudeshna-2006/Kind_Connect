
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import pool from "@/lib/db";
import clientPromise from "@/lib/mongodb";
import { RowDataPacket } from "mysql2";

async function getVolunteerUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kindconnect_token")?.value;

  if (!token || !process.env.JWT_SECRET) {
    throw new Error("UNAUTHORIZED");
  }

  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(process.env.JWT_SECRET)
  );

  if (payload.role !== "Volunteer" || !payload.userId) {
    throw new Error("FORBIDDEN");
  }

  return Number(payload.userId);
}

export async function GET() {
  try {
    // 1. Get the logged-in volunteer
    const userId = await getVolunteerUserId();

    // 2. Fetch volunteer interests from MongoDB
    const mongoClient = await clientPromise;
    const db = mongoClient.db(
      process.env.MONGODB_DB || "kindconnect"
    );

    const profile = await db
      .collection("volunteer_interests")
      .findOne({ userId });

    const interests: string[] = profile?.interests || [];

    if (interests.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Please select your interests to receive recommendations.",
        recommendations: [],
      });
    }

    // 3. Fetch open opportunities from MySQL
    // Sort using opportunity_id because created_at does not exist.
    const [opportunities] = await pool.execute<RowDataPacket[]>(
      `SELECT
        o.opportunity_id,
        o.title,
        o.description,
        o.opportunity_type,
        o.location,
        o.start_date,
        o.end_date,
        o.volunteers_required,
        n.ngo_name
      FROM OPPORTUNITY o
      JOIN NGO n ON n.ngo_id = o.ngo_id
      WHERE o.status = 'Open'
      ORDER BY o.opportunity_id DESC`
    );

    // 4. Match opportunities with volunteer interests
    const recommendations = opportunities
      .map((opportunity) => {
        const searchableText = [
          opportunity.title,
          opportunity.description,
          opportunity.opportunity_type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchedInterests = interests.filter((interest) =>
          searchableText.includes(interest.toLowerCase())
        );

        const matchScore = Math.round(
          (matchedInterests.length / interests.length) * 100
        );

        return {
          ...opportunity,
          matchedInterests,
          matchScore,
        };
      })
      .filter((opportunity) => opportunity.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    // 5. Return recommendations
    return NextResponse.json({
      success: true,
      total: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error("Recommendation error:", error);

    const message =
      error instanceof Error ? error.message : "";

    const status =
      message === "UNAUTHORIZED"
        ? 401
        : message === "FORBIDDEN"
          ? 403
          : 500;

    return NextResponse.json(
      {
        success: false,
        message: "Could not generate recommendations.",
      },
      { status }
    );
  }
}
