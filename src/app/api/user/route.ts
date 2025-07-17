import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const username = request.headers.get("x-user-username");
    const userId = request.headers.get("x-user-id");

    if (!username || !userId) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({
      user: {
        username,
        userId,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
