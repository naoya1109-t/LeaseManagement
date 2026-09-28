"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaseForm } from "@/components/LeaseForm";
import { DocumentSection } from "@/components/DocumentSection";
import { ArrowLeft, Edit2, X } from "lucide-react";
import { formatDate, formatCurrency, getDaysUntilEnd } from "@/lib/utils";
import type { Lease, Document } from "@prisma/client";

type LeaseWithDocs = Lease & { documents: Document[] };

export function LeaseDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lease, setLease] = useState<LeaseWithDocs | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const fetchLease = useCallback(async () => {
    const res = await fetch(`/api/leases/${id}`);
    if (res.ok) {
      setLease(await res.json());
    } else {
      router.push("/leases");
    }
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchLease();
  }, [fetchLease]);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">読み込み中...</div>;
  }

  if (!lease) return null;

  const days = getDaysUntilEnd(lease.end_date);
  const isActive = lease.status !== "終了";

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/leases">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{lease.equipment_name}</h1>
          <p className="text-muted-foreground text-sm">{lease.lessor} ・ {lease.category}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setEditing(!editing)}
        >
          {editing ? (
            <><X className="h-4 w-4 mr-2" />キャンセル</>
          ) : (
            <><Edit2 className="h-4 w-4 mr-2" />編集</>
          )}
        </Button>
      </div>

      {editing ? (
        <LeaseForm lease={lease} />
      ) : (
        <div className="space-y-6">
          {/* 契約情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">契約情報</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <dt className="text-xs text-muted-foreground">ステータス</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      lease.status === "契約中" ? "bg-green-100 text-green-800" :
                      lease.status === "更新予定" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-600"
                    }`}>{lease.status}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">契約番号</dt>
                  <dd className="mt-1 text-sm">{lease.contract_number ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">設置場所</dt>
                  <dd className="mt-1 text-sm">{lease.location ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">開始日</dt>
                  <dd className="mt-1 text-sm">{formatDate(lease.start_date)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">終了日</dt>
                  <dd className="mt-1 text-sm flex items-center gap-2">
                    {formatDate(lease.end_date)}
                    {isActive && days <= 180 && (
                      <Badge variant={days <= 90 ? "destructive" : "warning"}>
                        残り{days}日
                      </Badge>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">リース料</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    <span className="text-xs font-normal text-muted-foreground mr-1">
                      {(lease as Lease & { fee_type?: string }).fee_type ?? "月額"}
                    </span>
                    {formatCurrency(lease.monthly_fee)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">リース料率</dt>
                  <dd className="mt-1 text-sm">{lease.lease_rate != null ? `${lease.lease_rate}%` : "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">登録日</dt>
                  <dd className="mt-1 text-sm">{formatDate(lease.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">更新日</dt>
                  <dd className="mt-1 text-sm">{formatDate(lease.updated_at)}</dd>
                </div>
              </dl>
              {lease.memo && (
                <div className="mt-4 pt-4 border-t">
                  <dt className="text-xs text-muted-foreground">メモ</dt>
                  <dd className="mt-1 text-sm whitespace-pre-wrap">{lease.memo}</dd>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 添付書類 */}
          <Card>
            <CardContent className="pt-6">
              <DocumentSection
                leaseId={lease.id}
                documents={lease.documents}
                onRefresh={fetchLease}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
