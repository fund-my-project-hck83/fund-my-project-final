import UserModel from "@/server/models/UserModel";
import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export async function POST(request: NextRequest) {
   try {
      const { credential } = await request.json();

      if (!credential) {
         return NextResponse.json(
            { error: "No credential provided" },
            { status: 400 }
         );
      }
      const ticket = await client.verifyIdToken({
         idToken: credential,
         audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
         return NextResponse.json(
            { error: "Invalid Google token" },
            { status: 400 }
         );
      }
      const userData = {
         _id: payload.sub,
         email: payload.email,
         username: payload.name,
      };
      // Here you would typically check if the user exists in your database
      const collection = await UserModel.getCollection();
      let existingUser = await collection.findOne({ email: userData.email });
      if (!existingUser) {
         // If user does not exist, create a new user
         existingUser = await UserModel.register({
            ...userData,
            provider: "google",
            googleId: payload.sub,
         });
      }
      const jwtToken = jwt.sign(
         {
            _id: userData._id,
            email: userData.email,
            username: userData.username,
         },
         process.env.JWT_SECRET as string
      );
      return NextResponse.json({ access_token: jwtToken });
   } catch (error) {
      console.error("Google login error:", error);
      return NextResponse.json(
         { error: "Internal Server Error" },
         { status: 500 }
      );
   }
}
