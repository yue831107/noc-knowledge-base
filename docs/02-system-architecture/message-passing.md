# Message Passing

## 概述

Message Passing 範式需要 Process 之間的**顯式通訊**。使用者通訊透過作業系統和程式庫呼叫執行，軟體必須編寫匹配的 Send 和 Receive 呼叫以促進從一個 Process 到另一個 Process 的資料傳輸。

透過 Message Passing，可以實現任意一組協作 Process 之間的通訊和同步。

## Shared Memory vs. Message Passing 比較

| 面向 | Shared Memory | Message Passing |
|------|---------------|-----------------|
| **資料識別** | 透過全域 Shared Address Space 容易實現 | 必須識別資料擁有 Process 才能請求資料 |
| **Message 類型** | 固定（由 Coherence Protocol 定義） | 非常靈活，但可能帶來開銷 |
| **Message 長度** | 固定（Cache Line 大小） | 可變，可能使 Buffer 管理複雜化 |
| **Message 儲存** | 對軟體透明，完全由硬體管理 | 可能需要 Interrupt 讓軟體暫存 |
| **通訊開銷攤銷** | 透過 Cache 機制 | 透過傳送大塊資料 |
| **硬體成本** | 較高（Cache Coherence 複雜度） | 較低 |

## Message Passing 的特點

### 優勢

- **明確的通訊**：程式設計師清楚知道資料何時被傳送
- **無需 Cache Coherence**：不需要複雜的 Coherence Protocol
- **擴展性佳**：適合大規模系統
- **效能建模更容易**：通訊明確發生，成本清晰可見

### 挑戰

- **程式設計複雜度**：程式設計師必須明確管理通訊
- **Synchronization**：需要處理 Send 和 Receive 的同步
- **額外開銷**：軟體需要解碼和處理 Message

::: tip 通訊效能
Message Passing 中的通訊效能通常更容易建模和推理，因為通訊是明確發生的。程式設計師清楚了解通訊的成本 —— Message 是昂貴的，所以應該不頻繁地發送。

相比之下，Shared Memory 更具挑戰性，因為通訊不僅透過 Load 和 Store 隱式發生，還透過 Cache Conflict（需要額外通訊）發生，這在軟體層面並不明顯。
:::

## Blocking vs. Non-blocking

### Blocking（同步）Message Passing

- Sender 會停滯直到 Receiver 確認收到 Message
- 概念簡單
- 必須小心處理 Deadlock

**Deadlock 範例：**
```
Process A: Send(B, msg)    // 等待 B 的 Receive
Process B: Send(A, msg)    // 等待 A 的 Receive
// 兩者都無法前進到 Receive 命令 → Deadlock
```

### Non-blocking（非同步）Message Passing

- Sender 發送後立即繼續
- 移除 Deadlock 相關的複雜性
- 但增加了儲存 Message 的複雜性（直到 Receiver 準備好）

## Message 儲存策略

可以採用幾種不同的策略來發送和儲存 Message：

| 策略 | 說明 | 優點 | 缺點 |
|------|------|------|------|
| **專用 Register** | Message 直接寫入專用 Register 或 Buffer | 低延遲 | 空間有限 |
| **Memory-mapped I/O** | Message 儲存在記憶體中 | 靈活、大容量 | 延遲較高 |
| **Interrupt 通知** | 接收 Process 透過 Interrupt 收到通知 | 即時響應 | Interrupt 開銷 |
| **Polling** | 接收 Process 輪詢 Memory-mapped 位置 | 無 Interrupt 開銷 | CPU 使用率高 |

## Operand Network

除了 Cache Coherent CMP 中 On-chip Network 的出現，Tiled Microprocessor 也利用 On-chip Network 進行 **Scalar Operand Network**。

**Operand Network 的工作方式：**
1. 這些設計將功能單元分佈在多個 Tile 上
2. 緩解大型超純量架構中存在的 Wire Delay 問題
3. 指令被排程到可用的 Tile
4. 使用 Operand Network 在產生指令和消費指令的 Tile 之間通訊 Register 值
5. 指令的結果被傳達給 Consumer Tile，然後 Consumer Tile 可以喚醒並執行等待新資料的指令

範例架構：TRIPS、RAW、Wavescalar

## 對 NoC 的需求

| 需求 | 說明 |
|------|------|
| **Ordering** | 通常需要保證 Message 順序 |
| **Reliability** | Message 不能遺失 |
| **Flow Control** | 處理 Receiver 忙碌的情況 |
| **Variable Length Support** | 支援可變長度 Message |
| **Buffer Management** | 有效管理 Message Buffer |

## 典型 Message Passing 系統範例

- **MPI（Message Passing Interface）**：高效能運算中最常用的 Message Passing 標準
- **Intel SCC**：使用顯式 Messaging Passing 進行 DMA 到本地記憶體，放棄 On-chip Cache Coherence
- **IBM Cell**：採用 Message Passing 架構

## 參考資料

- On-Chip Networks Second Edition, Chapter 2.2

