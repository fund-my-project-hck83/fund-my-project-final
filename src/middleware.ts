import { cookies } from "next/headers";
import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";
import { errorHandler } from "./server/helper/errorHandler";

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // SECTION 1: PUBLIC ROUTES - Allow access without authentication
    // These routes don't require authentication and should be accessible to everyone
    if (
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/api/login") ||
      pathname.startsWith("/api/register") ||
      pathname.startsWith("/api/googleLogin")
    ) {
      return NextResponse.next();
    }

    // SECTION 2: API ROUTE AUTHENTICATION
    // For all other API routes, check if user is authenticated
    if (pathname.includes("api")) {
      // Get the access token from cookies
      const cookieStore = await cookies();
      const token = cookieStore.get("access_token");
      
      if (token) {
        // SECTION 3: TOKEN VERIFICATION
        // Verify the JWT token and extract user information
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jose.jwtVerify<{
          _id: string;
          email: string;
          username: string;
        }>(token.value, secret);
        
        // SECTION 4: ADD USER CONTEXT TO REQUEST
        // Add user information to request headers so API routes can access it
        const requestHeaders = new Headers(request.headers);
        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        
        // Set custom headers with user information for downstream API routes
        response.headers.set("x-user-id", payload._id);
        response.headers.set("x-user-email", payload.email);
        response.headers.set("x-user-username", payload.username);
        
        return response;
      }
    }
    
    // SECTION 5: DEFAULT BEHAVIOR
    // For non-API routes or when no token is present, continue with the request
    return NextResponse.next();
  } catch (error) {
    // SECTION 6: ERROR HANDLING
    // Handle any errors that occur during middleware execution
    const { message, status } = errorHandler(error);
    return Response.json({ message }, { status });
  }
}
