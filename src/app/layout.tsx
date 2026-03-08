import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "旅費トラッカー | 畑中健司 2026",
  description: "2026春〜夏 欧州・シアトル留学 財務トラッカー",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        {/* ── ナビ ── */}
        <nav className="bg-navy text-white sticky top-0 z-50 shadow-lg">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-bold text-lg tracking-tight">
              💰 旅費トラッカー
            </a>
            <div className="flex gap-3 text-sm items-center">
              <a href="/" className="hover:text-amber-300 transition">TOP</a>
              <a href="/phase/A" className="hover:text-amber-300 transition">A</a>
              <a href="/phase/B" className="hover:text-amber-300 transition">B</a>
              <a href="/phase/C" className="hover:text-amber-300 transition">C</a>
              <a href="/todos" className="hover:text-amber-300 transition">Todo</a>
              <a href="/manage" className="hover:text-amber-300 transition">管理</a>
              <a href="/add" className="bg-amber-500 hover:bg-amber-400 text-navy font-bold px-3 py-1 rounded-full transition">
                ＋ 追加
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
