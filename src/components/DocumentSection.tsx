"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, FileText, Eye, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Document } from "@prisma/client";

interface DocumentSectionProps {
  leaseId: string;
  documents: Document[];
  onRefresh: () => void;
}

export function DocumentSection({
  leaseId,
  documents,
  onRefresh,
}: DocumentSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("leaseId", leaseId);
      await fetch("/api/documents", { method: "POST", body: formData });
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    onRefresh();
  }

  async function handleDelete(docId: string) {
    if (!confirm("このファイルを削除しますか？")) return;
    setDeleting(docId);
    await fetch(`/api/documents/${docId}`, { method: "DELETE" });
    setDeleting(null);
    onRefresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">添付書類</h3>
        <div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "アップロード中..." : "ファイルを追加"}
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">添付書類はありません</p>
          <p className="text-xs">PDF・画像ファイルをアップロードできます</p>
        </div>
      ) : (
        <div className="divide-y border rounded-lg">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 p-3">
              <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(doc.uploaded_at)} ・ {doc.file_type.toUpperCase()}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  asChild
                >
                  <a href={doc.blob_url} target="_blank" rel="noopener noreferrer" title="プレビュー">
                    <Eye className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  asChild
                >
                  <a href={doc.blob_url} download={doc.file_name} title="ダウンロード">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleting === doc.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
