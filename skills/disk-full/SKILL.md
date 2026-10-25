---
name: disk-full
description: 主機磁碟使用率超過 85% 時的處理步驟。使用者問磁碟滿了、空間不夠時用。
---
## 可以用的工具
只用 get-host-metrics 與 list-large-files。

## 步驟
1. 用 get-host-metrics 確認目前使用率
2. 用 list-large-files 列出前 10 大檔案
3. 回覆格式：目前使用率、前 10 大檔案、建議動作（只建議，不執行）
