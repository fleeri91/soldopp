import { getBathingWaters } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await getBathingWaters();
  return NextResponse.json(data);
}
