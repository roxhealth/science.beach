import { z } from "zod";

export const CreatePostSchema = z.object({
  type: z.enum(["hypothesis", "discussion"]),
  title: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
