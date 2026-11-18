
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "kindconnect");

    const collection = db.collection("mongodb_crud_test");

    // Create a temporary test document
    await collection.updateOne(
      { testId: "kindconnect-delete-test" },
      {
        $set: {
          message: "Temporary document for DELETE testing",
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Confirm that the document exists
    const beforeDelete = await collection.findOne({
      testId: "kindconnect-delete-test",
    });

    // Delete the temporary document
    const deleteResult = await collection.deleteOne({
      testId: "kindconnect-delete-test",
    });

    // Confirm that the document no longer exists
    const afterDelete = await collection.findOne({
      testId: "kindconnect-delete-test",
    });

    return NextResponse.json({
      success: true,
      created: !!beforeDelete,
      deleted: deleteResult.deletedCount === 1,
      existsAfterDelete: !!afterDelete,
      message: "MongoDB DELETE test completed.",
    });
  } catch (error) {
    console.error("MongoDB DELETE test error:", error);

    return NextResponse.json(
      { success: false, message: "MongoDB DELETE test failed." },
      { status: 500 }
    );
  }
}
