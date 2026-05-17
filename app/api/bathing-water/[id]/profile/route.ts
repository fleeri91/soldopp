import { getBathingWaterProfile } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await getBathingWaterProfile(id);
  return NextResponse.json(data);
}
