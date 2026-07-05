import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Maps known error types (zod, Prisma) to appropriate HTTP responses. */
export function handleApiError(error: unknown) {
  if (error instanceof z.ZodError) {
    const message = error.issues[0]?.message ?? "Ugyldigt input";
    return errorResponse(message, 400);
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return errorResponse("E-mailadressen er allerede i brug", 409);
    }
    if (error.code === "P2025") {
      return errorResponse("Ikke fundet", 404);
    }
    if (error.code === "P2003") {
      return errorResponse("Den valgte medarbejder findes ikke", 400);
    }
  }
  console.error(error);
  return errorResponse("Der opstod en serverfejl", 500);
}
