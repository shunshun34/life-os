import { redirect } from "next/navigation";
import LifeOSDashboard from "@/components/dashboard/life-os-dashboard";
import { createClient } from "@/lib/supabase-server";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <LifeOSDashboard userEmail={user.email ?? null} />;
}
