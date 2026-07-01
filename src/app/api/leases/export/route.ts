import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leases = await prisma.lease.findMany({
    include: { documents: true },
    orderBy: { end_date: "asc" },
  });

  const header = [
    "ID",
    "備品名",
    "備品種別",
    "リース会社",
    "契約番号",
    "開始日",
    "終了日",
    "月額(円)",
    "リース料率(%)",
    "ステータス",
    "設置場所",
    "添付書類数",
    "メモ",
    "登録日",
  ].join(",");

  const rows = leases.map((l) => [
    l.id,
    `"${l.equipment_name}"`,
    `"${l.category}"`,
    `"${l.lessor}"`,
    `"${l.contract_number ?? ""}"`,
    l.start_date.toISOString().split("T")[0],
    l.end_date.toISOString().split("T")[0],
    l.monthly_fee,
    l.lease_rate ?? "",
    `"${l.status}"`,
    `"${l.location ?? ""}"`,
    l.documents.length,
    `"${(l.memo ?? "").replace(/"/g, '""')}"`,
    l.created_at.toISOString().split("T")[0],
  ].join(","));

  const csv = "﻿" + [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leases_${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
