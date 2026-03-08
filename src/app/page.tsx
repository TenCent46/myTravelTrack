"use client";
import { useEffect, useState, useCallback } from "react";
import { BUDGET, PHASES, CATEGORIES } from "@/lib/constants";

type Summary = {
  byPhaseCategory: { phase: string; category: string; payer: string; actual_jpy: string; count: string }[];
  byPhase: { phase: string; payer: string; actual_jpy: string; count: string }[];
  budget: { phase: string; category: string; planned_jpy: string; payer: string }[];
  recent: any[];
  kenjiTotal: number;
  momTotal: number;
};

function yen(n: number) { return n < 0 ? `▲¥${Math.abs(n).toLocaleString()}` : `¥${n.toLocaleString()}`; }

function ProgressBar({ actual, planned, color }: { actual: number; planned: number; color: string }) {
  const pct = planned > 0 ? Math.min((actual / planned) * 100, 100) : 0;
  const over = actual > planned;
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className="progress-fill h-full rounded-full"
        style={{ width: `${pct}%`, backgroundColor: over ? "#EF4444" : color }}
      />
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/summary");
      setData(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="text-center py-20 text-gray-400">読み込み中...</div>;
  if (!data) return <div className="text-center py-20 text-red-500">データ読込エラー。DB接続を確認してください。</div>;

  const kenjiActual = data.kenjiTotal;
  const momActual = data.momTotal;
  const remaining = BUDGET.total_available - kenjiActual;
  const pctUsed = (kenjiActual / BUDGET.total_available) * 100;

  // Phase actuals by payer
  const phaseActuals: Record<string, number> = {};
  const momPhaseActuals: Record<string, number> = {};
  data.byPhase.forEach((r) => {
    if (r.payer === "ケンジ") phaseActuals[r.phase] = Number(r.actual_jpy);
    if (r.payer === "母") momPhaseActuals[r.phase] = Number(r.actual_jpy);
  });

  // Budget by phase+category per payer
  const budgetMap: Record<string, number> = {};
  const momBudgetMap: Record<string, number> = {};
  data.budget.forEach((b) => {
    const key = `${b.phase}:${b.category}`;
    if (b.payer === "ケンジ") budgetMap[key] = (budgetMap[key] || 0) + Number(b.planned_jpy);
    if (b.payer === "母") momBudgetMap[key] = (momBudgetMap[key] || 0) + Number(b.planned_jpy);
  });

  // Actual by phase+category per payer
  const actualMap: Record<string, number> = {};
  const momActualMap: Record<string, number> = {};
  data.byPhaseCategory.forEach((r) => {
    const key = `${r.phase}:${r.category}`;
    if (r.payer === "ケンジ") actualMap[key] = Number(r.actual_jpy);
    if (r.payer === "母") momActualMap[key] = Number(r.actual_jpy);
  });

  return (
    <div className="space-y-6">
      {/* ── メインカード ── */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-bold text-navy mb-4">全体サマリー</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <StatCard label="予算(ケンジ)" value={yen(BUDGET.total_available)} sub="使える額" color="text-ocean" />
          <StatCard label="ケンジ実績" value={yen(kenjiActual)} sub={`${pctUsed.toFixed(1)}% 消化`} color="text-red-500" />
          <StatCard label="残高" value={yen(remaining)} sub={remaining >= 0 ? "黒字" : "赤字"} color={remaining >= 0 ? "text-green-600" : "text-red-600"} />
          <StatCard label="母 実績" value={yen(momActual)} sub={`計画 ${yen(BUDGET.mom_total)}`} color="text-purple-600" />
          <StatCard label="計画値" value={yen(BUDGET.kenji_total)} sub="ケンジ予定額" color="text-gray-500" />
        </div>
        {/* 全体プログレスバー */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>消化率</span>
            <span>{yen(kenjiActual)} / {yen(BUDGET.total_available)}</span>
          </div>
          <ProgressBar actual={kenjiActual} planned={BUDGET.total_available} color="#065A82" />
        </div>
      </div>

      {/* ── フェーズ別 ── */}
      <div className="grid md:grid-cols-3 gap-4">
        {PHASES.map((ph) => {
          const planned = BUDGET.phases[ph.id as keyof typeof BUDGET.phases].kenji;
          const actual = phaseActuals[ph.id] || 0;
          const momAct = momPhaseActuals[ph.id] || 0;
          return (
            <div key={ph.id} className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{ph.emoji}</span>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: ph.color }}>Phase {ph.id}: {ph.name}</h3>
                  <span className="text-xs text-gray-400">{ph.period}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">ケンジ <strong className="text-red-500">{yen(actual)}</strong></span>
                <span className="text-gray-400">計画 {yen(planned)}</span>
              </div>
              <ProgressBar actual={actual} planned={planned} color={ph.color} />
              {actual > planned && (
                <p className="text-xs text-red-500 mt-1">予算超過 {yen(actual - planned)}</p>
              )}
              {momAct !== 0 && (
                <p className="text-xs text-purple-600 mt-2">母 {yen(momAct)}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── カテゴリ別内訳 ── */}
      {PHASES.map((ph) => {
        const cats = CATEGORIES.filter((cat) => budgetMap[`${ph.id}:${cat.id}`] !== undefined);
        if (cats.length === 0) return null;
        return (
          <div key={`cat-${ph.id}`} className="bg-white rounded-2xl shadow-md p-5">
            <h3 className="font-bold text-sm mb-3" style={{ color: ph.color }}>
              {ph.emoji} Phase {ph.id} カテゴリ別比較
            </h3>
            <div className="space-y-3">
              {cats.map((cat) => {
                const key = `${ph.id}:${cat.id}`;
                const planned = budgetMap[key] || 0;
                const actual = actualMap[key] || 0;
                if (planned <= 0) return null; // skip scholarships etc
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{cat.icon} {cat.id}</span>
                      <span className="text-gray-500">
                        <strong className={actual > planned ? "text-red-500" : "text-green-600"}>{yen(actual)}</strong>
                        {" / "}{yen(planned)}
                      </span>
                    </div>
                    <ProgressBar actual={actual} planned={planned} color={cat.color} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── 最近の出費 ── */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h3 className="font-bold text-sm text-navy mb-3">📋 最近の出費</h3>
        {data.recent.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">
            まだ出費が記録されていません。
            <a href="/add" className="text-ocean underline ml-1">出費を追加する →</a>
          </p>
        ) : (
          <div className="divide-y">
            {data.recent.map((e: any) => {
              const catInfo = CATEGORIES.find((c) => c.id === e.category);
              return (
                <div key={e.id} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{catInfo?.icon || "📦"}</span>
                    <div>
                      <p className="text-sm font-medium">{e.note || e.category}</p>
                      <p className="text-xs text-gray-400">
                        {e.expense_date?.split("T")[0]} · Phase {e.phase} · <span className={e.payer === "母" ? "text-purple-500" : "text-ocean"}>{e.payer}</span>
                        {e.currency !== "JPY" && ` · ${e.currency} ${Number(e.amount).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-red-500">{yen(Number(e.amount_jpy))}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}
