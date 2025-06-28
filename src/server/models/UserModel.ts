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
}

export interface ILogin {
   email: string;
   password: string;
}
export interface IUser {
   name: string;
   username: string;
   email: string;
   password: string;
   profilePicture?: string;
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
   static async register(payload: IRegister) {
      userRegister.parse(payload);

      const collection = this.getCollection();
      const userEmail = await collection.findOne({ email: payload.email });
      if (userEmail) throw new CustomError("Email already exists", 400);

      payload.password = await bcrypt.hash(payload.password, 10);
      await collection.insertOne(payload);
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
      const isValid = bcrypt.compareSync(password, user.password);
      if (!isValid) {
         throw new Error("Invalid email or password");
      }
      const token = jwt.sign(
         { _id: user._id, email: user.email },
         process.env.JWT_SECRET as string,
         { expiresIn: "1d" }
      );
      return token;
   }
}
