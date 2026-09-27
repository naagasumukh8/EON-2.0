import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { status: "misconfigured", error: "Missing SUPABASE env vars" },
      { status: 500 }
    );
  }

  try {
    // Ping Supabase auth endpoint — always returns 200 for valid projects
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      return NextResponse.json({
        status: "connected",
        supabase_url: url,
        message: "Supabase is reachable and responding",
        http: res.status,
        timestamp: new Date().toISOString(),
        env_check: {
          supabase_url: !!url,
          anon_key: !!key,
          service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
      });
    }

    return NextResponse.json({
      status: "degraded",
      http: res.status,
      message: "Supabase responded but not healthy",
    }, { status: 502 });

  } catch (err: any) {
    return NextResponse.json(
      { status: "unreachable", error: err.message },
      { status: 503 }
    );
  }
}
