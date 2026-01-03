# Shared Memory Networks

## 概述

平行程式設計極其困難，但隨著 Many-core 架構的出現已變得越來越重要。維護一個全域 Shared Address Space 減輕了程式設計師編寫高效能平行程式碼的負擔，因為理解全域 Address Space 比理解分割的 Address Space 更容易。

我們將討論重點放在 Shared-Memory CMP 上，因為它們預計將成為未來幾年的主流 Multi-core 架構。與 SMP 類似，CMP 通常具有 Shared Global Address Space；然而與 SMP 不同，CMP 可能表現出非均勻記憶體存取延遲（NUMA）。

## Shared Memory CMP 架構

典型的 64 個 Node 的 Shared Memory Multiprocessor 中，一個 Node 包含一個處理器、Private L1 Instruction 和 Data Cache，以及可能是 Private 或 Shared 的 L2 Cache。

![Figure 2.1: Shared memory chip multiprocessor architecture](/images/ch02/Figure%202.1.jpg)

## Cache Hierarchy 與通訊

Cache 被用來減少記憶體延遲並作為需要發送到互連網路的流量的過濾器。Cache Hierarchy 複製資料以減少存取資料的延遲，但這使 Shared Memory 範式中記憶體的邏輯統一視圖變得複雜。

## Cache Coherence 的必要性

Cache 被設計為對程式設計師透明。它們透過將頻繁存取的資料保持在靠近處理器的位置來提高效能，但程式設計師無需管理它們。這種透明性在多處理器系統中也是可取的；然而，多個 Cache 的存在可能導致正確性問題——如果同一位址的不同版本同時存在於多個位置。

::: warning Cache Coherence 問題
當多個 Core 各自擁有 Private Cache 時，同一筆資料可能存在多個副本。Cache Coherence Protocol 被設計來解決這個挑戰，而不給程式設計師帶來負擔。
:::

### Single-Writer, Multiple-Reader 不變式

Cache Coherence Protocol 管理對共享資料的存取，使得：
- **一次只有一個處理器可以寫入** Cache Line
- **多個處理器可以同時讀取** Cache Line 而沒有任何問題

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

## Cache Miss 處理流程

### Private L2 Hit 案例

1. Core 發出 LD A
2. L1 Cache Miss
3. 查詢 Private L2 → Hit!
4. 資料返回 L1 和 Core

網路穿越次數：0（本地完成）

### Private L2 Miss 案例

1. Core 發出 LD A
2. L1 Cache Miss
3. 查詢 Private L2 → Miss
4. 請求發送到 Network Interface
5. 透過網路發送到 Memory Controller
6. Off-chip 記憶體存取
7. 資料透過網路返回
8. 資料安裝到 L2 和 L1，傳送給 Core

網路穿越次數：2（去程 + 回程）

![Figure 2.5: Private L2 caches walk-through example](/images/ch02/Figure%202.5.jpg)

### Shared L2 Hit 案例

1. Core 發出 LD A
2. L1 Cache Miss
3. 請求發送到 Network Interface
4. 透過網路發送到 A 對應的 L2 Bank
5. L2 Bank Hit!
6. 資料發送到 Network Interface
7. 透過網路返回給 Requestor
8. 資料安裝到 L1，傳送給 Core

網路穿越次數：2（去程 + 回程）

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

網路穿越次數：4

![Figure 2.6: Shared L2 cache walk-through example](/images/ch02/Figure%202.6.jpg)

## 網路流量分析

| Cache 組態 | L2 Hit | L2 Miss |
|------------|--------|---------|
| **Private L2** | 0 次網路穿越 | 2 次網路穿越 + Off-chip |
| **Shared L2** | 2 次網路穿越 | 4 次網路穿越 + Off-chip |

::: tip 設計權衡
- **Private L2**：L2 Hit 延遲低，但儲存效率差，Off-chip 流量可能增加
- **Shared L2**：儲存效率高，但所有 L1 Miss 都需要使用網路
:::

## Home Node 與 Memory Controller

### Home Node 概念

在 Directory Protocol 中，每個位址靜態映射到一個 **Home Node**。Directory 資訊位於 Home Node，負責對映射到此 Node 的所有位址的請求進行排序和處理。

Home Node 的職責：
- 從 Off-chip Memory 或另一個 Socket 提供資料
- 向其他 On-chip Node 發送 Intervention Message 以獲取資料和/或 Coherence 請求的權限

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

## 參考資料

- On-Chip Networks Second Edition, Chapter 2.1

