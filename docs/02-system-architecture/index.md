# Interface with System Architecture

過去 15 年來，單處理器核心電腦已讓位給 Multi-core 晶片。這些 Multi-core 和 Many-core 系統已成為電腦系統的主要構建模塊，標誌著我們設計和工程這些系統方式的重大轉變。

實現未來的效能提升將依賴於消除處理器與為這些高 Bandwidth（頻寬）Many-core 設計供給資料的記憶體元件之間的通訊瓶頸。執行單元或 Core 之間的高效通訊日益成為提高 Many-core 晶片效能的關鍵因素。

## 從 Bus 到 Network-on-Chip

傳統的 Multi-core 系統使用 **Shared Bus** 連接處理器和記憶體。然而，隨著核心數量增加，Bus 架構面臨嚴重的 Scalability（可擴展性）問題：

| 架構 | 核心數量 | Bandwidth Scaling | Latency 特性 |
|------|----------|-------------------|--------------|
| **Shared Bus** | 2-8 | 固定（共享） | 隨負載增加 |
| **Crossbar** | 8-16 | O(N²) 成本 | 恆定 |
| **NoC** | 16+ | 可擴展 | 取決於 Hop Count |

::: info 為何需要 NoC
當 Core 數量超過 8-16 個時，傳統的 Bus 和 Crossbar 架構在面積、功耗和 Timing Closure 方面都會遇到困難。NoC 提供了一種可擴展的解決方案，使用 Packet-switched Network 在 Core 之間傳輸資料。
:::

## System Architecture 對 NoC 的影響

NoC 並非獨立存在的元件，它必須與整個系統架構緊密配合。不同的系統架構對 NoC 有不同的需求：

### Traffic 特性

| 系統類型 | 主要 Traffic Pattern | Message Size | Latency 敏感度 |
|----------|----------------------|--------------|----------------|
| **CMP** | Many-to-few (Memory Controller) | 小（Request）到大（Data） | 高 |
| **GPU** | Streaming, Burst | 大（Memory Access） | 中 |
| **MPSoC** | 多樣化 | 變化大 | 依應用而定 |

::: tip CMP 的 Many-to-few Traffic Pattern
在 Shared Memory CMP 中，大部分 Traffic 都流向少數幾個 Memory Controller。例如在 64 核心系統中可能只有 4 個 MC，這意味著：
- **去程 Traffic**：64 個 Core → 4 個 MC（Many-to-few）
- **回程 Traffic**：4 個 MC → 64 個 Core（Few-to-many）

這種不對稱的 Traffic Pattern 對 NoC Topology 選擇和 Routing 設計有重要影響。
:::

### Coherence 需求

不同系統對 **Cache Coherence** 的需求不同：

- **Shared Memory CMP**：需要硬體 Coherence Protocol，NoC 必須支援多種 Message Class
- **Message Passing**：不需要硬體 Coherence，但需要高效的 Point-to-Point 通訊
- **Heterogeneous SoC**：可能混合使用，需要靈活的 NoC 設計

## 本章內容

本章探討三種主要的電腦系統類型，On-chip Network 在其中形成關鍵骨幹：

| 系統類型 | 應用領域 | 章節 |
|----------|----------|------|
| **Shared-Memory CMP** | 高階伺服器和嵌入式產品 | [Shared Memory](./shared-memory) |
| **Message Passing** | 大規模 Parallel Processing | [Message Passing](./message-passing) |
| **MPSoC** | 行動消費市場 | [NoC Interface 標準](./noc-interface-standards) |

- [Coherence Protocol](./coherence-protocol) - Cache Coherence 與 NoC 的關係

## 程式設計模型比較

程式設計師如何看待記憶體和通訊，對底層硬體架構有深遠的影響：

### Shared Memory 模型

在 Shared Memory 模型中：
- 所有處理器邏輯上存取相同的 **Global Address Space**
- 通訊透過 **Load/Store** 指令 **Implicit（隱式）** 發生
- 硬體負責維護 **Cache Coherence**
- 程式設計師不需要明確管理資料移動

### Partitioned Global Address Space (PGAS)

