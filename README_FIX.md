この修正は、前回パッチで不足していた getResolvedWallpaperSetting を追加しつつ、
壁紙タブに「カスタム画像」対応を入れるためのものです。

反映順:
1. lib/life-os/wallpaper.ts を上書き
2. components/dashboard/dashboard-shell.tsx を上書き
3. components/dashboard/sections/wallpaper-section.tsx を上書き
4. Supabase SQL Editor で supabase/20260421_wallpaper_custom_bucket.sql を実行
5. npm run dev で確認

補足:
- すでに wallpaper_settings.custom_path カラムはある前提です
- 全体背景への反映は、保存後に一度リロードすると確実です
