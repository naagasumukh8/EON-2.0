import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "EON-2.0 Backend Runtime",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action = "default_ping", payload = "" } = body;

    return NextResponse.json({
      success: true,
      actionExecuted: action,
      receivedPayload: payload,
      executionTimestamp: new Date().toISOString(),
      message: "Backend response successfully returned to frontend.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
