"use client";
import { useEffect, useState, useCallback } from "react";
import { PHASES } from "@/lib/constants";

type Todo = {
  id: number;
  phase: string;
  title: string;
  detail: string;
  priority: "high" | "mid" | "low";
  done: boolean;
};

const PRIORITY_STYLES = {
  high: { bg: "bg-red-100", text: "text-red-600", label: "高" },
  mid:  { bg: "bg-amber-100", text: "text-amber-700", label: "中" },
  low:  { bg: "bg-gray-100", text: "text-gray-500", label: "低" },
};

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPhase, setFilterPhase] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterPhase) params.set("phase", filterPhase);
    const res = await fetch(`/api/todos?${params}`);
    setTodos(await res.json());
    setLoading(false);
  }, [filterPhase]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (todo: Todo) => {
    await fetch("/api/todos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: todo.id, done: !todo.done }),
    });
    load();
  };

  const deleteTodo = async (id: number) => {
    if (!confirm("このタスクを削除しますか？")) return;
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    load();
  };

  const pending = todos.filter((t) => !t.done);
  const completed = todos.filter((t) => t.done);
  const highCount = pending.filter((t) => t.priority === "high").length;

  if (loading) return <div className="text-center py-20 text-gray-400">読み込み中...</div>;

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Todoリスト</h1>
          <p className="text-xs text-gray-400">
            {pending.length}件未完了
            {highCount > 0 && <span className="text-red-500 ml-1">({highCount}件 高優先)</span>}
          </p>
        </div>
        <a href="/" className="text-sm text-gray-400 hover:text-gray-600">&larr; ダッシュボード</a>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => { setAdding(true); setEditing(null); }}
          className="bg-ocean text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-navy transition"
        >
          + タスク追加
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => setFilterPhase("")}
            className={`px-2.5 py-1 text-xs rounded-lg ${!filterPhase ? "bg-navy text-white" : "bg-gray-100 text-gray-500"}`}
          >
            全て
          </button>
          {PHASES.map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterPhase(p.id)}
              className={`px-2.5 py-1 text-xs rounded-lg ${filterPhase === p.id ? "bg-navy text-white" : "bg-gray-100 text-gray-500"}`}
            >
              {p.emoji} {p.id}
            </button>
          ))}
        </div>
      </div>

      {/* Add/Edit Form */}
      {(adding || editing) && (
        <TodoForm
          item={editing}
          onSave={async (item) => {
            if (item.id) {
              await fetch("/api/todos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) });
            } else {
              await fetch("/api/todos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) });
            }
            setEditing(null);
            setAdding(false);
            load();
          }}
          onCancel={() => { setEditing(null); setAdding(false); }}
        />
      )}

      {/* Pending */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {pending.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">全て完了！</p>
        ) : (
          <div className="divide-y">
            {pending.map((todo) => (
              <TodoRow key={todo.id} todo={todo} onToggle={toggle} onEdit={setEditing} onDelete={deleteTodo} />
            ))}
          </div>
        )}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <button
            onClick={() => setShowDone(!showDone)}
            className="text-sm text-gray-400 hover:text-gray-600 mb-2"
          >
            {showDone ? "▼" : "▶"} 完了済み ({completed.length}件)
          </button>
          {showDone && (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden opacity-60">
              <div className="divide-y">
                {completed.map((todo) => (
                  <TodoRow key={todo.id} todo={todo} onToggle={toggle} onEdit={setEditing} onDelete={deleteTodo} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TodoRow({ todo, onToggle, onEdit, onDelete }: {
  todo: Todo;
  onToggle: (t: Todo) => void;
  onEdit: (t: Todo) => void;
  onDelete: (id: number) => void;
}) {
  const ps = PRIORITY_STYLES[todo.priority];
  const phaseInfo = PHASES.find((p) => p.id === todo.phase);

  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 group">
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
          todo.done ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-ocean"
        }`}
      >
        {todo.done && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-medium ${todo.done ? "line-through text-gray-400" : "text-gray-800"}`}>
            {todo.title}
          </p>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${ps.bg} ${ps.text}`}>
            {ps.label}
          </span>
          {phaseInfo && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {phaseInfo.emoji} {phaseInfo.id}
            </span>
          )}
        </div>
        {todo.detail && (
          <p className={`text-xs mt-0.5 ${todo.done ? "text-gray-300" : "text-gray-400"}`}>{todo.detail}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
        <button onClick={() => onEdit(todo)} className="text-ocean hover:text-navy text-xs px-1">編集</button>
        <button onClick={() => onDelete(todo.id)} className="text-red-400 hover:text-red-600 text-xs px-1">削除</button>
      </div>
    </div>
  );
}

function TodoForm({ item, onSave, onCancel }: {
  item: Todo | null;
  onSave: (item: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    id: item?.id || 0,
    phase: item?.phase || "A",
    title: item?.title || "",
    detail: item?.detail || "",
    priority: item?.priority || "mid",
    done: item?.done || false,
  });

  return (
    <div className="bg-blue-50 rounded-2xl p-5 space-y-3">
      <h3 className="font-bold text-sm text-navy">{item ? "タスクを編集" : "タスクを追加"}</h3>
      <div>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="タスク名"
          className="w-full border rounded-lg px-3 py-2 text-sm font-medium"
          autoFocus
        />
      </div>
      <div>
        <input
          value={form.detail}
          onChange={(e) => setForm({ ...form, detail: e.target.value })}
          placeholder="詳細（任意）"
          className="w-full border rounded-lg px-3 py-2 text-sm text-gray-600"
        />
      </div>
      <div className="flex gap-3 flex-wrap">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Phase</label>
          <div className="flex gap-1">
            {PHASES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setForm({ ...form, phase: p.id })}
                className={`px-2.5 py-1 text-xs rounded-lg font-bold ${
                  form.phase === p.id ? "text-white" : "bg-gray-100 text-gray-500"
                }`}
                style={form.phase === p.id ? { backgroundColor: p.color } : {}}
              >
                {p.emoji} {p.id}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">優先度</label>
          <div className="flex gap-1">
            {(["high", "mid", "low"] as const).map((pr) => {
              const ps = PRIORITY_STYLES[pr];
              return (
                <button
                  key={pr}
                  type="button"
                  onClick={() => setForm({ ...form, priority: pr })}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold ${
                    form.priority === pr ? `${ps.bg} ${ps.text}` : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {ps.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => {
            if (!form.title.trim()) return;
            onSave({ ...form, id: form.id || undefined });
          }}
          disabled={!form.title.trim()}
          className="bg-ocean text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-navy transition disabled:opacity-50"
        >
          {item ? "更新" : "追加"}
        </button>
        <button onClick={onCancel} className="text-gray-400 text-sm px-4 py-2 hover:text-gray-600">キャンセル</button>
      </div>
    </div>
  );
}
