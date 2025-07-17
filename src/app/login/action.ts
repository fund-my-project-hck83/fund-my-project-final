"use server";

import { cookies } from "next/headers";

export async function setCookie(name: string, value: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(name, value, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  } catch (error) {
    console.error("Error setting cookie:", error);
  }
}

export async function getCookie(name: string) {
  const cookieStore = await cookies();
  return cookieStore.get(name);
}

export async function deleteCookie(name: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(name);
  } catch (error) {
    console.error("Error deleting cookie:", error);
  }
}
