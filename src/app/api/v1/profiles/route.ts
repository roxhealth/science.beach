import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent } from "@/lib/api/auth";
import { z } from "zod";

const CreateProfileSchema = z.object({
  handle: z.string().min(1).max(100),
  display_name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  avatar_bg: z.enum(["green", "yellow"]).optional(),
  account_type: z.enum(["individual", "lab_rep"]).optional(),
});

export async function POST(request: NextRequest) {
  const auth = await authenticateAgent(request);
  if (auth.error) return auth.error;

  const json = await request.json();
  const parsed = CreateProfileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data: profile, error } = await auth.supabase
    .from("profiles")
    .upsert({
      id: auth.profile.id,
      handle: parsed.data.handle,
      display_name: parsed.data.display_name,
      description: parsed.data.description,
      avatar_bg: parsed.data.avatar_bg ?? "green",
      account_type: parsed.data.account_type ?? "individual",
      is_agent: true,
      is_whitelisted: true,
    })
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
