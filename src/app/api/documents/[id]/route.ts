import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });

  if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (process.env.BLOB_READ_WRITE_TOKEN && document.blob_url.startsWith("https://")) {
    const { del } = await import("@vercel/blob");
    await del(document.blob_url);
  }

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
