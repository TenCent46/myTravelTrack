"use client";
import { useEffect, useState, useCallback } from "react";
import { PHASES, CATEGORIES } from "@/lib/constants";

function yen(n: number) {
  return n < 0 ? `▲¥${Math.abs(n).toLocaleString()}` : `¥${n.toLocaleString()}`;
}

type BudgetItem = {
  id: number;
  phase: string;
  category: string;
  subcategory: string;
  planned_jpy: number;
  payer: string;
  status: string;
  note: string;
};

type Expense = {
  id: number;
  expense_date: string;
  amount: number;
  currency: string;
  rate_used: number;
  amount_jpy: number;
  phase: string;
  category: string;
  payer: string;
  note: string;
};

const STATUSES = ["見込み", "確定", "支払済み", "未予約", "未払い", "現地払い", "発券済み", "支払完了", "損失確定", "収入"];

export default function ManagePage() {
  const [tab, setTab] = useState<"budget" | "expenses">("budget");
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [filterPhase, setFilterPhase] = useState<string>("");

  const loadBudget = useCallback(async () => {
    const url = filterPhase ? `/api/budget?phase=${filterPhase}` : "/api/budget";
    const res = await fetch(url);
    setBudgetItems(await res.json());
  }, [filterPhase]);

  const loadExpenses = useCallback(async () => {
    const url = filterPhase ? `/api/expenses?phase=${filterPhase}&limit=200` : "/api/expenses?limit=200";
    const res = await fetch(url);
    setExpenses(await res.json());
  }, [filterPhase]);

  useEffect(() => {
    Promise.all([loadBudget(), loadExpenses()]).then(() => setLoading(false));
  }, [loadBudget, loadExpenses]);

  if (loading) return <div className="text-center py-20 text-gray-400">読み込み中...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy">データ管理</h1>
        <a href="/" className="text-sm text-gray-400 hover:text-gray-600">&larr; ダッシュボード</a>
      </div>

      {/* Tabs + Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-gray-200 rounded-lg p-0.5">
          <button
            onClick={() => setTab("budget")}
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${tab === "budget" ? "bg-white text-navy shadow-sm" : "text-gray-500"}`}
          >
            予算項目 ({budgetItems.length})
          </button>
          <button
            onClick={() => setTab("expenses")}
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${tab === "expenses" ? "bg-white text-navy shadow-sm" : "text-gray-500"}`}
          >
            出費記録 ({expenses.length})
          </button>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setFilterPhase("")}
            className={`px-2 py-1 text-xs rounded ${!filterPhase ? "bg-navy text-white" : "bg-gray-100 text-gray-500"}`}
          >
            全て
          </button>
          {PHASES.map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterPhase(p.id)}
              className={`px-2 py-1 text-xs rounded ${filterPhase === p.id ? "bg-navy text-white" : "bg-gray-100 text-gray-500"}`}
            >
              {p.emoji} {p.id}
            </button>
          ))}
        </div>
      </div>

      {/* Budget Tab */}
      {tab === "budget" && (
        <div className="space-y-3">
          <button
            onClick={() => { setShowAddBudget(true); setEditingBudget(null); }}
            className="bg-ocean text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-navy transition"
          >
            + 予算項目を追加
          </button>

          {(showAddBudget || editingBudget) && (
            <BudgetForm
              item={editingBudget}
              onSave={async (item) => {
                if (item.id) {
                  await fetch("/api/budget", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) });
                } else {
                  await fetch("/api/budget", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) });
                }
                setEditingBudget(null);
                setShowAddBudget(false);
                loadBudget();
              }}
              onCancel={() => { setEditingBudget(null); setShowAddBudget(false); }}
            />
          )}

          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="text-left px-3 py-2">Phase</th>
                  <th className="text-left px-3 py-2">カテゴリ</th>
                  <th className="text-left px-3 py-2">項目</th>
                  <th className="text-right px-3 py-2">計画額</th>
                  <th className="text-left px-3 py-2">支払者</th>
                  <th className="text-left px-3 py-2">状態</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {budgetItems.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-bold">{b.phase}</td>
                    <td className="px-3 py-2">{CATEGORIES.find(c => c.id === b.category)?.icon} {b.category}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{b.subcategory}</td>
                    <td className="px-3 py-2 text-right font-bold">{yen(Number(b.planned_jpy))}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${b.payer === "母" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {b.payer}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">{b.status}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditingBudget(b); setShowAddBudget(false); }}
                          className="text-ocean hover:text-navy text-xs"
                        >
                          編集
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`「${b.subcategory || b.category}」を削除しますか？`)) return;
                            await fetch(`/api/budget?id=${b.id}`, { method: "DELETE" });
                            loadBudget();
                          }}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {tab === "expenses" && (
        <div className="space-y-3">
          <a href="/add" className="inline-block bg-ocean text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-navy transition">
            + 出費を追加
          </a>

          {editingExpense && (
            <ExpenseForm
              item={editingExpense}
              onSave={async (item) => {
                await fetch("/api/expenses", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) });
                setEditingExpense(null);
                loadExpenses();
              }}
              onCancel={() => setEditingExpense(null)}
            />
          )}

          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="text-left px-3 py-2">日付</th>
                  <th className="text-left px-3 py-2">Ph</th>
                  <th className="text-left px-3 py-2">カテゴリ</th>
                  <th className="text-left px-3 py-2">メモ</th>
                  <th className="text-right px-3 py-2">金額</th>
                  <th className="text-right px-3 py-2">JPY</th>
                  <th className="text-left px-3 py-2">支払者</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-xs">{String(e.expense_date).split("T")[0]}</td>
                    <td className="px-3 py-2 font-bold">{e.phase}</td>
                    <td className="px-3 py-2">
                      {CATEGORIES.find(c => c.id === e.category)?.icon} {e.category}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500 max-w-[200px] truncate">{e.note}</td>
                    <td className="px-3 py-2 text-right text-xs">
                      {e.currency !== "JPY" ? `${e.currency} ${Number(e.amount).toLocaleString()}` : ""}
                    </td>
                    <td className="px-3 py-2 text-right font-bold">{yen(Number(e.amount_jpy))}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${e.payer === "母" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {e.payer}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button onClick={() => setEditingExpense(e)} className="text-ocean hover:text-navy text-xs">
                          編集
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`この出費を削除しますか？`)) return;
                            await fetch(`/api/expenses?id=${e.id}`, { method: "DELETE" });
                            loadExpenses();
                          }}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Budget Form ── */
