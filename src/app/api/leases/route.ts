import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const lessor = searchParams.get("lessor") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort = searchParams.get("sort") ?? "end_date";
  const order = searchParams.get("order") ?? "asc";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { equipment_name: { contains: search } },
      { contract_number: { contains: search } },
      { location: { contains: search } },
    ];
  }

  if (lessor) {
    where.lessor = lessor;
  }

  if (status) {
    where.status = status;
  }

  const leases = await prisma.lease.findMany({
    where,
    include: { documents: true },
    orderBy: { [sort]: order },
  });

  return NextResponse.json(leases);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const lease = await prisma.lease.create({
    data: {
      equipment_name: body.equipment_name,
      category: body.category,
      lessor: body.lessor,
      contract_number: body.contract_number || null,
      start_date: new Date(body.start_date),
      end_date: new Date(body.end_date),
      monthly_fee: parseFloat(body.monthly_fee),
      fee_type: body.fee_type ?? "月額",
      lease_rate: body.lease_rate ? parseFloat(body.lease_rate) : null,
      status: body.status ?? "契約中",
      location: body.location || null,
      memo: body.memo || null,
    },
  });

  return NextResponse.json(lease, { status: 201 });
}
