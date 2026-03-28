"use client";
import { useEffect, useState, useCallback } from "react";
import { CATEGORIES, PHASES } from "@/lib/constants";
import { getDayInfo, CITY_COLORS } from "@/lib/locations";

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

type DayGroup = {
  date: string;
  expenses: Expense[];
  total: number;
  food: Expense[];
  transport: Expense[];
  activities: Expense[];
  other: Expense[];
};

function yen(n: number) {
  return n < 0 ? `▲¥${Math.abs(n).toLocaleString()}` : `¥${n.toLocaleString()}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getMonth() + 1}/${d.getDate()} (${weekdays[d.getDay()]})`;
}

export default function MemoriesPage() {
  const [days, setDays] = useState<DayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPhase, setFilterPhase] = useState("");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/diary");
    const expenses: Expense[] = await res.json();

    // Group by date
    const map = new Map<string, Expense[]>();
    expenses.forEach((e) => {
      const dateKey = String(e.expense_date).split("T")[0];
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(e);
    });

    const grouped: DayGroup[] = [];
    map.forEach((exps, date) => {
      const food = exps.filter((e) => ["食費"].includes(e.category));
      const transport = exps.filter((e) => ["交通"].includes(e.category));
      const activities = exps.filter((e) => ["娯楽", "宿泊"].includes(e.category));
      const other = exps.filter(
        (e) => !["食費", "交通", "娯楽", "宿泊"].includes(e.category)
      );
      grouped.push({
        date,
        expenses: exps,
        total: exps.reduce((a, e) => a + Number(e.amount_jpy), 0),
        food,
        transport,
        activities,
        other,
      });
    });

    grouped.sort((a, b) => a.date.localeCompare(b.date));
    setDays(grouped);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filterPhase
    ? days.filter((d) => d.expenses.some((e) => e.phase === filterPhase))
    : days;

  // Only trip days (Phase A)
  const tripDays = days.filter((d) =>
    d.expenses.some((e) => e.phase === "A")
  );

  // Stats
  const totalFood = tripDays.reduce(
    (a, d) => a + d.food.reduce((s, e) => s + Number(e.amount_jpy), 0), 0
  );
  const totalTransport = tripDays.reduce(
    (a, d) => a + d.transport.reduce((s, e) => s + Number(e.amount_jpy), 0), 0
  );
  const biggestDay = [...tripDays].sort((a, b) => b.total - a.total)[0];
  const biggestMeal = tripDays
    .flatMap((d) => d.food)
    .sort((a, b) => Number(b.amount_jpy) - Number(a.amount_jpy))[0];

  if (loading)
    return (
      <div className="text-center py-20 text-gray-400">読み込み中...</div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-navy">旅の思い出</h1>
        <p className="text-sm text-gray-400 mt-1">
          世界一周旅行 2026 &mdash; 香港・パリ・ロンドン・マドリード・バルセロナ・シアトル
        </p>
      </div>

      {/* Trip stats */}
      {tripDays.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-amber-50 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-navy mb-3">旅の数字</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-ocean">{tripDays.length}</p>
              <p className="text-xs text-gray-500">旅した日数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {tripDays.reduce((a, d) => a + d.food.length, 0)}
              </p>
              <p className="text-xs text-gray-500">食事の回数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{yen(totalFood)}</p>
              <p className="text-xs text-gray-500">食費トータル</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{yen(totalTransport)}</p>
              <p className="text-xs text-gray-500">交通費トータル</p>
            </div>
          </div>
          {biggestDay && (
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 space-y-1">
              <p>
                一番お金を使った日:{" "}
                <strong>{formatDate(biggestDay.date)}</strong> {yen(biggestDay.total)}
              </p>
              {biggestMeal && (
                <p>
                  一番高い食事:{" "}
                  <strong>{biggestMeal.note}</strong> {yen(Number(biggestMeal.amount_jpy))}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Phase filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterPhase("")}
          className={`px-3 py-1.5 text-xs rounded-full font-bold transition ${
            !filterPhase ? "bg-navy text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          全期間
        </button>
        {PHASES.map((p) => (
          <button
            key={p.id}
            onClick={() => setFilterPhase(p.id)}
            className={`px-3 py-1.5 text-xs rounded-full font-bold transition ${
              filterPhase === p.id ? "text-white" : "bg-gray-100 text-gray-500"
            }`}
            style={filterPhase === p.id ? { backgroundColor: p.color } : {}}
          >
            {p.emoji} {p.name}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {filtered.map((day, i) => {
          const info = getDayInfo(day.date);
          const cityColor = info ? CITY_COLORS[info.city] || "#6B7280" : "#6B7280";
          const isExpanded = expandedDay === day.date;
          const prevDay = i > 0 ? filtered[i - 1] : null;
          const prevInfo = prevDay ? getDayInfo(prevDay.date) : null;
          const cityChanged = !prevInfo || prevInfo?.city !== info?.city;

          return (
            <div key={day.date}>
              {/* City change marker */}
              {cityChanged && info && (
                <div className="flex items-center gap-2 py-3">
                  <div
                    className="h-0.5 flex-1"
                    style={{ backgroundColor: cityColor }}
                  />
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: cityColor }}
                  >
                    {info.flag} {info.city}
                  </span>
                  <div
                    className="h-0.5 flex-1"
                    style={{ backgroundColor: cityColor }}
                  />
                </div>
              )}

              {/* Day card */}
              <div
                className="bg-white rounded-2xl shadow-sm mb-3 overflow-hidden cursor-pointer hover:shadow-md transition"
                onClick={() => setExpandedDay(isExpanded ? null : day.date)}
              >
                {/* Day header */}
                <div className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1 h-10 rounded-full"
                      style={{ backgroundColor: cityColor }}
                    />
                    <div>
                      <p className="font-bold text-sm text-gray-800">
                        {formatDate(day.date)}
                      </p>
                      {info && (
                        <p className="text-xs text-gray-400">{info.summary}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: cityColor }}>
                      {yen(day.total)}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {day.expenses.length}件
                    </p>
                  </div>
                </div>

                {/* Highlight badge */}
                {info?.highlight && (
                  <div className="px-5 pb-2">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: cityColor }}
                    >
                      {info.highlight}
                    </span>
                  </div>
                )}

                {/* Quick food preview (always show) */}
                {day.food.length > 0 && !isExpanded && (
                  <div className="px-5 pb-3">
                    <p className="text-xs text-gray-400">
                      <span className="mr-1">🍽️</span>
                      {day.food
                        .slice(0, 3)
                        .map((f) => f.note || f.category)
                        .join("、")}
                      {day.food.length > 3 && ` 他${day.food.length - 3}件`}
                    </p>
                  </div>
                )}

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-4 space-y-3 border-t border-gray-100 pt-3">
                    {/* Food */}
                    {day.food.length > 0 && (
                      <CategorySection
                        title="食べたもの"
                        icon="🍽️"
                        items={day.food}
                        color="#10B981"
                      />
                    )}

                    {/* Activities */}
                    {day.activities.length > 0 && (
                      <CategorySection
                        title="行った場所・宿泊"
                        icon="🎭"
                        items={day.activities}
                        color="#8B5CF6"
                      />
                    )}

                    {/* Transport */}
                    {day.transport.length > 0 && (
                      <CategorySection
                        title="移動"
                        icon="🚃"
                        items={day.transport}
                        color="#F59E0B"
                      />
                    )}

                    {/* Other */}
                    {day.other.length > 0 && (
                      <CategorySection
                        title="その他"
                        icon="📦"
                        items={day.other}
                        color="#6B7280"
                      />
                    )}

                    {/* Day total */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-400">この日の合計</span>
                      <span className="font-bold text-sm" style={{ color: cityColor }}>
                        {yen(day.total)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategorySection({
  title,
  icon,
  items,
  color,
}: {
  title: string;
  icon: string;
  items: Expense[];
  color: string;
}) {
  const total = items.reduce((a, e) => a + Number(e.amount_jpy), 0);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold" style={{ color }}>
          {icon} {title}
        </p>
        <p className="text-xs font-bold" style={{ color }}>
          {yen(total)}
        </p>
      </div>
      <div className="space-y-1">
        {items.map((e) => {
          const catInfo = CATEGORIES.find((c) => c.id === e.category);
          return (
            <div
              key={e.id}
              className="flex items-center justify-between text-xs py-0.5"
            >
              <span className="text-gray-600 truncate mr-2">
                {catInfo?.icon} {e.note || e.category}
                {e.currency !== "JPY" && (
                  <span className="text-gray-300 ml-1">
                    ({e.currency} {Number(e.amount).toLocaleString()})
                  </span>
                )}
              </span>
              <span className="text-gray-500 flex-shrink-0 font-medium">
                {yen(Number(e.amount_jpy))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
