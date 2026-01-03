# Resilient NoC

隨著製程技術進入深亞微米和奈米尺度，On-chip Network 面臨日益嚴重的**可靠性挑戰**。設計具有容錯能力的 NoC 對於確保系統正確運作至關重要。

## 可靠性挑戰

### 錯誤類型

| 類型 | 持續性 | 原因 | 影響 |
|------|--------|------|------|
| **Transient (Soft)** | 暫時 | 輻射、電源雜訊 | 位元翻轉 |
| **Intermittent** | 間歇 | 老化、溫度變化 | 時好時壞 |
| **Permanent (Hard)** | 永久 | 製程缺陷、磨損 | 元件失效 |

### Soft Error 來源

| 來源 | 說明 |
|------|------|
| **宇宙射線** | 高能粒子撞擊 |
| **Alpha 粒子** | 封裝材料釋放 |
| **電源雜訊** | 瞬態電壓波動 |
| **串擾** | 相鄰 Wire 干擾 |

### 磨損機制

| 機制 | 說明 | 影響元件 |
|------|------|----------|
| **Electromigration** | 電流推動原子移動 | Wire、Via |
| **NBTI** | 負偏壓溫度不穩定性 | pMOS |
| **PBTI** | 正偏壓溫度不穩定性 | nMOS |
| **HCI** | 熱載子注入 | Transistor |
| **TDDB** | 時間依賴性介電質崩潰 | Gate Oxide |

### 製程變異

| 類型 | 影響 |
|------|------|
| **Die-to-Die** | 不同晶片間變異 |
| **Within-Die** | 同晶片內變異 |
| **Random (RDF)** | 隨機摻雜波動 |
| **Systematic** | 微影等系統性變異 |

## 錯誤偵測

### Parity Check

最簡單的錯誤偵測方法：

| 特點 | 說明 |
|------|------|
| **開銷** | 1 bit/byte |
| **能力** | 偵測奇數 bit 錯誤 |
| **限制** | 無法糾正 |

**使用場景**：
- Link 傳輸
- Buffer 儲存

### ECC (Error Correction Code)

**SEC-DED**（Single Error Correction, Double Error Detection）：

| 特點 | 說明 |
|------|------|
| **開銷** | ~12.5% (64-bit data) |
| **能力** | 糾正 1-bit，偵測 2-bit |
| **延遲** | 編碼/解碼延遲 |

**Hamming Code 範例**：
- 64-bit 資料 + 8-bit 校驗
- 可糾正任意單 bit 錯誤

### CRC (Cyclic Redundancy Check)

用於 Packet 級別錯誤偵測：

| 特點 | 說明 |
|------|------|
| **開銷** | 固定 CRC 欄位 |
| **能力** | 偵測多 bit 錯誤 |
| **應用** | End-to-end 檢查 |

### 偵測機制比較

| 機制 | 偵測能力 | 糾正能力 | 開銷 |
|------|----------|----------|------|
| Parity | 奇數 bit | 無 | 最低 |
| SEC-DED | 2-bit | 1-bit | 中 |
| CRC | 多 bit | 無 | 中 |
| TMR | 所有 | 所有 | 200% |

## 容錯機制

### 重傳 (Retransmission)

偵測到錯誤後重新傳輸：

| 層級 | 說明 |
|------|------|
| **Link-level** | 每跳重傳 |
| **End-to-end** | 端到端重傳 |

**Trade-off**：
- Link-level：低延遲，高 Buffer 成本
- End-to-end：低 Buffer 成本，高延遲

### 備援資源 (Spare Resources)

預留備用元件替換故障元件：

| 類型 | 應用 |
|------|------|
| **Spare Router** | 替換故障 Router |
| **Spare Link** | 替換故障 Link |
| **Spare VC** | 替換故障 VC |
| **Spare Buffer** | 替換故障 Buffer 行 |

**考量**：
- 面積開銷
- 重配置機制
- 故障隔離

### 自適應路由 (Adaptive Routing)

繞過故障節點或 Link：

