"use client";
import { useEffect, useState, useCallback, use } from "react";
import { PHASES, CATEGORIES, BUDGET } from "@/lib/constants";
import { ITINERARIES } from "@/lib/itinerary";

function yen(n: number) {
  return n < 0 ? `▲¥${Math.abs(n).toLocaleString()}` : `¥${n.toLocaleString()}`;
}

function pct(actual: number, planned: number) {
  if (planned <= 0) return 0;
  return Math.round((actual / planned) * 100);
}

type Expense = {
  id: number;
  expense_date: string;
  amount: string;
  currency: string;
  rate_used: string;
  amount_jpy: number;
  phase: string;
  category: string;
  payer: string;
  note: string;
};

type BudgetItem = {
  phase: string;
  category: string;
  planned_jpy: string;
  payer: string;
};

export default function PhasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const phase = PHASES.find((p) => p.id === id);
  const itinerary = ITINERARIES[id];
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [expRes, sumRes] = await Promise.all([
        fetch(`/api/expenses?phase=${id}&limit=200`),
        fetch("/api/summary"),
      ]);
      const expData = await expRes.json();
      const sumData = await sumRes.json();
      setExpenses(expData);
      setBudgetItems(sumData.budget.filter((b: BudgetItem) => b.phase === id));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (!phase || !itinerary) {
    return <div className="text-center py-20 text-red-500">フェーズが見つかりません</div>;
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-400">読み込み中...</div>;
  }

  // Build category budget/actual maps per payer
  const kenjiBudget: Record<string, number> = {};
  const momBudget: Record<string, number> = {};
  budgetItems.forEach((b) => {
    if (b.payer === "ケンジ") kenjiBudget[b.category] = (kenjiBudget[b.category] || 0) + Number(b.planned_jpy);
    if (b.payer === "母") momBudget[b.category] = (momBudget[b.category] || 0) + Number(b.planned_jpy);
  });

  const kenjiActual: Record<string, number> = {};
  const momActual: Record<string, number> = {};
  let kenjiTotal = 0;
  let momTotal = 0;
  expenses.forEach((e) => {
    const amt = Number(e.amount_jpy);
    if (e.payer === "ケンジ") {
      kenjiActual[e.category] = (kenjiActual[e.category] || 0) + amt;
      kenjiTotal += amt;
    } else {
      momActual[e.category] = (momActual[e.category] || 0) + amt;
      momTotal += amt;
    }
  });

  const planned = BUDGET.phases[id as keyof typeof BUDGET.phases].kenji;
  const kenjiPct = pct(kenjiTotal, planned);

  // All categories that have either budget or actual
  const allCatIds = new Set<string>();
  Object.keys(kenjiBudget).forEach((c) => allCatIds.add(c));
  Object.keys(kenjiActual).forEach((c) => allCatIds.add(c));
  Object.keys(momBudget).forEach((c) => allCatIds.add(c));
  Object.keys(momActual).forEach((c) => allCatIds.add(c));

  const catList = CATEGORIES.filter((c) => allCatIds.has(c.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <a href="/" className="text-gray-400 hover:text-gray-600 text-sm">&larr; ダッシュボード</a>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{phase.emoji}</span>
          <div>
            <h1 className="text-xl font-bold" style={{ color: phase.color }}>
              Phase {phase.id}: {phase.name}
            </h1>
            <p className="text-sm text-gray-400">{itinerary.period} ({itinerary.days}日間)</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">{itinerary.route}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="ケンジ予算" value={yen(planned)} color="text-ocean" />
        <SummaryCard label="ケンジ実績" value={yen(kenjiTotal)} sub={`${kenjiPct}%`} color="text-red-500" />
        <SummaryCard label="残り" value={yen(planned - kenjiTotal)} color={kenjiTotal <= planned ? "text-green-600" : "text-red-600"} />
        <SummaryCard label="母 実績" value={yen(momTotal)} color="text-purple-600" />
      </div>

      {/* Category breakdown - ケンジ */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h2 className="font-bold text-sm text-navy mb-4">ケンジ カテゴリ別消化率</h2>
        <div className="space-y-4">
          {catList.map((cat) => {
            const bud = kenjiBudget[cat.id] || 0;
            const act = kenjiActual[cat.id] || 0;
            if (bud === 0 && act === 0) return null;
            const p = bud > 0 ? pct(act, bud) : (act > 0 ? 100 : 0);
            const barPct = bud > 0 ? Math.min((act / bud) * 100, 100) : 0;
            const over = act > bud && bud > 0;
            return (
              <div key={cat.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">
                    {cat.icon} {cat.id}
                  </span>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${over ? "text-red-500" : "text-gray-700"}`}>
                      {yen(act)}
                    </span>
                    {bud > 0 && (
                      <span className="text-xs text-gray-400 ml-1">/ {yen(bud)}</span>
                    )}
                    <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      p >= 100 ? "bg-red-100 text-red-600" :
                      p >= 75 ? "bg-amber-100 text-amber-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {p}%
                    </span>
                  </div>
                </div>
                {bud > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barPct}%`,
                        backgroundColor: over ? "#EF4444" : cat.color,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Category breakdown - 母 */}
      {Object.keys(momActual).length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="font-bold text-sm text-purple-700 mb-4">母 カテゴリ別</h2>
          <div className="space-y-3">
            {catList.map((cat) => {
              const bud = momBudget[cat.id] || 0;
              const act = momActual[cat.id] || 0;
              if (act === 0 && bud === 0) return null;
              return (
                <div key={cat.id} className="flex justify-between items-center">
                  <span className="text-sm">{cat.icon} {cat.id}</span>
                  <div>
                    <span className="text-sm font-bold text-purple-700">{yen(act)}</span>
                    {bud > 0 && <span className="text-xs text-gray-400 ml-1">/ {yen(bud)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Itinerary */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h2 className="font-bold text-sm text-navy mb-4">旅程</h2>
        <div className="space-y-0">
          {itinerary.items.map((item, i) => (
            <div key={i} className="flex gap-3 py-2.5 border-b border-gray-100 last:border-0">
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full mt-1 ${
                  item.status === "confirmed" ? "bg-green-500" :
                  item.status === "pending" ? "bg-amber-400" :
                  "bg-gray-300"
                }`} />
                {i < itinerary.items.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs font-bold text-gray-500">{item.date}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    item.status === "confirmed" ? "bg-green-100 text-green-700" :
                    item.status === "pending" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {item.status === "confirmed" ? "確定" : item.status === "pending" ? "要予約" : "未定"}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800">{item.city}</p>
                <p className="text-xs text-gray-500">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> 確定</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> 要予約</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> 未定</span>
        </div>
      </div>

      {/* Todo items */}
      {itinerary.todoItems.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="font-bold text-sm text-navy mb-4">未対応・要確認</h2>
          <div className="space-y-2">
            {itinerary.todoItems.map((todo, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 flex-shrink-0 ${
                  todo.priority === "high" ? "bg-red-100 text-red-600" :
                  todo.priority === "mid" ? "bg-amber-100 text-amber-700" :
                  "bg-gray-100 text-gray-500"
                }`}>
                  {todo.priority === "high" ? "高" : todo.priority === "mid" ? "中" : "低"}
                </span>
                <div>
                  <p className="text-sm font-medium">{todo.item}</p>
                  <p className="text-xs text-gray-400">{todo.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense list */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h2 className="font-bold text-sm text-navy mb-4">出費一覧（{expenses.length}件）</h2>
        {expenses.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">まだ記録がありません</p>
        ) : (
          <div className="divide-y">
            {expenses.map((e) => {
              const catInfo = CATEGORIES.find((c) => c.id === e.category);
              return (
                <div key={e.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg flex-shrink-0">{catInfo?.icon || "📦"}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{e.note || e.category}</p>
                      <p className="text-xs text-gray-400">
                        {e.expense_date?.split("T")[0]}
                        <span className={`ml-1 ${e.payer === "母" ? "text-purple-500" : "text-ocean"}`}>{e.payer}</span>
                        {e.currency !== "JPY" && ` · ${e.currency} ${Number(e.amount).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm flex-shrink-0 ml-2 ${Number(e.amount_jpy) < 0 ? "text-green-600" : "text-red-500"}`}>
                    {yen(Number(e.amount_jpy))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="text-center p-3 bg-white rounded-xl shadow-sm">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}
