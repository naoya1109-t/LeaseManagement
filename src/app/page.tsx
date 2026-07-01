import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  FileText,
  Calendar,
  Plus,
} from "lucide-react";
import { formatDate, getDaysUntilEnd } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const leases = await prisma.lease.findMany({
    where: { status: { not: "終了" } },
    orderBy: { end_date: "asc" },
    include: { documents: true },
  });

  const criticalLeases = leases.filter((l) => {
    const days = getDaysUntilEnd(l.end_date);
    return days >= 0 && days <= 90;
  });
  const warningLeases = leases.filter((l) => {
    const days = getDaysUntilEnd(l.end_date);
    return days > 90 && days <= 180;
  });

  const totalCount = await prisma.lease.count();
  const activeCount = leases.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <Button asChild>
          <Link href="/leases/new">
            <Plus className="h-4 w-4 mr-2" />
            新規契約登録
          </Link>
        </Button>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">契約総数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}件</div>
            <p className="text-xs text-muted-foreground">有効契約: {activeCount}件</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">期限アラート</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {criticalLeases.length}件
            </div>
            <p className="text-xs text-muted-foreground">
              90日以内: {criticalLeases.length}件 / 180日以内: {warningLeases.length}件
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 期限アラート */}
      {(criticalLeases.length > 0 || warningLeases.length > 0) && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            期限が近い契約
          </h2>

          {criticalLeases.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">
                ⚠ 90日以内に終了
              </p>
              {criticalLeases.map((lease) => {
                const days = getDaysUntilEnd(lease.end_date);
                return (
                  <Link key={lease.id} href={`/leases/${lease.id}`}>
                    <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium">{lease.equipment_name}</p>
                        <p className="text-sm text-gray-600">
                          {lease.contract_number && <span className="mr-2">{lease.contract_number}</span>}
                          {lease.lessor} ・ {lease.location ?? "場所未設定"}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">残り{days}日</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(lease.end_date)}まで
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {warningLeases.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-yellow-700">
                ⚠ 180日以内に終了
              </p>
              {warningLeases.map((lease) => {
                const days = getDaysUntilEnd(lease.end_date);
                return (
                  <Link key={lease.id} href={`/leases/${lease.id}`}>
                    <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium">{lease.equipment_name}</p>
                        <p className="text-sm text-gray-600">
                          {lease.contract_number && <span className="mr-2">{lease.contract_number}</span>}
                          {lease.lessor} ・ {lease.location ?? "場所未設定"}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="warning">残り{days}日</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(lease.end_date)}まで
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {criticalLeases.length === 0 && warningLeases.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>期限が近い契約はありません</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