::: info 什麼是 PGAS？
**PGAS（Partitioned Global Address Space）** 是一種介於純 Shared Memory 和 Message Passing 之間的程式設計模型。在 PGAS 中：
- 存在一個**全域位址空間**（程式設計師可見）
- 但位址空間被**分割**到不同的處理器/節點
- 程式設計師可以存取任何位址，但需要意識到**本地 vs 遠端**的差異
:::

#### PGAS 位址映射範例

在多 Socket 伺服器中，PGAS 使用位址的高位元來識別資料所在的 Socket：

| 位址範圍 | Socket |
|----------|--------|
| 0x0000_0000_0000_0000 - 0x0000_FFFF_FFFF_FFFF | Socket 0（本地） |
| 0x0001_0000_0000_0000 - 0x0001_FFFF_FFFF_FFFF | Socket 1（遠端） |
| 0x0002_0000_0000_0000 - 0x0002_FFFF_FFFF_FFFF | Socket 2（遠端） |

#### PGAS 的優缺點

| 優點 | 缺點 |
|------|------|
| 全域位址空間簡化程式設計 | 遠端存取 Latency 高 |
| 可以明確優化本地存取 | 需要 NUMA-aware 程式設計 |
| 結合兩種模型的優點 | 硬體實作較複雜 |

#### PGAS 語言與實作

| 語言/模型 | 說明 |
|-----------|------|
| **UPC** | Unified Parallel C |
| **Co-array Fortran** | Fortran 2008 標準的一部分 |
| **Chapel** | Cray 開發的 Parallel 語言 |
| **X10** | IBM 研究的語言 |

### Message Passing 模型

在 Message Passing 模型中：
- 每個處理器有自己的 **Private Address Space**
- 通訊透過 **Send/Receive** 操作 **Explicit（顯式）** 發生
- 程式設計師必須明確管理資料的移動
- 不需要硬體 Cache Coherence

### Implicit vs Explicit 通訊

::: warning 關鍵區別
**Implicit（隱式）** 和 **Explicit（顯式）** 通訊的核心差異在於：程式設計師是否**明確知道**通訊何時發生。
:::

| 類型 | 方式 | 程式設計師視角 |
|------|------|----------------|
| **Implicit** | Load/Store | 程式設計師只寫 `x = data`，**不知道**資料是否需要從遠端取得 |
| **Explicit** | Send/Receive | 程式設計師**明確寫出** `Send(dest, data)` 和 `Receive(src, &data)` |

**範例對比：**

```c
// Shared Memory（Implicit Communication）
int x = shared_array[i];  // 程式設計師不知道這可能觸發：
                          // 1. L1 Cache Hit（本地）
                          // 2. L2 Cache Hit（可能遠端）
                          // 3. 去 Memory Controller 取資料
                          // 4. 從其他 Core 的 Cache 取資料
                          // → 通訊「隱藏」在硬體中

// Message Passing（Explicit Communication）
MPI_Send(&data, 1, MPI_INT, dest, tag, comm);  // 明確知道：發送到 dest
MPI_Recv(&data, 1, MPI_INT, src, tag, comm, &status);  // 明確知道：從 src 接收
                          // → 通訊「可見」於程式碼中
```

**關鍵差異**：Implicit 通訊的成本對程式設計師**不透明**，硬體自動處理；Explicit 通訊的成本**清楚可見**。

### 模型比較總結

| 特性 | Shared Memory | PGAS | Message Passing |
|------|---------------|------|-----------------|
| **Address Space** | 全域共享 | 分割的全域空間 | 分散式 |
| **通訊方式** | Implicit（Load/Store） | Implicit 但 NUMA-aware | Explicit（Send/Receive） |
| **程式設計難度** | 較容易理解 | 中等 | 需明確管理通訊 |
| **硬體複雜度** | 需要 Cache Coherence | 部分需要 | 相對簡單 |
| **Scalability** | 受 Coherence 限制 | 較佳 | 最佳 |
| **效能可預測性** | 較難預測 | 中等 | 較容易預測 |
| **常見 API** | OpenMP, Pthreads | UPC, Chapel | MPI |

### PGAS 為何「部分需要」Cache Coherence？

::: info 關鍵理解
PGAS 的特性是：**全域位址空間，但區分本地/遠端**。這導致 Coherence 需求因存取類型而異。
:::

