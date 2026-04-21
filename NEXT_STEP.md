このパッチで入るもの

1. タイトル視認性改善
- ヘッダーのタイトルと説明文に濃い下地と影を追加
- 明るい壁紙でも読める方向に調整

2. カスタム壁紙
- 壁紙タブに「プリセット / カスタム」を追加
- 好きな画像をアップロードして保存可能
- 保存後、DashboardShell 側で自動読込

3. 全体背景の安定化
- body/html の白背景を除去
- スクロールバーの見た目も整理

反映するファイル
- components/dashboard/dashboard-shell.tsx
- components/dashboard/sections/wallpaper-section.tsx
- lib/life-os/wallpaper.ts
- app/globals.css

SQL
- 今回は追加SQL不要です
- 既存の wallpaper_settings.custom_path を使います

注意
- カスタム壁紙保存後は、一度タブ切替かリロードで見た目確認をしてください
- 画像保存は trip-images バケットを再利用しています
