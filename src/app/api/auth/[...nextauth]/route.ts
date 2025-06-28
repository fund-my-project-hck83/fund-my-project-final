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

const authOptions: NextAuthOptions = {
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
      async signIn({ user, account, profile }) {
         // Handle Google OAuth signup/signin
         if (account?.provider === "google" && user.email) {
            try {
               const collection = UserModel.getCollection();
               
               // Check if user already exists
               const existingUser = await collection.findOne({
                  email: user.email,
               });

               if (!existingUser) {
                  // Create new user for Google OAuth
                  const newUser = {
                     name: user.name || profile?.name || "Google User",
                     username: user.email.split('@')[0] || "googleuser",
                     email: user.email,
                     password: "", // Google users don't have password
                     profilePicture: user.image || undefined,
                     provider: "google",
                     googleId: profile?.sub || account.providerAccountId,
                     createdAt: new Date(),
                     updatedAt: new Date(),
                  };

                  const result = await collection.insertOne(newUser);
                  console.log("New Google user created:", result.insertedId);
               } else {
                  // Update existing user with Google info if needed
                  await collection.updateOne(
                     { email: user.email },
                     {
                        $set: {
                           profilePicture: user.image || existingUser.profilePicture,
                           updatedAt: new Date(),
                        },
                     }
                  );
                  console.log("Existing user updated with Google info");
               }

               return true;
            } catch (error) {
               console.error("Error saving Google user:", error);
               return false;
            }
         }

         // Allow credentials provider to continue
         return true;
      },
      async jwt({ token, user, account }) {
         if (user) {
            // For Google login, get the saved user from DB
            if (account?.provider === "google" && user.email) {
               try {
                  const collection = UserModel.getCollection();
                  const dbUser = await collection.findOne({
                     email: user.email,
                  });
                  
                  if (dbUser) {
                     token.id = dbUser._id.toString();
                     token.name = dbUser.name;
                     token.email = dbUser.email;
                     token.picture = dbUser.profilePicture;
                  }
               } catch (error) {
                  console.error("Error fetching user from DB:", error);
               }
            } else {
               // For credentials login
               token.id = user.id;
            }
         }
         
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
      signIn: "/",
   },
   secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
