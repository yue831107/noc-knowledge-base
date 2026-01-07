# Shared Memory Networks

## 概述

平行程式設計極其困難，但隨著 Many-core 架構的出現已變得越來越重要。維護一個全域 Shared Address Space 減輕了程式設計師編寫高效能平行程式碼的負擔，因為理解全域 Address Space 比理解分割的 Address Space 更容易。

我們將討論重點放在 Shared-Memory CMP 上，因為它們預計將成為未來幾年的主流 Multi-core 架構。與 SMP 類似，CMP 通常具有 Shared Global Address Space；然而與 SMP 不同，CMP 可能表現出非均勻記憶體存取延遲（NUMA）。

## 為何選擇 Shared Memory

Shared Memory 程式設計模型之所以受歡迎，有以下幾個原因：

| 優勢 | 說明 |
|------|------|
| **程式設計簡便** | 程式設計師不需要明確管理資料移動 |
| **軟體相容性** | 現有的多執行緒軟體可以直接運行 |
| **動態負載平衡** | 執行緒可以存取任意位址的資料 |
| **細粒度共享** | 支援小至單一變數的共享 |

::: warning 挑戰
Shared Memory 的簡便性是建立在複雜的硬體支援之上的，特別是 **Cache Coherence Protocol**。這為 NoC 設計帶來了額外的挑戰。
:::

## Shared Memory CMP 架構

典型的 64 個 Node 的 Shared Memory Multiprocessor 中，一個 Node 包含一個處理器、Private L1 Instruction 和 Data Cache，以及可能是 Private 或 Shared 的 L2 Cache。

![Figure 2.1: Shared memory chip multiprocessor architecture](/images/ch02/Figure%202.1.jpg)

> **圖 2.1 解說**：此圖展示了一個典型的 Shared Memory CMP 架構。每個 Tile 包含一個 Core、L1 Cache、可能的 L2 Cache 以及 Router。所有 Tile 透過 On-chip Network 連接，並共享對 Main Memory 的存取。

### 架構組成元件

| 元件 | 功能 | 與 NoC 的關係 |
|------|------|--------------|
| **Core** | 執行指令 | 產生 Memory Request |
| **L1 Cache** | 第一級緩存（通常 Private） | 大部分存取在此完成 |
| **L2 Cache** | 第二級緩存（Private 或 Shared） | Miss 時透過 NoC 存取 |
| **Router** | 網路路由 | NoC 的核心元件 |
| **Network Interface** | 連接 Core 與 Network | 協議轉換 |
| **Memory Controller** | 存取 Off-chip Memory | NoC 流量的重要目的地 |

## Cache Hierarchy 與通訊

Cache 被用來減少記憶體延遲並作為需要發送到互連網路的流量的過濾器。Cache Hierarchy 複製資料以減少存取資料的延遲，但這使 Shared Memory 範式中記憶體的邏輯統一視圖變得複雜。

### Cache 的過濾效應

Cache 對網路流量有顯著的過濾效果：

```
典型的 Cache Miss Rate：
┌─────────────────────────────────────────┐
│ L1 Cache Hit Rate: ~95%                 │
│ → 只有 5% 的存取需要查詢 L2             │
├─────────────────────────────────────────┤
│ L2 Cache Hit Rate: ~80%                 │
│ → 只有 1% 的存取需要存取 Main Memory    │
└─────────────────────────────────────────┘
```

這意味著 **NoC 只需要處理一小部分的記憶體存取**，但這些存取對效能至關重要。

## Cache Coherence 的必要性

Cache 被設計為對程式設計師透明。它們透過將頻繁存取的資料保持在靠近處理器的位置來提高效能，但程式設計師無需管理它們。這種透明性在多處理器系統中也是可取的；然而，多個 Cache 的存在可能導致正確性問題——如果同一位址的不同版本同時存在於多個位置。

::: warning Cache Coherence 問題
當多個 Core 各自擁有 Private Cache 時，同一筆資料可能存在多個副本。Cache Coherence Protocol 被設計來解決這個挑戰，而不給程式設計師帶來負擔。
:::

