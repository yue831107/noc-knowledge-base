# Buffer Backpressure

**Buffer Backpressure** 是 Flow Control 的核心機制，當下游 Buffer 滿時，需要通知上游停止發送，以避免資料遺失。

## 概念

在 Wormhole 和 VC Flow Control 中：
- Flit 在 Buffer 之間傳輸
- 如果下游 Buffer 滿了，新來的 Flit 無處可放
- 必須有機制讓下游通知上游「停止發送」

這種「下游阻塞通知上游」的機制就是 **Backpressure**。

## 兩種主要機制

### Credit-based Flow Control

**Credit-based Flow Control** 使用 Credit（信用額度）來追蹤下游 Buffer 的可用空間。

![Figure 5.10: Credit-based Flow Control](/images/ch05/Figure%205.10.jpg)

#### 運作原理

1. **初始化**：
   - Sender 持有初始 Credit，等於 Receiver Buffer 的容量
   - 例如：Buffer 可存 4 個 Flit → 初始 Credit = 4

2. **發送 Flit**：
   - 每發送一個 Flit，Credit 減 1
   - 當 Credit = 0 時，停止發送

3. **接收 Credit**：
   - Receiver 處理完一個 Flit（從 Buffer 移出）
   - 發送一個 Credit 回 Sender
   - Sender Credit 加 1，可以再發送一個 Flit

#### 範例（Figure 5.10）

- Sender 初始有 Credit = 4
- 發送 Flit 0, 1, 2, 3 → Credit 變成 0
- 必須等待 Credit 返回
- Receiver 處理完 Flit 0 → 發送 Credit
- Sender 收到 Credit → Credit = 1 → 可發送 Flit 4

#### 特性

| 優點 | 說明 |
|------|------|
| 精確 | 精確追蹤每個 Buffer Slot |
| 無浪費 | Buffer 滿之前可以持續發送 |
| 適應性 | 自動適應不同的延遲和頻寬 |

| 缺點 | 說明 |
|------|------|
| Wire 開銷 | 需要額外的 Credit 傳輸線 |
| Counter 開銷 | 需要 Credit Counter 硬體 |
| 延遲敏感 | Credit 返回延遲影響效能 |

### On/Off Flow Control

**On/Off Flow Control**（也稱 Xon/Xoff）使用簡單的開/關信號。

![Figure 5.11: On/Off Flow Control](/images/ch05/Figure%205.11.jpg)

#### 運作原理

使用兩個閾值控制：
- **High Threshold**：Buffer 佔用超過此值 → 發送 **XOFF**（停止）
- **Low Threshold**：Buffer 佔用低於此值 → 發送 **XON**（繼續）

#### 範例（Figure 5.11）

假設 Buffer 大小 = 8，High = 6，Low = 2：

1. Buffer 佔用從 0 增加到 6 → 發送 **XOFF**
2. Sender 收到 XOFF → 停止發送
3. Buffer 佔用從 6 減少到 2 → 發送 **XON**
4. Sender 收到 XON → 恢復發送

#### 特性

| 優點 | 說明 |
|------|------|
| 簡單 | 只需要 1-bit 信號 |
| 低硬體成本 | 不需要 Counter，只需比較器 |
| Hysteresis | 閾值差異避免頻繁切換 |

| 缺點 | 說明 |
|------|------|
| 不精確 | 可能有 Buffer 空間但仍停止發送 |
| 可能浪費 | 在 XOFF 和 XON 之間有未使用的 Buffer |
| 需要餘量 | 從發送 XOFF 到 Sender 停止的 Flit 需要 Buffer 空間 |

## Buffer Turnaround Time

**Buffer Turnaround Time** 是影響 Buffer 深度設計的關鍵因素。

![Figure 5.12: Buffer Turnaround Time](/images/ch05/Figure%205.12.jpg)

### 定義

從 Flit 離開 Buffer 到 Credit 返回可以填補該空位的時間，包括：

$$
T_{turnaround} = T_{credit\_transmit} + T_{credit\_receive} + T_{flit\_transmit}
$$

- **Credit 傳輸時間**：Credit 從 Receiver 傳到 Sender
- **Credit 處理時間**：Sender 處理 Credit 並準備下一個 Flit
- **Flit 傳輸時間**：新 Flit 從 Sender 傳到 Receiver

### 對 Buffer 深度的影響

為了避免 Link 閒置，Buffer 深度必須足夠覆蓋 Turnaround Time：

$$
Buffer_{depth} \geq \frac{T_{turnaround} \times Bandwidth}{Flit_{size}}
$$

#### 範例

- Turnaround Time = 4 cycles
- Bandwidth = 1 Flit/cycle
- 需要 Buffer 深度 ≥ 4 Flit

如果 Buffer 只有 2 Flit：
- 發送 2 個 Flit 後 Credit 用完
- 等待 4 cycles 才有 Credit 返回
- 這 4 cycles Link 閒置 → 頻寬浪費 50%

### 設計考量

| 因素 | 影響 |
|------|------|
| Link 長度 | 較長的 Link → 較長的 Turnaround → 需要更深的 Buffer |
| 時脈頻率 | 較高頻率 → 較多 cycles 的 Turnaround → 需要更深的 Buffer |
| Pipeline 深度 | 較深的 Pipeline → 較長的 Turnaround → 需要更深的 Buffer |

## Credit vs On/Off 比較

| 特性 | Credit-based | On/Off |
|------|--------------|--------|
| 精確度 | 高（per-Flit） | 低（閾值） |
| 硬體複雜度 | 高（Counter） | 低（比較器） |
| Wire 開銷 | 每個 VC 需要 Credit 線 | 只需 1-2 bit 信號 |
| Buffer 效率 | 高 | 中（閾值間隙） |
| 適用場景 | 高效能 NoC | 簡單設計 |

## 實作考量

### Credit Wire 數量

對於 Credit-based Flow Control：
- 每個 VC 需要獨立的 Credit 信號
- 可以使用 Counter 累積多個 Credit 在一次傳輸
- 或使用 Credit 值傳輸（需要 log₂(Buffer depth) bits）

### 時序考量

- Credit 路徑通常與資料路徑反向
- 需要確保 Credit 路徑的 Timing 滿足要求
- 可能需要 Register Credit 以滿足時序

### 與 VC Allocation 的交互

- VC Allocation 需要知道 Credit 狀態
- 沒有 Credit 的 VC 不應被選中
- 這會影響 VC Allocator 的設計

## 在 On-chip Network 中的應用

大多數高效能 On-chip Network 使用 **Credit-based Flow Control**：

| 設計 | Flow Control |
|------|-------------|
| Intel Xeon Phi | Credit-based |
| Tilera TILE | Credit-based |
| Academic NoC | 大多 Credit-based |

原因：
1. On-chip Wire 資源相對充足，Credit 線開銷可接受
2. 需要高效能，不能浪費 Buffer 空間
3. 與 VC 機制緊密整合

## 參考資料

- On-Chip Networks Second Edition, Chapter 5.7
