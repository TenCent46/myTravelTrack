// ─── 通貨マスタ ─────────────────────────────────────────────
export const CURRENCIES = [
  { code: "JPY", symbol: "¥",  name: "日本円",      flag: "🇯🇵", decimals: 0 },
  { code: "USD", symbol: "$",  name: "米ドル",      flag: "🇺🇸", decimals: 2 },
  { code: "EUR", symbol: "€",  name: "ユーロ",      flag: "🇪🇺", decimals: 2 },
  { code: "GBP", symbol: "£",  name: "英ポンド",    flag: "🇬🇧", decimals: 2 },
  { code: "HKD", symbol: "HK$",name: "香港ドル",    flag: "🇭🇰", decimals: 2 },
  { code: "CNY", symbol: "¥",  name: "中国人民元",  flag: "🇨🇳", decimals: 2 },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

// ─── カテゴリ ─────────────────────────────────────────────
export const CATEGORIES = [
  { id: "宿泊",      icon: "🏨", color: "#065A82" },
  { id: "食費",      icon: "🍽️", color: "#10B981" },
  { id: "交通",      icon: "🚃", color: "#F59E0B" },
  { id: "通信",      icon: "📱", color: "#7C3AED" },
  { id: "娯楽",      icon: "🎭", color: "#EF4444" },
  { id: "住居",      icon: "🏠", color: "#1C7293" },
  { id: "保険",      icon: "🛡️", color: "#64748B" },
  { id: "ビザ・手数料", icon: "📋", color: "#0B1D3A" },
  { id: "航空券",    icon: "✈️", color: "#2D6A8A" },
  { id: "予備費",    icon: "💰", color: "#F59E0B" },
  { id: "日用品",    icon: "🧴", color: "#6B7280" },
  { id: "損失",      icon: "💸", color: "#DC2626" },
  { id: "奨学金",    icon: "🎓", color: "#059669" },
  { id: "帰国旅行",  icon: "🌎", color: "#1C7293" },
  { id: "その他",    icon: "📦", color: "#9CA3AF" },
] as const;

export const PHASES = [
  { id: "P", name: "準備・出発前",   period: "〜3/10",       color: "#4B5563", emoji: "📦" },
  { id: "A", name: "春の旅行",      period: "3/10〜3/26",   color: "#1C5064", emoji: "✈️" },
  { id: "B", name: "シアトル留学",   period: "3/26〜6/12",   color: "#065A82", emoji: "📚" },
  { id: "C", name: "帰国旅行",      period: "6/12〜7/1",    color: "#1C7293", emoji: "🏠" },
] as const;

// ─── 予算サマリー定数 (160円レート) ─────────────────────────
export const BUDGET = {
  total_available: 1_980_000,
  rate: 160,
  kenji_total: 1_844_057,
  balance: 135_943,
  mom_total: 685_246,
  phases: {
    P: { kenji: 64_800 },
    A: { kenji: 218_782 },
    B: { kenji: 1_130_475, fixed: 340_395, var_cur: 790_080 },
    C: { kenji: 430_000 },
  },
} as const;
