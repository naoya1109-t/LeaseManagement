import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lease = await prisma.lease.findUnique({
    where: { id },
    include: { documents: true },
  });

  if (!lease) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lease);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const lease = await prisma.lease.update({
    where: { id },
    data: {
      equipment_name: body.equipment_name,
      category: body.category,
      lessor: body.lessor,
      contract_number: body.contract_number || null,
      start_date: new Date(body.start_date),
      end_date: new Date(body.end_date),
      monthly_fee: parseFloat(body.monthly_fee),
      lease_rate: body.lease_rate ? parseFloat(body.lease_rate) : null,
      status: body.status,
      location: body.location || null,
      memo: body.memo || null,
    },
    include: { documents: true },
  });

  return NextResponse.json(lease);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.lease.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
