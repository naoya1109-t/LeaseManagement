import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LeasesTable } from "@/components/LeasesTable";

export default async function LeasesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <LeasesTable />;
}
