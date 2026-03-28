"use client";
import { useState, useEffect, useMemo } from "react";
import { CURRENCIES, CATEGORIES, PHASES, type CurrencyCode } from "@/lib/constants";

type Rate = { currency: string; rate_to_jpy: string };

export default function AddExpense() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [form, setForm] = useState({
    expense_date: new Date().toISOString().split("T")[0],
    amount: "",
    currency: "USD" as CurrencyCode,
    phase: "A" as string,
    category: "食費",
    payer: "ケンジ",
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load rates
  useEffect(() => {
    fetch("/api/rates").then((r) => r.json()).then(setRates).catch(console.error);
  }, []);

  // Auto-detect phase from date
  useEffect(() => {
    const d = new Date(form.expense_date);
    if (d < new Date("2026-03-10")) setForm((f) => ({ ...f, phase: "P" }));
    else if (d < new Date("2026-03-26")) setForm((f) => ({ ...f, phase: "A" }));
    else if (d < new Date("2026-06-12")) setForm((f) => ({ ...f, phase: "B" }));
    else setForm((f) => ({ ...f, phase: "C" }));
  }, [form.expense_date]);

  // Auto-detect currency from phase
  useEffect(() => {
    if (form.phase === "B") setForm((f) => ({ ...f, currency: "USD" }));
  }, [form.phase]);

  const rate = useMemo(() => {
    const r = rates.find((r) => r.currency === form.currency);
    return r ? Number(r.rate_to_jpy) : (form.currency === "JPY" ? 1 : 160);
  }, [rates, form.currency]);

  const amountJpy = useMemo(() => {
    const amt = parseFloat(form.amount);
    return isNaN(amt) ? 0 : Math.round(amt * rate);
  }, [form.amount, rate]);

  const currInfo = CURRENCIES.find((c) => c.code === form.currency);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || amountJpy === 0) return;
    setSaving(true);
    try {
      await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          rate_used: rate,
          amount_jpy: amountJpy,
        }),
      });
      setSaved(true);
      setForm((f) => ({ ...f, amount: "", note: "" }));
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert("保存に失敗しました"); }
    setSaving(false);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-navy mb-6">出費を追加</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── 金額 + 通貨（メイン入力）── */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <label className="text-sm text-gray-500 block mb-2">金額</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              step="any"
              inputMode="decimal"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              className="flex-1 text-3xl font-bold text-navy border-b-2 border-ocean focus:border-amber-500 outline-none pb-1 bg-transparent"
              autoFocus
            />
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value as CurrencyCode })}
              className="text-lg font-bold bg-gray-100 rounded-lg px-3 py-2 border-none cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
          </div>

          {/* 即座にJPY換算を表示 */}
          {form.currency !== "JPY" && form.amount && (
            <div className="mt-3 bg-blue-50 rounded-xl px-4 py-3 text-center">
              <span className="text-sm text-gray-500">
                {currInfo?.flag} {currInfo?.symbol}{parseFloat(form.amount).toLocaleString()} × {rate}
              </span>
              <p className="text-2xl font-bold text-ocean">
                🇯🇵 ¥{amountJpy.toLocaleString()}
              </p>
              <button
                type="button"
                onClick={() => {
                  const newRate = prompt(`${form.currency}/JPY レートを入力:`, String(rate));
                  if (newRate) {
                    fetch("/api/rates", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ currency: form.currency, rate_to_jpy: parseFloat(newRate) }),
                    }).then(() => fetch("/api/rates").then(r => r.json()).then(setRates));
                  }
                }}
                className="text-xs text-ocean underline mt-1"
              >
                レート変更
              </button>
            </div>
          )}
        </div>

        {/* ── 日付・フェーズ ── */}
        <div className="bg-white rounded-2xl shadow-md p-5 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">日付</label>
            <input
              type="date"
              value={form.expense_date}
              onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">フェーズ</label>
            <div className="flex gap-1">
              {PHASES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm({ ...form, phase: p.id })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                    form.phase === p.id
                      ? "text-white shadow-md"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                  style={form.phase === p.id ? { backgroundColor: p.color } : {}}
                >
                  {p.emoji} {p.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── カテゴリ ── */}
        <div className="bg-white rounded-2xl shadow-md p-5">
          <label className="text-xs text-gray-500 block mb-2">カテゴリ</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setForm({ ...form, category: cat.id })}
                className={`py-2 rounded-xl text-xs font-medium transition border-2 ${
                  form.category === cat.id
                    ? "border-ocean bg-blue-50 text-ocean shadow-sm"
                    : "border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="block text-lg mb-0.5">{cat.icon}</span>
                {cat.id}
              </button>
            ))}
          </div>
        </div>

        {/* ── 支払者・メモ ── */}
        <div className="bg-white rounded-2xl shadow-md p-5 space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">支払者</label>
            <div className="flex gap-2">
              {["ケンジ", "母"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, payer: p })}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                    form.payer === p
                      ? "bg-navy text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">メモ</label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="例: パリの朝食、Uber代"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* ── 保存 ── */}
        <button
          type="submit"
          disabled={saving || !form.amount}
          className="w-full bg-ocean hover:bg-navy text-white font-bold py-4 rounded-2xl text-lg shadow-lg transition disabled:opacity-50"
        >
          {saving ? "保存中..." : saved ? "✅ 保存しました！" : `¥${amountJpy.toLocaleString()} を記録する`}
        </button>
      </form>

      {/* Quick add again */}
      {saved && (
        <p className="text-center text-sm text-green-600 mt-3">
          続けて入力できます。
          <a href="/" className="text-ocean underline ml-2">ダッシュボードへ →</a>
        </p>
      )}
    </div>
  );
}
