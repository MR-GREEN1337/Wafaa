import { z } from "zod";

export const createSessionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  relationshipId: z.string().optional(),
  sessionType: z.enum(["individual", "joint"]),
  status: z.enum(["active", "completed", "archived"]).default("active"),
  basis: z.enum(["ISLAMIC", "CHRISTIAN", "BUDDHIST", "JEWISH", "SECULAR", "INTERFAITH", "OTHER",]).default("OTHER"),
  customBasis: z.string().optional(),
});

export type createSessionSchemaType = z.infer<typeof createSessionSchema>;