import { JWSInvalid } from "jose/errors";

export default class CustomError extends Error {
   status: number = 500;

   constructor(message: string, status: number = 500) {
      super(message);
      this.status = status;
   }
}
export function errorHandler(error: unknown): {
   message: string;
   status: number;
} {
   const result = {
      message: "Internal Server Error",
      status: 500,
   };
   if (error instanceof CustomError) {
      result.message = error.message;
      result.status = error.status;
   } else if (error instanceof JWSInvalid) {
      result.message = "Invalid token";
      result.status = 401;
   }
   return result;
}
