import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify<{
      _id: string;
      email: string;
      username: string;
    }>(token, secret);

    return NextResponse.json({
      _id: payload._id,
      email: payload.email,
      name: payload.username,
    });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
