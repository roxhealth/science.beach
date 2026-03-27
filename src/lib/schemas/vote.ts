import { z } from "zod";

export const voteSchema = z.object({
  question: z.enum(["valuable_topic", "sound_approach"]),
  value: z.boolean(),
});
