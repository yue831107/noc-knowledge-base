# Coherence Protocol

## Cache Coherence 對網路效能的影響

Cache Coherence Protocol 通常強制執行 **Single-Writer, Multiple-Reader** 不變式。任意數量的 Node 可以快取記憶體的副本以進行讀取；如果一個 Node 希望寫入該記憶體位址，它必須確保沒有其他 Node 正在快取該位址。

因此，Shared Memory Multiprocessor 的通訊需求包括：
- **Data Request（資料請求）**
- **Data Response（資料回應）**
- **Coherence Permission（一致性權限）**

在 Node 可以讀取或寫入 Cache Block 之前，需要獲得 Coherence Permission。根據 Cache Coherence Protocol 的不同，其他 Node 可能需要回應權限請求。

## 兩種主要 Protocol 類型

多處理器系統通常依賴兩種不同類型的 Coherence Protocol 之一：**Broadcast** 或 **Directory**。每種 Protocol 類型都會產生不同的網路流量特性。

### Broadcast Protocol

流程：
1. Cache Miss 發生，請求發送到 Ordering Point
2. 請求廣播到所有 Core
3. 接收資料

**特點：**
- Coherence Request 發送到所有 On-chip Node → **高頻寬需求**
- Data Response 是 Point-to-Point 性質，不需要任何排序
- 可能需要從所有 Node 收集 Acknowledgment Message 以確保正確的請求排序
- 可以依賴兩個實體網路：一個用於排序，一個用於無序的資料傳輸
- 或者使用 Virtual Channel 確保 Coherence Traffic 的排序

### Directory Protocol

流程：
1. Cache Miss 發生，請求發送到 Directory
2. Directory 查找哪個 Core 有該 Cache Block
3. 僅向特定 Core 發送請求/資料

**特點：**
- 不依賴任何隱式網路排序，可以映射到任意 Topology
- 依賴 Point-to-Point Message 而非 Broadcast
- Coherence Message 的減少使這類 Protocol 提供更好的**可擴展性**
- Directory 包含關於哪些 Core 擁有 Cache Block 的資訊
- 在可擴展設計中經常被選用

![Figure 2.2: Coherence protocol network request examples](/images/ch02/Figure%202.2.jpg)

## Protocol 比較

| 特性 | Broadcast Protocol | Directory Protocol |
|------|-------------------|-------------------|
| **頻寬需求** | 高（One-to-All） | 低（Point-to-Point） |
| **可擴展性** | 差 | 佳 |
| **延遲** | 可能較低（無需查詢） | 需要 Directory 查詢 |
| **複雜度** | 較簡單 | 需要 Directory 儲存 |
| **Multicast 需求** | 是（所有 Coherence Request） | 有時（Invalidation） |

## Coherence Protocol 對網路的需求

### Message 類型

Cache Coherence Protocol 需要幾種類型的 Message：

| 類型 | 說明 | 範例 |
|------|------|------|
| **Unicast** | 單一 Source 到單一 Destination | L2 Cache → Memory Controller |
| **Multicast** | 單一 Source 到多個 Destination | Directory 發送 Invalidation 到多個 Sharer |
| **Broadcast** | 單一 Source 到所有 Destination | Broadcast Protocol 的 Coherence Request |

### Message 大小

Cache Coherent Shared Memory CMP 通常需要**兩種 Message 大小**：

1. **控制 Message**：Coherence Request 和不帶資料的 Response
   - 包含記憶體位址和 Coherence 命令
   - **小型**（通常 < 16 bytes）

2. **資料 Message**：完整的 Cache Line 傳輸
   - 包含整個 Cache Block（通常 **64 bytes**）和記憶體位址
   - **大型**

::: tip Bimodal Distribution
Cache Coherent On-chip Network 的 Traffic 特徵是 Bimodal 分佈：短的控制 Message 和長的資料 Message。針對不同 Message 大小的處理可以改善效能和能源效率。
:::

### Message Class

Protocol 可能需要幾個不同的 Message Class。每個 Class 包含一組彼此獨立的 Coherence 動作：

| Message Class | 說明 | 範例 |
|---------------|------|------|
| **Request** | 發起 Coherence 交易 | Load、Store、Upgrade、Writeback |
| **Intervention** | Directory 請求傳輸修改的資料 | Fwd-GetS、Fwd-GetM |
| **Response** | 回應請求或 Intervention | Invalidation Ack、Negative Ack、Data |

## Protocol-Level Deadlock

::: danger 重要
除了 Message 類型和大小之外，Shared Memory 系統要求網路**免於 Protocol-Level Deadlock**。
:::

### Deadlock 成因

**Deadlock 發生情境：**
1. 如果網路被無法消費的 Request 填滿（直到 Network Interface 發起 Reply）
2. 就會發生 Cyclic Dependence
3. 如果兩個處理器都產生填滿網路資源的 Request Burst
4. 兩個處理器都會停滯等待遠端 Reply
5. 如果 Reply 使用與 Request 相同的網路資源，Reply 無法前進 → **Deadlock**

![Figure 2.3: Protocol-level deadlock](/images/ch02/Figure%202.3.jpg)

### 解決方案：Virtual Channel 分離

**Alpha 21364** 為每個 Message Class 分配一個 Virtual Channel 來防止 Protocol-Level Deadlock。

透過要求不同 Message Class 使用不同 Virtual Channel，Request 和 Response 之間的 Cyclic Dependence 在網路中被打破：
- VC0: Request Messages
- VC1: Intervention Messages
- VC2: Response Messages

Virtual Channel 和處理 Protocol-Level Deadlock 與 Network Deadlock 的技術在 Chapter 5 中討論。

## Network Interface 設計

### Processor-to-Network Interface

**MSHR（Miss Status Handling Register）** 的功能：
- 當 Cache Miss 發生時，分配並初始化 MSHR
- 對於 Read Request，MSHR 初始化為 Read Pending 狀態
- Message Format Block 將建立網路訊息
- 當 Reply Message 從網路來時，MSHR 將 Reply 匹配到 Outstanding Request 並完成 Cache Miss 動作

![Figure 2.8: Processor-to-network interface](/images/ch02/Figure%202.8.jpg)

### Memory-to-Network Interface

**TSHR（Transaction Status Handling Register）** 的功能：
- 處理來自處理器（Cache）的記憶體請求
- 發起 Reply
- 如果 Memory Controller 保證按順序服務請求，TSHR 可以簡化為 FIFO Queue
- 但 Memory Controller 通常會重新排序請求以提高利用率

![Figure 2.9: Memory-to-network interface](/images/ch02/Figure%202.9.jpg)

## 參考資料

- On-Chip Networks Second Edition, Chapter 2.1.1, 2.1.2, 2.1.3

