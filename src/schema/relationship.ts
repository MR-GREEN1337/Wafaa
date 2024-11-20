import { z } from "zod";

const RelationshipBasis = z.enum([
  "ISLAMIC",
  "CHRISTIAN",
  "BUDDHIST",
  "JEWISH",
  "SECULAR",
  "INTERFAITH",
  "OTHER"
]);

export const createRelationshipSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  partnerEmail: z.string().email("Please enter a valid email address"),
  basis: RelationshipBasis.optional(),
  customBasis: z.string().optional()
    .refine(
      (val) => {
        // If basis is OTHER, customBasis is required and must be at least 3 characters
        if (val === "OTHER") {
          return val && val.length >= 3;
        }
        return true;
      },
      {
        message: "Please provide a description for your custom basis",
      }
    ),
});

export type createRelationshipSchemaType = z.infer<typeof createRelationshipSchema>;