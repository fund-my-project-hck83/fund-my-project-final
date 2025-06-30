import { z } from "zod";
import { getDb } from "../config/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import CustomError from "../helper/errorHandler";
export interface IRegister {
   name: string;
   username: string;
   email: string;
   password: string;
   profilePicture?: string;
   provider?: string;
   googleId?: string;
}

export interface ILogin {
   email: string;
   password: string;
}
export interface IUser {
   _id?: string;
   name: string;
   username: string;
   email: string;
   password: string;
   profilePicture?: string;
   provider?: string;
   googleId?: string;
   createdAt?: Date;
   updatedAt?: Date;
}
const userRegister = z.object({
   name: z.string().min(1, "Name is required"),
   username: z.string().min(1, "Username is required"),
   email: z.string().email("Invalid email format"),
   password: z.string().min(6, "Password must be at least 6 characters"),
   profilePicture: z.string().optional(),
});

export default class UserModel {
   static getCollection() {
      return getDb().collection<IUser>("users");
   }
   static async generateUniqueUsername(fullName: string): Promise<string> {
      const collection = this.getCollection();
      
      // Clean and format the name
      const cleanName = fullName
         .toLowerCase()
         .replace(/[^a-z\s]/g, '') // Remove non-letter characters except spaces
         .trim();
      
      // Split into words and take first two (first name and last name)
      const nameParts = cleanName.split(/\s+/);
      
      let baseUsername: string;
      
      if (nameParts.length >= 2) {
         // Use first-last format if we have at least 2 words
         baseUsername = `${nameParts[0]}-${nameParts[1]}`;
      } else if (nameParts.length === 1) {
         // If only one name, use it as is
         baseUsername = nameParts[0];
      } else {
         // Fallback if name is somehow empty
         baseUsername = 'user';
      }
      
      // Check if username already exists
      let finalUsername = baseUsername;
      let counter = 1;
      
      while (await collection.findOne({ username: finalUsername })) {
         finalUsername = `${baseUsername}${counter}`;
         counter++;
         
         // Safety check to prevent infinite loop
         if (counter > 999) {
            finalUsername = `${baseUsername}${Date.now()}`;
            break;
         }
      }
      
      console.log(`Generated username: "${finalUsername}" from name: "${fullName}"`);
      return finalUsername;
   }
   static async register(payload: IRegister) {
      userRegister.parse(payload);

      const collection = this.getCollection();
      const userEmail = await collection.findOne({ email: payload.email });
      if (userEmail) throw new CustomError("Email already exists", 400);

      const hashedPassword = await bcrypt.hash(payload.password, 10);
      const newUser = {
         ...payload,
         password: hashedPassword,
         provider: "credentials",
         createdAt: new Date(),
         updatedAt: new Date(),
      };

      await collection.insertOne(newUser);
      return { message: "User registered successfully" };
   }
   static async login(payload: ILogin): Promise<string> {
      const collection = this.getCollection();
      const { email, password } = payload;
      if (!email || !password) {
         throw new CustomError("Email and password are required", 400);
      }
      const user = await collection.findOne({ email });
      if (!user) {
         throw new CustomError("User not found", 404);
      }

      // Check if this is a Google user trying to login with credentials
      if (user.provider === "google") {
         throw new CustomError("Please login with Google", 400);
      }

      const isValid = bcrypt.compareSync(password, user.password);
      if (!isValid) {
         throw new CustomError("Invalid email or password", 400);
      }
      const token = jwt.sign(
         { _id: user._id, email: user.email, username: user.username },
         process.env.JWT_SECRET as string,
         { expiresIn: "1d" }
      );
      return token;
   }

   static async loginOrRegisterWithGoogle(googleUser: {
      id: string;
      email: string;
      name: string;
      picture?: string;
   }): Promise<string> {
      const collection = this.getCollection();
      
      console.log('Looking for existing user with email:', googleUser.email);
      
      // Check if user already exists
      let existingUser = await collection.findOne({ 
         $or: [
            { email: googleUser.email },
            { googleId: googleUser.id }
         ]
      });

      if (existingUser) {
         console.log('Found existing user:', existingUser.email);
         
         // User exists, check if it's a Google user
         if (existingUser.provider !== "google") {
            throw new CustomError("This email is already registered with a different method. Please use email/password login.", 400);
         }
         
         // Update user info
         await collection.updateOne(
            { _id: existingUser._id },
            {
               $set: {
                  name: googleUser.name,
                  profilePicture: googleUser.picture || existingUser.profilePicture,
                  updatedAt: new Date(),
               }
            }
         );
         
         console.log('Updated existing user');
      } else {
         console.log('Creating new user');

         const username = await this.generateUniqueUsername(googleUser.name);
         
         // Create new user
         const newUser = {
            name: googleUser.name,
            username: username,
            email: googleUser.email,
            password: "", // No password for Google users
            profilePicture: googleUser.picture || "",
            provider: "google",
            googleId: googleUser.id,
            createdAt: new Date(),
            updatedAt: new Date(),
         };

         const result = await collection.insertOne(newUser);
         existingUser = { ...newUser, _id: result.insertedId };
         
         console.log('Created new user with ID:', result.insertedId);
      }

      // Create JWT token
      const token = jwt.sign(
         { 
            _id: existingUser._id, 
            email: existingUser.email, 
            username: existingUser.username 
         },
         process.env.JWT_SECRET as string,
         { expiresIn: "1d" }
      );

      console.log('Created JWT token for user:', existingUser.email);
      return token;
   }
}
