import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LeaseForm } from "@/components/LeaseForm";

export default async function NewLeasePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">新規契約登録</h1>
      <LeaseForm />
    </div>
  );
}
