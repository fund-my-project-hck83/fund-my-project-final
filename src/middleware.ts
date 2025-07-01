import { cookies } from "next/headers";
import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "./server/helper/errorHandler";

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Exclude public API routes from middleware
    if (
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/api/login") ||
      pathname.startsWith("/api/register") ||
      pathname.startsWith("/api/googleLogin")
    ) {
      return NextResponse.next();
    }

    if (pathname.includes("api")) {
      const cookieStore = await cookies();
      const token = cookieStore.get("access_token");
      if (token) {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jose.jwtVerify<{
          _id: string;
          email: string;
          username: string;
        }>(token.value, secret);
        const requestHeaders = new Headers(request.headers);
        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        response.headers.set("x-user-id", payload._id);
        response.headers.set("x-user-email", payload.email);
        response.headers.set("x-user-username", payload.username);
        return response;
      }
    }
    return NextResponse.next();
  } catch (error) {
    const { message, status } = errorHandler(error);
    return Response.json({ message }, { status });
  }
}
