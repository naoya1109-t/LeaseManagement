import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LeaseDetail } from "@/components/LeaseDetail";

export default async function LeaseDetailPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <LeaseDetail />;
}
