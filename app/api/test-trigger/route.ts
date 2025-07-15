import { client } from "@/trigger";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Send a test event to trigger the sample job
    await client.sendEvent({
      name: "sample.event",
      payload: {
        message: "Test event from API",
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event sent successfully",
    });
  } catch (error) {
    console.error("Error sending event:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send event",
      },
      { status: 500 }
    );
  }
} 