| 策略 | 說明 |
|------|------|
| **Fault-aware** | 知道故障位置 |
| **Fault-tolerant** | 遇到故障時繞路 |
| **Progressive** | 漸進式適應 |

**挑戰**：
- 維持 Deadlock Freedom
- 確保連通性
- 最小化路徑延長

### 降級運行 (Graceful Degradation)

在故障存在時維持部分功能：

| 策略 | 說明 |
|------|------|
| **頻寬降級** | 使用較少的 Link |
| **功能降級** | 關閉部分功能 |
| **區域隔離** | 隔離故障區域 |

## Router 容錯設計

### Pipeline 保護

| 階段 | 保護機制 |
|------|----------|
| **Buffer** | ECC 或 Parity |
| **Crossbar** | 雙軌編碼或 Parity |
| **Arbiter** | 邏輯複製 |
| **Control** | TMR 或 Parity |

### 多工器保護

Crossbar 中的多工器可使用：
- **雙軌編碼**：每個訊號雙線傳輸
- **Parity per bit**：每位元校驗

### 狀態保護

VC 狀態和 Credit 計數器：

| 方法 | 開銷 | 效果 |
|------|------|------|
| **ECC** | 中 | 糾正單 bit |
| **TMR** | 高 | 容忍單點故障 |
| **Watchdog** | 低 | 偵測卡住狀態 |

## Link 容錯設計

### 傳輸層保護

| 技術 | 說明 |
|------|------|
| **Interleaving** | 分散 Burst 錯誤 |
| **Shielding** | 訊號遮蔽 |
| **Low-swing** | 降低串擾敏感度 |

### 備援 Wire

預留額外 Wire 替換故障線：

| 策略 | 開銷 |
|------|------|
| **1:N 備援** | 低但保護有限 |
| **1:1 備援** | 高但完整保護 |

### Retransmission Buffer

Link-level 重傳需要保留已傳送資料：

| 考量 | 設計選擇 |
|------|----------|
| **Buffer 大小** | 根據 RTT |
| **保留時間** | 直到 ACK |
| **優先級** | 重傳優先 |

## 系統級容錯

### 故障診斷

| 階段 | 方法 |
|------|------|
| **製造測試** | BIST、Scan |
| **啟動測試** | Self-test |
| **運行時監控** | Performance Counter |

### 故障通知

| 機制 | 說明 |
|------|------|
| **中斷** | 通知 OS/Firmware |
| **錯誤日誌** | 記錄錯誤資訊 |
| **降級標記** | 標記故障資源 |

### 恢復策略

| 層級 | 策略 |
|------|------|
| **硬體** | 備援切換、重傳 |
| **Firmware** | 重配置、故障隔離 |
| **OS** | 程序遷移、資源重分配 |

## 設計權衡

### 可靠性 vs 開銷

| 保護程度 | 面積開銷 | 功耗開銷 | 延遲 |
|----------|----------|----------|------|
| 無保護 | 0% | 0% | 0 |
| Parity | ~1% | ~1% | 小 |
| ECC | ~10% | ~5% | 1+ cycle |
| TMR | ~200% | ~200% | 小 |

### 設計建議

| 應用 | 建議保護 |
|------|----------|
| **消費電子** | Parity + 重傳 |
| **伺服器** | ECC + 備援 |
| **航空/汽車** | TMR + 多重保護 |
| **太空** | 極高冗餘 |

## 未來趨勢

### 機器學習輔助

| 應用 | 說明 |
|------|------|
| **故障預測** | 預測即將失效元件 |
| **自適應保護** | 動態調整保護級別 |
| **異常偵測** | 識別異常行為 |

### Self-healing NoC

| 能力 | 說明 |
|------|------|
| **自診斷** | 識別故障位置 |
| **自修復** | 自動切換備援 |
| **自適應** | 調整路由/配置 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 9.2
- S. R. Sridhara and N. R. Shanbhag, "Coding for System-on-Chip Networks: A Unified Framework," IEEE TVLSI 2005

