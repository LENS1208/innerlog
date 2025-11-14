-- トレード日記エントリー（2025年11月）
-- Dataset A: 方法論的で慎重なトレーダー（7件の日記、約50%）
-- Dataset B: 多通貨ペアトレーダー、経験豊富（10件の日記、約33%）
-- Dataset C: 苦戦中のトレーダー、感情的（8件の日記、約60%）

-- ========================================
-- Dataset A: 方法論的トレーダー
-- ========================================

-- 11/01 EURUSD買い +25,000円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('101000251', '00000000-0000-0000-0000-000000000001', 'A',
'【エントリー根拠】
日足で上昇トレンド継続。1.0700のサポートラインで反発。4時間足で押し目形成。
【実行】
1.0745でロング。損切り1.0695（50pips）、利確1.0870（125pips）。
【振り返り】
計画通りに実行できた。リスクリワード1:2.5。欧州時間に狙い通り上昇。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/06 USDJPY買い +39,000円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('101000253', '00000000-0000-0000-0000-000000000001', 'A',
'【セットアップ】
米雇用統計後の調整局面が終了。日足で149.00のサポートを確認。
【エントリー】
東京時間の安値149.50で反転を確認してエントリー。
【結果】
NYセッションで目標達成。ファンダメンタルズと一致した動き。次回も同様のセットアップを探す。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/11 EURJPY売り +42,500円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('101000255', '00000000-0000-0000-0000-000000000001', 'A',
'【市況分析】
欧州の経済指標が予想を下回る。ユーロ売りの流れ。
【トレード詳細】
164.50のレジスタンスでショート。東京時間のレンジブレイク待ち。
欧州時間に下落加速。162.80で利確。
【学び】
レンジブレイク後の初動に乗れた好例。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/18 USDJPY買い +49,000円（今月最大）
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('101000258', '00000000-0000-0000-0000-000000000001', 'A',
'【セットアップ】
週足で上昇トレンド。日銀会合後の円安トレンド継続。
【エントリー】
148.70付近でサポート確認後、149.20でエントリー。
【結果】
+49,000円。今月最大の利益。ロット管理が適切だった。
【今後】
このレベルのセットアップを見極める力を維持したい。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/22 AUDUSD売り +27,550円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('101000260', '00000000-0000-0000-0000-000000000001', 'A',
'【背景】
豪ドルが対米ドルで上昇しすぎ。調整局面入りと判断。
【実行】
0.6695のレジスタンスでショート。目標0.6550達成。
【所感】
プルバック戦略が機能。週末前のポジション整理として最適だった。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/25 EURJPY買い +48,300円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('101000261', '00000000-0000-0000-0000-000000000001', 'A',
'【分析】
ユーロ圏の経済指標改善。円安継続の見込み。
162.30でダブルボトム形成を確認。
【トレード】
東京時間にエントリー。欧州時間で上昇。164.40で利確。
【メモ】
今月の勝率が高い。計画的なトレードの成果。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/29 GBPUSD買い +21,000円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('101000263', '00000000-0000-0000-0000-000000000001', 'A',
'【セットアップ】
ポンドが1.2700で底打ち。英国の経済指標が堅調。
【実行】
1.2730でエントリー。1.2880で利確。
【11月総括】
13トレード中7勝。勝率54%。リスク管理を徹底できた月。来月も同様の姿勢で臨む。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================
-- Dataset B: 多通貨ペアトレーダー
-- ========================================

-- 11/03 USDCAD +64,717円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('102000494', '00000000-0000-0000-0000-000000000002', 'B',
'カナダドル強い。原油価格上昇に連動。USDCADショートで入った。東京時間の薄商いを狙って仕掛けたのが功を奏した。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/07 EURAUD +173,448円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('102000498', '00000000-0000-0000-0000-000000000002', 'B',
'EURAUDのロング。ユーロ買いと豪ドル売りの二重テーマ。チャートパターンも良好。朝の5時にエントリーして欧州時間まで保有。+17万超えは今月トップ。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/11 NZDUSD +245,619円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('102000502', '00000000-0000-0000-0000-000000000002', 'B',
'NZDUSDロング。ニュージーランドの貿易収支が好調。オセアニア通貨の買い場と判断。18時台にエントリー、そのまま上昇。+24万円。今月最高益。このペアは相性良い。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/14 EURUSD +99,748円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('102000507', '00000000-0000-0000-0000-000000000002', 'B',
'王道のEURUSD。朝7時エントリー。欧州中銀のコメントが追い風。シンプルなトレンドフォロー。+10万近く取れた。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/18 EURUSD +156,509円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('102000510', '00000000-0000-0000-0000-000000000002', 'B',
'再びEURUSD。朝6時の動きが良かったので乗った。1.07台からの上昇。+15万超え。EURUSDは今月好調。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/18 EURAUD +154,321円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('102000511', '00000000-0000-0000-0000-000000000002', 'B',
'EURAUDまた取れた。このペアは本当に読みやすい。午後のエントリーで夕方決済。+15万。今日は+31万円。絶好調。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/21 USDCHF +417,133円（今月最大）
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('102000515', '00000000-0000-0000-0000-000000000002', 'B',
'USDCHFロング。スイスフランが売られる局面。21時台にエントリー。大きく動いた。+41万円！！今月最高記録。この調子でいきたい。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/26 GBPUSD +206,596円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('102000519', '00000000-0000-0000-0000-000000000002', 'B',
'GBPUSDロング。ポンド強い。英国指標良好。17時台エントリー。+20万超え。ポンド系も今月好調。複数通貨に分散して正解だった。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/27 USDJPY +37,804円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('102000521', '00000000-0000-0000-0000-000000000002', 'B',
'USDJPYロング。円安トレンド継続。昼12時台エントリー。+3.8万円。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/27 GBPJPY +39,809円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('102000522', '00000000-0000-0000-0000-000000000002', 'B',
'GBPJPYロング。ポンド円強い。昼12時台。+4万円弱。今月は複数通貨ペアで分散できて利益も安定。この戦略を続ける。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================
-- Dataset C: 苦戦中のトレーダー
-- ========================================

-- 11/03 EURUSD買い -25,000円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('103000201', '00000000-0000-0000-0000-000000000003', 'C',
'朝からユーロ買いで入ったけど逆行。トレンドだと思ったのに。なんで下がるんだよ...。-2.5万。スタートから躓いた。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/05 GBPUSD売り -21,000円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('103000202', '00000000-0000-0000-0000-000000000003', 'C',
'ポンド売り。下がると思ったのに上昇。損切り遅れた。-2.1万。もう嫌になる。どうして読めないんだろう。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/07 USDJPY買い -39,000円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('103000203', '00000000-0000-0000-0000-000000000003', 'C',
'ドル円買い。朝6時半に入ったけど昼には大きく下落。3ロットで入ったのが失敗。-3.9万。ロット大きすぎた。反省。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/12 EURJPY買い -42,500円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('103000205', '00000000-0000-0000-0000-000000000003', 'C',
'ユーロ円ロング。上がると思ったのに下落。2.5ロット。-4.25万。今月もうダメかも。連敗続き。メンタルやられる。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/14 GBPJPY売り -41,400円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('103000206', '00000000-0000-0000-0000-000000000003', 'C',
'ポンド円ショート。194.50で売ったのに196.80まで上昇。-4.14万。もう分からない。なんでこんなに負けるんだ。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/19 USDJPY売り -49,000円（今月最大損失）
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('103000208', '00000000-0000-0000-0000-000000000003', 'C',
'ドル円ショート。完全に読み違えた。2.8ロット。-4.9万円。今月最悪。損切りできなくて傷口広げた。もう立ち直れないかも。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/24 AUDUSD買い -27,550円
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('103000210', '00000000-0000-0000-0000-000000000003', 'C',
'豪ドルロング。0.6695で買ったけど下落。-2.75万。なんでいつも逆に動くんだろう。もうトレード向いてないのかな。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 11/29 GBPUSD売り +21,000円（唯一の勝ち）
INSERT INTO trade_notes (ticket, user_id, dataset, content, created_at, updated_at) VALUES
('103000213', '00000000-0000-0000-0000-000000000003', 'C',
'ポンドドルショート。やっと勝てた！+2.1万円。今月最後にやっと勝てた。でもトータルでは大損。来月こそは...。',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
