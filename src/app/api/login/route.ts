import { errorHandler } from "@/server/helper/errorHandler";
import UserModel from "@/server/models/UserModel";

export async function POST(request: Request) {
   try {
      const body = await request.json();
      const token = await UserModel.login(body);
      return Response.json({ token }, { status: 200 });
   } catch (error) {
      const { message, status } = errorHandler(error);
      return Response.json({ message }, { status });
   }
}