### Coherence 問題範例

考慮以下場景：

```
初始狀態：Memory[A] = 0

時間 1: Core 0 讀取 A → L1_0[A] = 0
時間 2: Core 1 讀取 A → L1_1[A] = 0
時間 3: Core 0 寫入 A = 1 → L1_0[A] = 1
時間 4: Core 1 讀取 A → 應該得到 1，但 L1_1[A] 仍是 0！
```

**問題**：Core 1 讀到了過期的資料（Stale Data）

**解決方案**：Cache Coherence Protocol 確保 Core 0 的寫入會 **Invalidate** Core 1 的副本

### Single-Writer, Multiple-Reader 不變式

Cache Coherence Protocol 管理對共享資料的存取，使得：
- **一次只有一個處理器可以寫入** Cache Line
- **多個處理器可以同時讀取** Cache Line 而沒有任何問題

這個不變式確保了 **Sequential Consistency** 或更弱的記憶體一致性模型。

## Cache 組態選項

### Private L2 Cache

**特點：**
- Router 的 Injection/Ejection Port 只連接到一個元件
- L2 Cache Hit 時延遲最低
- 頻繁存取的資料保持在靠近處理器的位置
- **缺點**：共享資料會在多個 Private Cache 中複製，導致 On-chip 儲存使用效率較低

### Shared L2 Cache

**特點：**
- Network 必須同時連接 L1 和 L2
- 兩級 Cache 共享 Router 的 Injection/Ejection 頻寬
- 更有效利用儲存空間（無複製）
- 可能減少 Off-chip 頻寬壓力
- **缺點**：L2 Cache Hit 需要額外的延遲來從不同 Tile 請求資料

![Figure 2.4: Private and shared caches](/images/ch02/Figure%202.4.jpg)

> **圖 2.4 解說**：左側展示 Private L2 Cache 架構，每個 Core 有自己的 L2；右側展示 Shared L2 Cache 架構，L2 被切分成多個 Bank 分布在晶片上。

### 選擇依據

| 考量因素 | Private L2 較佳 | Shared L2 較佳 |
|----------|----------------|----------------|
| **工作負載** | 資料局部性高 | 大量共享資料 |
| **延遲敏感度** | 極度敏感 | 可接受網路延遲 |
| **儲存效率** | 不重要 | 重要 |
| **設計複雜度** | 偏好簡單 | 可接受複雜設計 |

## Cache Miss 處理流程

### Private L2 Hit 案例

1. Core 發出 LD A
2. L1 Cache Miss
3. 查詢 Private L2 → Hit!
4. 資料返回 L1 和 Core

**網路穿越次數：0**（本地完成）

### Private L2 Miss 案例

1. Core 發出 LD A
2. L1 Cache Miss
3. 查詢 Private L2 → Miss
4. 請求發送到 Network Interface
5. 透過網路發送到 Memory Controller
6. Off-chip 記憶體存取
7. 資料透過網路返回
8. 資料安裝到 L2 和 L1，傳送給 Core

**網路穿越次數：2**（去程 + 回程）

![Figure 2.5: Private L2 caches walk-through example](/images/ch02/Figure%202.5.jpg)

> **圖 2.5 解說**：展示 Private L2 Cache 架構下，Cache Miss 時的資料流動。注意 L2 Hit 時完全不需要使用網路，而 L2 Miss 需要兩次網路穿越。

### Shared L2 Hit 案例

1. Core 發出 LD A
2. L1 Cache Miss
3. 請求發送到 Network Interface
4. 透過網路發送到 A 對應的 L2 Bank
5. L2 Bank Hit!
6. 資料發送到 Network Interface
7. 透過網路返回給 Requestor
8. 資料安裝到 L1，傳送給 Core

**網路穿越次數：2**（去程 + 回程）

### Shared L2 Miss 案例

