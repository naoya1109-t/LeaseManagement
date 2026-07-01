"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Download,
  Search,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { formatDate, getDaysUntilEnd } from "@/lib/utils";

const LESSORS = ["114リース", "オーシャンリース", "いよ銀リース"];
const STATUSES = ["契約中", "更新予定", "終了"];

type Lease = {
  id: string;
  equipment_name: string;
  category: string;
  lessor: string;
  contract_number: string | null;
  start_date: string;
  end_date: string;
  monthly_fee: number;
  status: string;
  location: string | null;
};

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    "契約中": "bg-green-100 text-green-800",
    "更新予定": "bg-blue-100 text-blue-800",
    "終了": "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function AlertBadge({ endDate }: { endDate: string }) {
  const days = getDaysUntilEnd(endDate);
  if (days <= 0) return <Badge variant="destructive">期限切れ</Badge>;
  if (days <= 90) return <Badge variant="destructive">残り{days}日</Badge>;
  if (days <= 180) return <Badge variant="warning">残り{days}日</Badge>;
  return null;
}

export default function LeasesPage() {
  const router = useRouter();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lessorFilter, setLessorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("end_date");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const fetchLeases = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (lessorFilter !== "all") params.set("lessor", lessorFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    params.set("sort", sort);
    params.set("order", order);

    const res = await fetch(`/api/leases?${params}`);
    if (res.ok) {
      const data = await res.json();
      setLeases(data);
    }
    setLoading(false);
  }, [search, lessorFilter, statusFilter, sort, order]);

  useEffect(() => {
    const timer = setTimeout(fetchLeases, 300);
    return () => clearTimeout(timer);
  }, [fetchLeases]);

  function toggleSort(field: string) {
    if (sort === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSort(field);
      setOrder("asc");
    }
  }

  function SortIcon({ field }: { field: string }) {
    if (sort !== field) return null;
    return order === "asc" ? (
      <ChevronUp className="h-3 w-3 inline ml-1" />
    ) : (
      <ChevronDown className="h-3 w-3 inline ml-1" />
    );
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`「${name}」を削除しますか？この操作は取り消せません。`)) return;
    const res = await fetch(`/api/leases/${id}`, { method: "DELETE" });
    if (res.ok) fetchLeases();
  }

  function handleCsvExport() {
    window.open("/api/leases/export", "_blank");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">契約一覧</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCsvExport}>
            <Download className="h-4 w-4 mr-2" />
            CSV出力
          </Button>
          <Button asChild>
            <Link href="/leases/new">
              <Plus className="h-4 w-4 mr-2" />
              新規登録
            </Link>
          </Button>
        </div>
      </div>

      {/* フィルタ */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="備品名・契約番号・場所で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={lessorFilter} onValueChange={setLessorFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="リース会社" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全リース会社</SelectItem>
            {LESSORS.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全ステータス</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* テーブル */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">契約番号</th>
                <th
                  className="text-left px-4 py-3 font-medium cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort("equipment_name")}
                >
                  備品名<SortIcon field="equipment_name" />
                </th>
                <th className="text-left px-4 py-3 font-medium">種別</th>
                <th
                  className="text-left px-4 py-3 font-medium cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort("lessor")}
                >
                  リース会社<SortIcon field="lessor" />
                </th>
                <th
                  className="text-left px-4 py-3 font-medium cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort("end_date")}
                >
                  終了日<SortIcon field="end_date" />
                </th>
                <th className="text-left px-4 py-3 font-medium">ステータス</th>
                <th className="text-left px-4 py-3 font-medium">アラート</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    読み込み中...
                  </td>
                </tr>
              ) : leases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    契約データがありません
                  </td>
                </tr>
              ) : (
                leases.map((lease) => (
                  <tr
                    key={lease.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/leases/${lease.id}`)}
                  >
                    <td className="px-4 py-3 text-muted-foreground">{lease.contract_number ?? "-"}</td>
                    <td className="px-4 py-3 font-medium">{lease.equipment_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lease.category}</td>
                    <td className="px-4 py-3">{lease.lessor}</td>
                    <td className="px-4 py-3">{formatDate(lease.end_date)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lease.status} />
                    </td>
                    <td className="px-4 py-3">
                      {lease.status !== "終了" && (
                        <AlertBadge endDate={lease.end_date} />
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(lease.id, lease.equipment_name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">合計 {leases.length}件</p>
    </div>
  );
}
