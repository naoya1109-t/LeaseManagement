import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const leaseId = formData.get("leaseId") as string;

  if (!file || !leaseId) {
    return NextResponse.json({ error: "Missing file or leaseId" }, { status: 400 });
  }

  let blobUrl: string;
  const fileType = file.type.startsWith("image/") ? "image" : "pdf";

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`leases/${leaseId}/${file.name}`, file, {
      access: "public",
    });
    blobUrl = blob.url;
  } else {
    const uploadsDir = path.join(process.cwd(), "public", "uploads", leaseId);
    await mkdir(uploadsDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}_${file.name}`;
    await writeFile(path.join(uploadsDir, fileName), buffer);
    blobUrl = `/uploads/${leaseId}/${fileName}`;
  }

  const document = await prisma.document.create({
    data: {
      lease_id: leaseId,
      file_name: file.name,
      blob_url: blobUrl,
      file_type: fileType,
    },
  });

  return NextResponse.json(document, { status: 201 });
}
