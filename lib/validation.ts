import { z } from "zod";

export const roleSchema = z.enum(["CHEF", "WAITER", "DISHWASHER", "MANAGER"]);

export const employeeInputSchema = z.object({
  name: z.string().trim().min(1, "Navn er påkrævet"),
  email: z.email("Ugyldig e-mailadresse").trim(),
  role: roleSchema,
});

const shiftBaseSchema = z.object({
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  role: roleSchema,
  employeeId: z.uuid().nullable().optional(),
});

const validTimeRange = (data: { startsAt: Date; endsAt: Date }) =>
  data.endsAt > data.startsAt;

export const shiftCreateSchema = shiftBaseSchema.refine(validTimeRange, {
  message: "Sluttid skal være efter starttid",
  path: ["endsAt"],
});

export const shiftUpdateSchema = shiftBaseSchema.partial().refine(
  (data) => !data.startsAt || !data.endsAt || data.endsAt > data.startsAt,
  { message: "Sluttid skal være efter starttid", path: ["endsAt"] }
);
