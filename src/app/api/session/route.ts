import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
   const tempToken = request.cookies.get('temp_token')?.value;
   
   if (tempToken) {
      // Clear the temporary cookie
      const response = NextResponse.json({ token: tempToken });
      response.cookies.delete('temp_token');
      return response;
   }
   
   return NextResponse.json({ error: 'No session found' }, { status: 401 });
}