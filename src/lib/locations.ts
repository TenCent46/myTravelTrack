// Date → location mapping for the trip
export type DayInfo = {
  city: string;
  country: string;
  flag: string;
  summary: string;
  highlight?: string;
};

export function getDayInfo(dateStr: string): DayInfo | null {
  const d = new Date(dateStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();

  // Phase P: Japan prep
  if (m < 3 || (m === 3 && day < 10)) {
    return { city: "日本", country: "Japan", flag: "🇯🇵", summary: "出発準備" };
  }

  // Phase A
  if (m === 3 && day === 10) return { city: "成田→香港", country: "Hong Kong", flag: "🇭🇰", summary: "HX605で香港へ出発", highlight: "旅の始まり" };
  if (m === 3 && day === 11) return { city: "香港", country: "Hong Kong", flag: "🇭🇰", summary: "香港観光・ローカルフード巡り", highlight: "Octopusカードで移動" };
  if (m === 3 && day === 12) return { city: "香港→北京", country: "China", flag: "🇨🇳", summary: "CA764で北京大興空港へ", highlight: "空港泊・乗継" };
  if (m === 3 && day === 13) return { city: "北京→パリ", country: "France", flag: "🇫🇷", summary: "CA933で CDG着、Bellevilleへ", highlight: "ヨーロッパ上陸" };
  if (m === 3 && day === 14) return { city: "パリ", country: "France", flag: "🇫🇷", summary: "パリ散策開始、St Christopher's Inn泊" };
  if (m === 3 && day === 15) return { city: "パリ", country: "France", flag: "🇫🇷", summary: "パリ観光、Navigo乗り放題で移動" };
  if (m === 3 && day === 16) return { city: "パリ", country: "France", flag: "🇫🇷", summary: "Cafe Flore・Chez Aldo、ユーロスター予約", highlight: "Cafe Flore ¥5,055" };
  if (m === 3 && day === 17) return { city: "パリ→ロンドン", country: "UK", flag: "🇬🇧", summary: "ユーロスターでロンドンへ、St Pancras着" };
  if (m === 3 && day === 18) return { city: "バーミンガム日帰", country: "UK", flag: "🇬🇧", summary: "Avanti West Coastでバーミンガム往復", highlight: "電車代 ¥15,504" };
  if (m === 3 && day === 19) return { city: "ロンドン→マドリード", country: "Spain", flag: "🇪🇸", summary: "BA458 早朝LHR発→マドリード着、タパス巡り", highlight: "P.LOS GALAYOS ¥4,667" };
  if (m === 3 && day === 20) return { city: "マドリード", country: "Spain", flag: "🇪🇸", summary: "トレド方面Renfe・Farmacia・OUIGO予約", highlight: "MAD→BCN OUIGO ¥10,294" };
  if (m === 3 && day === 21) return { city: "マドリード→トレド", country: "Spain", flag: "🇪🇸", summary: "トレド日帰り、Casa Batllo、Restaurante Pinilla", highlight: "トレド大聖堂・カサバトリョ" };
  if (m === 3 && day === 22) return { city: "マドリード→バルセロナ", country: "Spain", flag: "🇪🇸", summary: "高速列車でBCN移動、Mellow Apartments泊", highlight: "Esmeralda Ocio ¥27,266" };
  if (m === 3 && day === 23) return { city: "バルセロナ", country: "Spain", flag: "🇪🇸", summary: "Tapas Nolla・Restaurante Colom・Luiza Bakery" };
  if (m === 3 && day === 24) return { city: "バルセロナ", country: "Spain", flag: "🇪🇸", summary: "Donde Tito・Arepa y Pan・海沿い散歩" };
  if (m === 3 && day === 25) return { city: "バルセロナ", country: "Spain", flag: "🇪🇸", summary: "最終日、Bar Portio・空港へ移動", highlight: "翌朝03:30起き" };
  if (m === 3 && day === 26) return { city: "BCN→FRA→シアトル", country: "USA", flag: "🇺🇸", summary: "LH1139→UA8717 シアトル着13:10", highlight: "シアトル生活スタート" };

  // Phase B: Seattle
  if (m >= 3 && m <= 6 && !(m === 6 && day > 12)) {
    return { city: "シアトル", country: "USA", flag: "🇺🇸", summary: "UW Elm Hall 留学生活" };
  }

  // Phase C
  return { city: "帰国旅行", country: "", flag: "🌎", summary: "南米・カナダ旅行" };
}

export const CITY_COLORS: Record<string, string> = {
  "日本": "#DC2626",
  "香港": "#F59E0B",
  "成田→香港": "#F59E0B",
  "香港→北京": "#EAB308",
  "北京→パリ": "#3B82F6",
  "パリ": "#3B82F6",
  "パリ→ロンドン": "#6366F1",
  "ロンドン→マドリード": "#8B5CF6",
  "バーミンガム日帰": "#6366F1",
  "マドリード": "#EF4444",
  "マドリード→トレド": "#EF4444",
  "マドリード→バルセロナ": "#F97316",
  "バルセロナ": "#F97316",
  "BCN→FRA→シアトル": "#059669",
  "シアトル": "#059669",
};
