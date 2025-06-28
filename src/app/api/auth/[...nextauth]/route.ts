import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import UserModel from "@/server/models/UserModel";

interface ExtendedUser {
   id: string;
   email: string;
   name: string;
   image?: string | null;
   provider?: string;
}

export const authOptions: NextAuthOptions = {
   providers: [
      GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID as string,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      }),
      CredentialsProvider({
         name: "credentials",
         credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
         },
         async authorize(credentials) {
            try {
               if (!credentials?.email || !credentials?.password) {
                  return null;
               }

               const token = await UserModel.login({
                  email: credentials.email,
                  password: credentials.password,
               });

               // Get user info for the session
               const collection = UserModel.getCollection();
               const user = await collection.findOne({
                  email: credentials.email,
               });

               if (user && token) {
                  return {
                     id: user._id.toString(),
                     email: user.email,
                     name: user.name,
                     image: user.profilePicture || null,
                  };
               }
               return null;
            } catch (error) {
               console.error("Auth error:", error);
               return null;
            }
         },
      }),
   ],
   session: {
      strategy: "jwt",
   },
   callbacks: {
      async jwt({ token, user, account }) {
         if (user) {
            token.id = user.id;
         }
         // Store the provider type for unified logout
         if (account) {
            token.provider = account.provider;
         }
         return token;
      },
      async session({ session, token }) {
         if (session.user) {
            const extendedUser = session.user as ExtendedUser;
            extendedUser.id = token.id as string;
            extendedUser.provider = token.provider as string;
         }
         return session;
      },
   },
   pages: {
      signIn: "/login",
   },
   secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
