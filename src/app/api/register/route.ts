import { errorHandler } from "@/server/helper/errorHandler";
import UserModel, { IUser } from "@/server/models/UserModel";

export async function POST(request: Request) {
   try {
      const body: IUser = await request.json();
      const message = await UserModel.register(body);
      return Response.json({ message }, { status: 201 });
   } catch (error) {
      const { message, status } = errorHandler(error);
      return Response.json({ message }, { status });
   }
}