```
┌─────────────────────────────────────────────────────┐
│                  Global Address Space               │
├─────────────┬─────────────┬─────────────┬───────────┤
│  Node 0     │  Node 1     │  Node 2     │  Node 3   │
│  (本地)     │  (遠端)     │  (遠端)     │  (遠端)   │
└─────────────┴─────────────┴─────────────┴───────────┘
```

| 存取類型 | 是否需要 Coherence | 原因 |
|----------|-------------------|------|
| **本地存取** | ✅ 需要 | 同一 Node 內多個 Core 共享資料，需要 Coherence |
| **遠端存取** | ❌ 通常不需要 | 透過**明確的 Put/Get 操作**，軟體控制一致性 |

**典型 PGAS 實作：**

```c
// UPC 範例
shared int array[N];  // 全域共享陣列

// 本地存取（需要硬體 Coherence）
if (MYTHREAD == 0) {
    array[0] = 100;  // 本地位址，其他 Thread 可能也在存取
}

// 遠端存取（軟體控制，不依賴硬體 Coherence）
upc_memget(&local, &array[remote_idx], sizeof(int));  // 明確的遠端讀取
upc_barrier;  // 明確的 Synchronization 點
```

| 模型 | Coherence 需求 | 原因 |
|------|---------------|------|
| **Shared Memory** | 全部需要 | 任何 Load/Store 都可能存取共享資料 |
| **PGAS** | 部分需要 | Node 內需要，Node 間靠軟體 |
| **Message Passing** | 不需要 | 每個 Node 獨立位址空間，無共享 |

這也是為什麼 PGAS 在大規模系統中較有 Scalability——它減少了跨 Node 的硬體 Coherence Overhead。

::: tip 混合方法
在大規模 Parallel Processing 架構中，混合使用多種模型很常見：
- **Node 內部**：使用 Shared Memory（OpenMP）
- **Node 之間**：使用 Message Passing（MPI）
- **PGAS 層**：提供統一的程式設計介面
:::

## NoC 作為系統骨幹

無論採用哪種程式設計模型，NoC 都扮演著關鍵角色：

### 在 Shared Memory 系統中

NoC 需要支援：
1. **Coherence Request/Response**：Cache Miss 時的請求和回應
2. **Invalidation Message**：通知其他 Cache 資料已過期
3. **Intervention Message**：請求其他 Cache 提供資料
4. **Data Transfer**：傳輸 Cache Line 資料

### 在 Message Passing 系統中

NoC 需要支援：
1. **Point-to-Point Message**：兩個 Node 之間的直接通訊
2. **Collective Operation**：Broadcast、Reduce 等集體操作
3. **DMA Transfer**：大量資料的高效傳輸

## 學習目標

完成本章後，你將能夠：

1. 了解 Shared Memory 系統對 NoC 的需求
2. 理解 Cache Coherence Protocol 如何影響 NoC 設計
3. 比較 Shared Memory、PGAS 和 Message Passing 的差異
4. 認識常見的 NoC 介面標準（AMBA AXI、OCP 等）
5. 理解 Protocol-level Deadlock 的成因和解決方案
6. 分析不同 Cache 組態對網路 Traffic 的影響

## 關鍵術語

| 術語 | 說明 |
|------|------|
| **CMP** | Chip Multiprocessor，晶片多處理器 |
| **SMP** | Symmetric Multiprocessor，對稱多處理器 |
| **NUMA** | Non-Uniform Memory Access，非均勻記憶體存取 |
| **PGAS** | Partitioned Global Address Space，分割的全域位址空間 |
| **MSHR** | Miss Status Handling Register |
| **TSHR** | Transaction Status Handling Register |
| **Home Node** | 負責特定位址 Coherence 的節點 |
| **Directory** | 追蹤 Cache Line 狀態的資料結構 |
| **Latency** | 延遲，資料傳輸所需時間 |
| **Bandwidth** | 頻寬，單位時間內可傳輸的資料量 |
| **Throughput** | 吞吐量，系統單位時間處理的工作量 |
| **Arbitration** | 仲裁，決定多個請求者存取共享資源的順序 |

## 相關章節

- [Topology](/03-topology/) - 網路 Topology 如何影響系統效能
- [Flow Control](/05-flow-control/) - Flow Control 與 Protocol Deadlock
- [Case Studies](/08-case-studies/) - 實際系統的架構分析

## 參考資料

- On-Chip Networks Second Edition, Chapter 2
