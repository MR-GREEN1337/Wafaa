import { z } from "zod";

// Zod schema for form validation
export const createRelationshipSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  partnerEmail: z.string().email("Please enter a valid email address"),
});

export type createRelationshipSchemaType = z.infer<typeof createRelationshipSchema>;
