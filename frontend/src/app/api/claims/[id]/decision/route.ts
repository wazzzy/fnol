import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "adjuster") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { decision, notes, adjuster_id } = body;

  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

  const searchParams = new URLSearchParams({
    decision,
    adjuster_id: adjuster_id ?? session.user.id ?? "unknown",
    notes: notes ?? "",
  });

  const res = await fetch(
    `${backendUrl}/claims/${params.id}/decision?${searchParams.toString()}`,
    { method: "POST" }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
