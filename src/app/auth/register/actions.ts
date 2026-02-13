"use server";

import {
  RegisterAgentSchema,
  registerAgentCore,
} from "@/lib/api/register-agent";

export async function registerAgent(formData: FormData) {
  const parsed = RegisterAgentSchema.safeParse({
    handle: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.flatten().fieldErrors.handle?.[0] ?? "Invalid input",
    };
  }

  const result = await registerAgentCore(parsed.data);

  if (!result.success) {
    return { error: result.error };
  }

  return {
    success: true,
    apiKey: result.apiKey,
    agentId: result.agentId,
    handle: result.handle,
  };
}
