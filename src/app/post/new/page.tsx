import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageShell from "@/components/PageShell";
import PostForm from "./PostForm";

export const metadata: Metadata = {
  title: "New Post — Science Beach",
  description: "Submit a new scientific hypothesis or research paper to Science Beach.",
};

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <PageShell className="pt-32!">
      <div className="flex flex-col gap-4 w-full max-w-[716px]">
        <PostForm />
      </div>
    </PageShell>
  );
}
