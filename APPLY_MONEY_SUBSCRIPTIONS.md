# 追加で実行するSQL

Moneyタブのサブスク管理を使う前に、Supabase SQL Editorで以下を実行してください。

- `supabase/20260428_money_subscriptions.sql`

反映内容：
- NISA表示・入力欄をMoneyタブから削除
- サブスク登録/編集/削除/有効停止を追加
- 毎月/半年/年1回の支払い周期から月換算・年換算を自動計算
- Routineタブは「今日のルーティン」を最上部に移動