function BudgetForm({ item, onSave, onCancel }: {
  item: BudgetItem | null;
  onSave: (item: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    id: item?.id || 0,
    phase: item?.phase || "A",
    category: item?.category || "食費",
    subcategory: item?.subcategory || "",
    planned_jpy: item?.planned_jpy ? String(item.planned_jpy) : "",
    payer: item?.payer || "ケンジ",
    status: item?.status || "見込み",
    note: item?.note || "",
  });

  return (
    <div className="bg-blue-50 rounded-2xl p-5 space-y-3">
      <h3 className="font-bold text-sm text-navy">{item ? "予算項目を編集" : "予算項目を追加"}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-gray-500">Phase</label>
          <select value={form.phase} onChange={e => setForm({...form, phase: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm">
            {PHASES.map(p => <option key={p.id} value={p.id}>{p.id}: {p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">カテゴリ</label>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm">
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.id}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">支払者</label>
          <select value={form.payer} onChange={e => setForm({...form, payer: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm">
            <option value="ケンジ">ケンジ</option>
            <option value="母">母</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">状態</label>
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm">
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500">項目名</label>
          <input value={form.subcategory} onChange={e => setForm({...form, subcategory: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm" placeholder="例: ユーロスター" />
        </div>
        <div>
          <label className="text-xs text-gray-500">計画額（円）</label>
          <input type="number" value={form.planned_jpy} onChange={e => setForm({...form, planned_jpy: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm" placeholder="10000" />
        </div>
        <div>
          <label className="text-xs text-gray-500">メモ</label>
          <input value={form.note} onChange={e => setForm({...form, note: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm" placeholder="備考" />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ ...form, planned_jpy: Number(form.planned_jpy), id: form.id || undefined })}
          className="bg-ocean text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-navy transition"
        >
          {item ? "更新" : "追加"}
        </button>
        <button onClick={onCancel} className="text-gray-400 text-sm px-4 py-2 hover:text-gray-600">キャンセル</button>
      </div>
    </div>
  );
}

/* ── Expense Edit Form ── */
function ExpenseForm({ item, onSave, onCancel }: {
  item: Expense;
  onSave: (item: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    id: item.id,
    expense_date: String(item.expense_date).split("T")[0],
    amount: String(item.amount),
    currency: item.currency,
    rate_used: String(item.rate_used),
    amount_jpy: String(item.amount_jpy),
    phase: item.phase,
    category: item.category,
    payer: item.payer,
    note: item.note || "",
  });

  return (
    <div className="bg-amber-50 rounded-2xl p-5 space-y-3">
      <h3 className="font-bold text-sm text-navy">出費を編集</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-gray-500">日付</label>
          <input type="date" value={form.expense_date} onChange={e => setForm({...form, expense_date: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Phase</label>
          <select value={form.phase} onChange={e => setForm({...form, phase: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm">
            {PHASES.map(p => <option key={p.id} value={p.id}>{p.id}: {p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">カテゴリ</label>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm">
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.id}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">支払者</label>
          <select value={form.payer} onChange={e => setForm({...form, payer: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm">
            <option value="ケンジ">ケンジ</option>
            <option value="母">母</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-gray-500">金額</label>
          <input type="number" step="any" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500">通貨</label>
          <input value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500">レート</label>
          <input type="number" step="any" value={form.rate_used} onChange={e => setForm({...form, rate_used: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500">JPY額</label>
          <input type="number" value={form.amount_jpy} onChange={e => setForm({...form, amount_jpy: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm" />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500">メモ</label>
        <input value={form.note} onChange={e => setForm({...form, note: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm" />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave({
            ...form,
            amount: Number(form.amount),
            rate_used: Number(form.rate_used),
            amount_jpy: Number(form.amount_jpy),
          })}
          className="bg-ocean text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-navy transition"
        >
          更新
        </button>
        <button onClick={onCancel} className="text-gray-400 text-sm px-4 py-2 hover:text-gray-600">キャンセル</button>
      </div>
    </div>
  );
}
