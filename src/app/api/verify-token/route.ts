import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
   try {
      const token = request.cookies.get('access_token')?.value;
      
      if (!token) {
         return NextResponse.json({ error: 'No token found' }, { status: 401 });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      
      return NextResponse.json({
         _id: decoded._id,
         email: decoded.email,
         name: decoded.username
      });
      
   } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
   }
}