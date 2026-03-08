-- ============================================================
-- 財務トラッカー DB スキーマ（Neon PostgreSQL）
-- finance-tracker-kenji
-- ============================================================

-- 為替レート
CREATE TABLE IF NOT EXISTS exchange_rates (
  currency VARCHAR(3) PRIMARY KEY,
  rate_to_jpy NUMERIC(10,2) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初期レート挿入
INSERT INTO exchange_rates (currency, rate_to_jpy) VALUES
  ('JPY', 1.00),
  ('USD', 160.00),
  ('EUR', 175.00),
  ('GBP', 205.00),
  ('HKD', 21.00),
  ('CNY', 22.00)
ON CONFLICT (currency) DO NOTHING;

-- 予算マスタ（計画値）
CREATE TABLE IF NOT EXISTS budget_items (
  id SERIAL PRIMARY KEY,
  phase CHAR(1) NOT NULL CHECK (phase IN ('A','B','C')),
  category VARCHAR(60) NOT NULL,
  subcategory VARCHAR(60),
  planned_jpy INTEGER NOT NULL,
  payer VARCHAR(10) NOT NULL DEFAULT 'ケンジ',
  status VARCHAR(20) DEFAULT '見込み',
  note TEXT
);

-- 実績（出費記録）
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'JPY',
  rate_used NUMERIC(10,2) NOT NULL DEFAULT 1,
  amount_jpy INTEGER NOT NULL,
  phase CHAR(1) NOT NULL CHECK (phase IN ('A','B','C')),
  category VARCHAR(60) NOT NULL,
  payer VARCHAR(10) NOT NULL DEFAULT 'ケンジ',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_expenses_phase ON expenses(phase);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- ============================================================
-- 予算マスタ初期データ（@160円レート）
-- ============================================================

-- Phase A: 春の旅行（3/10-3/26）ケンジ負担
INSERT INTO budget_items (phase, category, subcategory, planned_jpy, payer, status, note) VALUES
  ('A', 'ビザ・手数料', 'J-1ビザ申請料 (MRV fee)',    29600, 'ケンジ', '支払済み', '$185×160'),
  ('A', 'ビザ・手数料', 'SEVIS I-901費',              35200, 'ケンジ', '支払済み', '$220×160'),
  ('A', '宿泊',        'HK: Yesinn@YMT (2泊)',        6007, 'ケンジ', '支払済み', '3/10-12'),
  ('A', '宿泊',        'PAR: The People Belleville',   7262, 'ケンジ', '支払済み', '3/13-14'),
  ('A', '宿泊',        'PAR: St Christopher''s Inn',  11788, 'ケンジ', '支払済み', '3/14-16'),
  ('A', '宿泊',        'PAR: Libertel Gare de l''Est',20122, 'ケンジ', '支払済み', '3/16-17'),
  ('A', '宿泊',        'LON: Shakespeare Hotel',      42907, 'ケンジ', '支払済み', '3/17-19'),
  ('A', '宿泊',        'MAD: Latroupe Prado (2泊)',   21437, 'ケンジ', '支払済み', '3/19-21'),
  ('A', '宿泊',        'BCN: Mellow Barcelona (3泊)', 9675,  'ケンジ', '支払済み', '3/22-25 前払い'),
  ('A', '宿泊',        'BCN: Mellow Barcelona 市税',  3024,  'ケンジ', '現地払い', '3/22-25 City Tax'),
  ('A', '交通',        'ユーロスター（PAR→LON）',    10000, 'ケンジ', '未予約',   '3/17'),
  ('A', '交通',        'UK電車（5区間）',            15000, 'ケンジ', '未予約',   'StP→PAD+BHM往復+LHR'),
  ('A', '交通',        'スペイン電車（3区間）',       6500,  'ケンジ', '未予約',   'Toledo往復+MAD→BCN'),
  ('A', '通信',        'eSIM Firsty Premium',         12560, 'ケンジ', '未払い',   '欧州全域 1日5GB'),
  ('A', '食費',        '香港（2日間）',               4000,  'ケンジ', '見込み',   'ローカル飯'),
  ('A', '食費',        'パリ（4日間）',              12000,  'ケンジ', '見込み',   'いい食事2回含む'),
  ('A', '食費',        'ロンドン（2日間）',           5000,  'ケンジ', '見込み',   'スーパー中心'),
  ('A', '食費',        'スペイン滞在費（7日間）',    31500,  'ケンジ', '見込み',   'いい食事3回含む'),
  -- Phase A: 母負担
  ('A', '宿泊',        'MAD: Hostel 165 (1泊)',       2921,  '母',    '支払済み', '3/21-22'),
  ('A', '航空券',      '成田→香港 HX605',           38350,  '母',    '発券済み', '3/10'),
  ('A', '航空券',      'HK/北京→パリ CA',           64120,  '母',    '発券済み', '3/12-13'),
  ('A', '航空券',      'LON→MAD BA458',             26680,  '母',    '発券済み', '3/19'),
  ('A', '航空券',      'BCN→FRA→SEA LH/UA',        211590, '母',    '支払完了', '3/26'),
  ('A', '損失',        'MAD→ラゴス AT便 純損失',    17540,  '母',    '損失確定', '¥76,590-¥59,050返金'),
  ('A', '損失',        'ラゴス→SEA QR1408 純損失',  162825, '母',    '損失確定', '¥171,705-¥8,880返金'),
  ('A', '損失',        '別日程QR便 全額損失',        132110, '母',    '損失確定', '¥132,110 返金なし');

-- Phase B: シアトル留学（3/26-6/12）
INSERT INTO budget_items (phase, category, subcategory, planned_jpy, payer, status, note) VALUES
  ('B', '住居',        'UW 住宅食事前払金',           80000,  'ケンジ', '支払済み', '$500×160'),
  ('B', '住居',        'UW Elm Hall 春学期室料',      553760, 'ケンジ', '支払済み', '$3,461×160'),
  ('B', '保険',        'OSSMA保険料',                 16335,  'ケンジ', '支払済み', ''),
  ('B', '通信',        'eSIM T-Mobile Prepaid 3ヶ月',  20300,  'ケンジ', '未払い',   '月50GB'),
  ('B', '食費',        '生活費ベース',                534080, 'ケンジ', '見込み',   '$3,338×160 食費・交通・日用品'),
  ('B', '食費',        '外食追加費',                  128000, 'ケンジ', '見込み',   '$20×40回'),
  ('B', '娯楽',        '観光・娯楽',                  80000,  'ケンジ', '見込み',   '$500×160'),
  ('B', '予備費',      '予備費',                      48000,  'ケンジ', '見込み',   '$300×160'),
  ('B', '奨学金',      '奨学金収入（3ヶ月）',        -330000, 'ケンジ', '確定',     '月¥110,000×3'),
  ('B', '保険',        'J-1保険（学校手配）',         29110,  '母',    '確定',     '母払い');

-- Phase C: 帰国旅行
INSERT INTO budget_items (phase, category, subcategory, planned_jpy, payer, status, note) VALUES
  ('C', '帰国旅行',    '帰国旅行全体',                430000, 'ケンジ', '見込み',   '概算');
