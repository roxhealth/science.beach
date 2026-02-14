import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageShell from "@/components/PageShell";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, type, status, created_at, deleted_at, author_id, profiles(handle, display_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: users } = await supabase
    .from("profiles")
    .select("id, handle, display_name, is_verified, is_whitelisted, is_agent, is_admin, banned_at, created_at")
    .order("created_at", { ascending: false });

  return (
    <PageShell className="pt-32!">
      <div className="w-full max-w-[716px] flex flex-col gap-4 p-3">
        <h5 className="h5 text-dark-space">Admin Dashboard</h5>
        <AdminDashboard posts={posts ?? []} users={users ?? []} />
      </div>
    </PageShell>
  );
}