1. Core 發出 LD A
2. L1 Cache Miss
3. 請求發送到 Network Interface
4. 透過網路發送到 A 對應的 L2 Bank
5. L2 Bank Miss
6. 請求發送到 Memory Controller
7. Off-chip 記憶體存取
8. 資料返回並安裝到 L2 Bank
9. 資料透過網路返回給 Requestor
10. 資料安裝到 L1，傳送給 Core

**網路穿越次數：4**

![Figure 2.6: Shared L2 cache walk-through example](/images/ch02/Figure%202.6.jpg)

> **圖 2.6 解說**：展示 Shared L2 Cache 架構下的資料流動。即使 L2 Hit，也需要兩次網路穿越；L2 Miss 則需要四次。

## 網路流量分析

| Cache 組態 | L2 Hit | L2 Miss |
|------------|--------|---------|
| **Private L2** | 0 次網路穿越 | 2 次網路穿越 + Off-chip |
| **Shared L2** | 2 次網路穿越 | 4 次網路穿越 + Off-chip |

::: tip 設計權衡
- **Private L2**：L2 Hit 延遲低，但儲存效率差，Off-chip 流量可能增加
- **Shared L2**：儲存效率高，但所有 L1 Miss 都需要使用網路
:::

### 對 NoC 設計的影響

| Cache 組態 | NoC 頻寬需求 | NoC 延遲敏感度 |
|------------|--------------|----------------|
| **Private L2** | 較低 | 中等（只影響 L2 Miss） |
| **Shared L2** | 較高 | 高（影響所有 L1 Miss） |

## Home Node 與 Memory Controller

### Home Node 概念

在 Directory Protocol 中，每個位址靜態映射到一個 **Home Node**。Directory 資訊位於 Home Node，負責對映射到此 Node 的所有位址的請求進行排序和處理。

Home Node 的職責：
- 從 Off-chip Memory 或另一個 Socket 提供資料
- 向其他 On-chip Node 發送 Intervention Message 以獲取資料和/或 Coherence 請求的權限

### 位址映射

典型的位址到 Home Node 映射：

```
Address [63:0]
        ├── [63:12] Page Number
        │           ├── [63:N] Home Node ID
        │           └── [N-1:12] Page Offset
        └── [11:0]  Block Offset
```

這種映射確保相鄰的 Cache Block 可能映射到不同的 Home Node，以達成負載平衡。

### Memory Controller 放置

Memory Controller 可以有兩種放置方式：

**選項 A：與 Core 和 Cache 共置**
- Memory Controller 與 Cache 共享 Injection/Ejection 頻寬
- 需要仲裁策略

**選項 B：獨立 Node**
- Memory Controller 擁有完整的 Injection/Ejection 頻寬
- 流量更加隔離
- 通常放置在晶片邊緣以接近 I/O Pad

![Figure 2.7: Memory controllers](/images/ch02/Figure%202.7.jpg)

> **圖 2.7 解說**：展示兩種 Memory Controller 放置方式。左側為共置方式，右側為獨立 Node 方式。獨立 Node 通常放置在晶片邊緣。

## 相關研究進展

### On-chip Cache 與網路整合

- **Intel Larrabee**：Shared L2 Cache 設計，每個 Core 快速存取自己的 L2 子集，使用 Ring Network 與遠端 L2 Cache 通訊
- **NUCA（Non-Uniform Cache Architecture）**：利用 On-chip Network 在大型 Shared Cache 的 Bank 之間快速移動資料到處理器
- **TRIPS**：同時使用 Scalar Operand Network 和 On-chip Cache Network

### Traffic 特性化與優先級

理解 NoC Traffic 特性對於促進 Traffic 優先級排序和設計 QoS 機制至關重要：
- 不同 Coherence Message 的相對重要性
- Message 的頻寬 vs. 延遲敏感性
- 系統級行為

## 相關章節

- [Coherence Protocol](./coherence-protocol) - Cache Coherence 協議詳解
- [Flow Control](/05-flow-control/) - 如何處理 Coherence 流量
- [Case Studies](/08-case-studies/) - 實際 CMP 系統分析

## 參考資料

- On-Chip Networks Second Edition, Chapter 2.1
