export type ItineraryItem = {
  date: string;
  city: string;
  detail: string;
  status: "confirmed" | "pending" | "tbd";
};

export type TodoItem = {
  item: string;
  detail: string;
  priority: "high" | "mid" | "low";
};

export type PhaseItinerary = {
  id: string;
  title: string;
  period: string;
  days: number;
  route: string;
  items: ItineraryItem[];
  todoItems: TodoItem[];
};

export const ITINERARIES: Record<string, PhaseItinerary> = {
  P: {
    id: "P",
    title: "準備・出発前",
    period: "〜3/10",
    days: 0,
    route: "日本（出発準備）",
    items: [
      { date: "1月", city: "日本", detail: "J-1ビザ申請料（MRV fee）$185 支払い", status: "confirmed" },
      { date: "1月", city: "日本", detail: "SEVIS I-901費 $220 支払い", status: "confirmed" },
      { date: "2月", city: "日本", detail: "ビザ面接・取得", status: "confirmed" },
      { date: "2月", city: "日本", detail: "航空券手配（母担当）", status: "confirmed" },
      { date: "2-3月", city: "日本", detail: "航空券変更対応・損失確定", status: "confirmed" },
      { date: "3月上旬", city: "日本", detail: "宿泊予約・旅程最終確認", status: "confirmed" },
    ],
    todoItems: [],
  },
  A: {
    id: "A",
    title: "春の旅行",
    period: "3/10〜3/26",
    days: 17,
    route: "香港 → パリ → ロンドン → マドリード → トレド → バルセロナ → シアトル",
    items: [
      { date: "3/10 (火)", city: "成田→香港", detail: "HX605 14:25発→18:45着", status: "confirmed" },
      { date: "3/10-12", city: "香港", detail: "Yesinn@YMT 2泊（¥6,007）ドミトリー", status: "confirmed" },
      { date: "3/12 (木)", city: "香港→北京", detail: "CA764 17:40発→20:55着（北京大興）", status: "confirmed" },
      { date: "3/13 (金)", city: "北京→パリ", detail: "CA933 13:30発→17:45着 (CDG) ※空港変更あり", status: "confirmed" },
      { date: "3/13-14", city: "パリ", detail: "The People Belleville 1泊（¥7,262）6人ドミ", status: "confirmed" },
      { date: "3/14-16", city: "パリ", detail: "St Christopher's Inn 2泊（¥11,788）8人ドミ", status: "confirmed" },
      { date: "3/16-17", city: "パリ", detail: "Libertel Gare de l'Est 1泊（¥20,122）シングル", status: "confirmed" },
      { date: "3/17 (火)", city: "パリ→ロンドン", detail: "ユーロスター Gare du Nord→St Pancras（約2h15m）", status: "pending" },
      { date: "3/17-19", city: "ロンドン", detail: "Shakespeare Hotel 2泊（¥42,907）Paddington ダブル", status: "confirmed" },
      { date: "3/18 (水)", city: "バーミンガム日帰", detail: "Paddington→Birmingham 電車往復（約1.5〜2h）", status: "pending" },
      { date: "3/19 (木)", city: "LHR→マドリード", detail: "BA458 07:30発→11:00着（¥26,680）※早朝Paddington→LHR Elizabeth Line", status: "confirmed" },
      { date: "3/19-22", city: "マドリード", detail: "Latroupe Prado 2泊確定＋1泊追加要（4人ドミ）", status: "confirmed" },
      { date: "3/20or21", city: "トレド日帰り", detail: "Atocha駅→トレド Renfe Avant（約30分）大聖堂・アルカサル・展望台", status: "pending" },
      { date: "3/21 (土)", city: "マドリード", detail: "王宮→マヨール広場→サンミゲル市場→レティーロ公園→タパスバー", status: "confirmed" },
      { date: "3/22 (日)", city: "MAD→バルセロナ", detail: "AVE/OUIGO/Iryo高速列車（約2.5h）", status: "pending" },
      { date: "3/22-25", city: "バルセロナ", detail: "Mellow Barcelona 3泊（¥9,675前払い＋市税¥3,024）", status: "confirmed" },
      { date: "3/23 (月)", city: "バルセロナ", detail: "サグラダ・ファミリア→グエル公園→カサ・バトリョ→ボケリア市場", status: "confirmed" },
      { date: "3/24 (火)", city: "バルセロナ", detail: "バルセロネータビーチ→ボルン地区→パエリア", status: "confirmed" },
      { date: "3/25 (水)", city: "バルセロナ", detail: "予備日→荷造り→早めの就寝（翌朝03:30起き）", status: "confirmed" },
      { date: "3/26 (木)", city: "BCN→FRA→SEA", detail: "LH1139 05:50発→FRA乗継→UA8717→13:10着", status: "confirmed" },
    ],
    todoItems: [
      { item: "eSIM Firsty Premium購入", detail: "欧州全域1日5GB ¥12,560 出発前に必須", priority: "high" },
      { item: "ユーロスター予約", detail: "パリ→ロンドン 3/17 ¥8,000〜12,000", priority: "high" },
      { item: "MAD追加1泊", detail: "3/21-22 Latroupeは3/19-21のみ確定", priority: "high" },
      { item: "サグラダ・ファミリア予約", detail: "事前予約必須（売切注意）", priority: "high" },
      { item: "¥132,110航空券確認", detail: "別日程QR便 正式キャンセル確認・返金可能性", priority: "high" },
      { item: "バーミンガム電車予約", detail: "Paddington⇔Birmingham 3/18 往復 ¥5,000〜10,000", priority: "mid" },
      { item: "スペイン国内列車予約", detail: "MAD⇔Toledo往復 + MAD→BCN ¥5,500〜7,500", priority: "mid" },
    ],
  },
  B: {
    id: "B",
    title: "シアトル留学",
    period: "3/26〜6/12",
    days: 80,
    route: "シアトル（UW Elm Hall 418-3）",
    items: [
      { date: "3/26 (木)", city: "シアトル着", detail: "SEA到着 13:10、UW Elm Hall チェックイン", status: "confirmed" },
      { date: "3/26-6/12", city: "シアトル", detail: "UW Elm Hall 418-3 三人部屋・プライベートバス（約80日間）", status: "confirmed" },
      { date: "3/31", city: "シアトル", detail: "春学期開始", status: "confirmed" },
      { date: "6/6", city: "シアトル", detail: "春学期終了", status: "confirmed" },
      { date: "6/12", city: "シアトル", detail: "Elm Hall チェックアウト", status: "confirmed" },
    ],
    todoItems: [
      { item: "T-Mobile eSIM購入", detail: "月50GB 3ヶ月 ¥20,300 シアトル着後すぐ", priority: "high" },
    ],
  },
  C: {
    id: "C",
    title: "帰国旅行",
    period: "6/12〜7/1",
    days: 20,
    route: "南米・カナダ（ウユニ塩湖＋トロント）→ 日本",
    items: [
      { date: "6/12以降", city: "南米・カナダ", detail: "ボリビア（ウユニ塩湖）→トロント 約20日間", status: "tbd" },
      { date: "〜7/1 (水)", city: "トロント→成田", detail: "帰国便（TOR→NRT 未予約）7/1着予定", status: "pending" },
    ],
    todoItems: [
      { item: "南米・カナダ旅程計画", detail: "ボリビア（ウユニ）→トロント 詳細", priority: "low" },
      { item: "帰国便予約", detail: "TOR→NRT 7/1着", priority: "mid" },
    ],
  },
};
