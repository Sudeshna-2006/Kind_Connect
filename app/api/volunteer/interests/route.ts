
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import clientPromise from "@/lib/mongodb";

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

export async function POST(request: NextRequest) {
  try {
    const userId = await getVolunteerUserId();
    const body = await request.json();

    const interests = body.interests;

    if (
      !Array.isArray(interests) ||
      interests.length === 0 ||
      interests.some(
        (item: unknown) =>
          typeof item !== "string" || !item.trim()
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Provide valid interests." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "kindconnect");

    await db.collection("volunteer_interests").updateOne(
      { userId },
      {
        $set: {
          interests: interests.map((item: string) => item.trim()),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Volunteer interests saved in MongoDB.",
    });
  } catch (error) {
    console.error("Save interests error:", error);

    return NextResponse.json(
      { success: false, message: "Could not save interests." },
      { status: 401 }
    );
  }
}

export async function GET() {
  try {
    const userId = await getVolunteerUserId();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "kindconnect");

    const profile = await db
      .collection("volunteer_interests")
      .findOne({ userId }, { projection: { _id: 0 } });

    return NextResponse.json({
      success: true,
      interests: profile?.interests || [],
    });
  } catch (error) {
    console.error("Get interests error:", error);

    return NextResponse.json(
      { success: false, message: "Could not retrieve interests." },
      { status: 401 }
    );
  }
}
