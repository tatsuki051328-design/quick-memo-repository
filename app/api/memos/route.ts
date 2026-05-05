import { NextRequest, NextResponse } from "next/server";
import { createMemo, addMomentLog, CreateMemoInput } from "@/lib/notion";

export async function POST(req: NextRequest) {
  try {
    const body: CreateMemoInput & { body?: string } = await req.json();

    if (body.category === "diary") {
      if (!body.body?.trim()) {
        return NextResponse.json({ error: "Moment text is required" }, { status: 400 });
      }
      await addMomentLog(body.body.trim());
    } else {
      if (!body.title?.trim()) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
      }
      await createMemo(body);
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create memo" }, { status: 500 });
  }
}
