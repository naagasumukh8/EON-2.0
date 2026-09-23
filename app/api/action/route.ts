import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "EON 2.0 × Google Opal Runtime",
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    engine: "Next.js App Router Serverless",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      prompt = "Standard Hackathon Task",
      workflow = "Autonomous Decision Node",
    } = body;

    // Simulate multi-step node execution
    const nodesExecuted = [
      {
        id: "node_1",
        label: "Input Ingestion",
        status: "completed",
        output: prompt,
      },
      {
        id: "node_2",
        label: "Opal Systems Reasoner",
        status: "completed",
        reasoning: "Classified valence, priority score: 94%, matched decision tree.",
      },
      {
        id: "node_3",
        label: "Action Dispatch",
        status: "completed",
        result: `Action executed successfully for: "${prompt.slice(0, 40)}${prompt.length > 40 ? "..." : ""}"`,
      },
    ];

    return NextResponse.json({
      success: true,
      workflow,
      inputPrompt: prompt,
      timestamp: new Date().toISOString(),
      nodes: nodesExecuted,
      finalVerdict: "Verified & Executed (0ms Mock / Serverless)",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
