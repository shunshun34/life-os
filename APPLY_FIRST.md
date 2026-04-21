# Life OS 一気反映パック

## これに入っているもの
- UI改善の基礎反映
- ダッシュボード用 overview セクション追加
- サイドバーの独立スクロール改善
- 暗すぎる見た目の緩和
- 運用段階向け SQL（index / analytics / storage / RLS 強化）

## 反映順
1. `supabase/20260421_life_os_operational_finish.sql` を Supabase SQL Editor で実行
2. このパックのコードを既存プロジェクトに上書き
3. `npm run dev` で表示確認
4. 最後に Supabase Dashboard で Signups を無効化

## このパックで変わること
- ダッシュボードタブが「概要・分析・運用チェック」に変わる
- 記録タブは既存のまま残る
- UIの暗さがやや軽くなり、余白とカードが整う
- サイドバーは固定されたまま独立スクロールしやすくなる
- 旅行画像の storage policy が揃う
- 日次 / 月次分析ビューが使えるようになる

## 今回あえて触っていないもの
- 各個別セクションの入力項目そのもの
- 壁紙の自前設定UI
- 旧 `life_os_*` テーブル群の統廃合

## 次にやると強いこと
- `life_os_daily_metrics` を使った本格分析画面追加
- holo / hobby の旧テーブルと新テーブルの整理
- records / money / reflections を横断した相関カード追加
