"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Lease } from "@prisma/client";

const LESSORS = ["114リース", "オーシャンリース", "いよ銀リース"];
const STATUSES = ["契約中", "更新予定", "終了"];
const CATEGORIES = ["サーバー", "パソコン", "FAX", "OA機器その他", "会社設備", "倉庫備品", "その他"];

interface LeaseFormProps {
  lease?: Lease;
}

export function LeaseForm({ lease }: LeaseFormProps) {
  const router = useRouter();
  const isEdit = !!lease;

  const [form, setForm] = useState({
    equipment_name: lease?.equipment_name ?? "",
    category: lease?.category ?? "",
    lessor: lease?.lessor ?? "",
    contract_number: lease?.contract_number ?? "",
    start_date: lease?.start_date
      ? new Date(lease.start_date).toISOString().split("T")[0]
      : "",
    end_date: lease?.end_date
      ? new Date(lease.end_date).toISOString().split("T")[0]
      : "",
    monthly_fee: lease?.monthly_fee?.toString() ?? "",
    fee_type: (lease as Lease & { fee_type?: string })?.fee_type ?? "月額",
    lease_rate: lease?.lease_rate?.toString() ?? "",
    status: lease?.status ?? "契約中",
    location: lease?.location ?? "",
    memo: lease?.memo ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = isEdit ? `/api/leases/${lease.id}` : "/api/leases";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/leases/${data.id}`);
      router.refresh();
    } else {
      setError("保存に失敗しました。入力内容を確認してください。");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="equipment_name">備品名 *</Label>
          <Input
            id="equipment_name"
            value={form.equipment_name}
            onChange={(e) => set("equipment_name", e.target.value)}
            placeholder="例: 複合機、フォークリフト"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">備品種別 *</Label>
          <Select
            value={form.category}
            onValueChange={(v) => set("category", v)}
            required
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="種別を選択" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lessor">リース会社 *</Label>
          <Select
            value={form.lessor}
            onValueChange={(v) => set("lessor", v)}
            required
          >
            <SelectTrigger id="lessor">
              <SelectValue placeholder="リース会社を選択" />
            </SelectTrigger>
            <SelectContent>
              {LESSORS.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contract_number">契約番号</Label>
          <Input
            id="contract_number"
            value={form.contract_number}
            onChange={(e) => set("contract_number", e.target.value)}
            placeholder="例: LC-2024-001"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_date">リース開始日 *</Label>
          <Input
            id="start_date"
            type="date"
            value={form.start_date}
            onChange={(e) => set("start_date", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">リース終了日 *</Label>
          <Input
            id="end_date"
            type="date"
            value={form.end_date}
            onChange={(e) => set("end_date", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthly_fee">リース料(円) *</Label>
          <div className="flex gap-2">
            <Select
              value={form.fee_type}
              onValueChange={(v) => set("fee_type", v)}
            >
              <SelectTrigger className="w-24 flex-shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="月額">月額</SelectItem>
                <SelectItem value="年額">年額</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="monthly_fee"
              type="number"
              value={form.monthly_fee}
              onChange={(e) => set("monthly_fee", e.target.value)}
              placeholder="例: 50000"
              min="0"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lease_rate">リース料率(%)</Label>
          <Input
            id="lease_rate"
            type="number"
            value={form.lease_rate}
            onChange={(e) => set("lease_rate", e.target.value)}
            placeholder="例: 1.5"
            step="0.01"
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">ステータス *</Label>
          <Select
            value={form.status}
            onValueChange={(v) => set("status", v)}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">設置場所・使用部署</Label>
          <Input
            id="location"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="例: 本社1F 事務室"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="memo">メモ</Label>
        <Textarea
          id="memo"
          value={form.memo}
          onChange={(e) => set("memo", e.target.value)}
          placeholder="自由記入欄"
          rows={4}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "保存中..." : isEdit ? "更新する" : "登録する"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
