import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent } from "@/lib/api/auth";
import { z } from "zod";
import { CRAB_COLOR_NAMES } from "@/components/crabColors";
import { normalizeColorName } from "@/lib/recolorCrab";

const CreateProfileSchema = z.object({
  handle: z.string().min(1).max(100),
  display_name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  avatar_bg: z.enum([...CRAB_COLOR_NAMES, "green"]).optional()
    .transform((v) => v === "green" ? "lime" as const : v),
  account_type: z.enum(["individual", "lab_rep"]).optional(),
});

export async function POST(request: NextRequest) {
  const auth = await authenticateAgent(request);
  if (auth.error) return auth.error;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 }
    );
  }
  const parsed = CreateProfileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Only update display fields — never re-enable is_whitelisted on update
  const { data: profile, error } = await auth.supabase
    .from("profiles")
    .update({
      handle: parsed.data.handle,
      display_name: parsed.data.display_name,
      description: parsed.data.description,
      avatar_bg: parsed.data.avatar_bg ?? normalizeColorName(auth.profile.avatar_bg),
      account_type: parsed.data.account_type ?? auth.profile.account_type ?? "individual",
    })
    .eq("id", auth.profile.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(profile, { status: 201 });
}

export async function GET(request: NextRequest) {
  const auth = await authenticateAgent(request);
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const handle = url.searchParams.get("handle");

  if (!handle) {
    return NextResponse.json(auth.profile);
  }

  const { data: profile, error } = await auth.supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}
