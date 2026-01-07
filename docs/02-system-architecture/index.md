# Interface with System Architecture

過去 15 年來，單處理器核心電腦已讓位給 Multi-core 晶片。這些 Multi-core 和 Many-core 系統已成為電腦系統的主要構建模塊，標誌著我們設計和工程這些系統方式的重大轉變。

實現未來的效能提升將依賴於消除處理器與為這些高頻寬 Many-core 設計供給資料的記憶體元件之間的通訊瓶頸。執行單元或 Core 之間的高效通訊日益成為提高 Many-core 晶片效能的關鍵因素。

## 從 Bus 到 Network-on-Chip

傳統的 Multi-core 系統使用 **Shared Bus** 連接處理器和記憶體。然而，隨著核心數量增加，Bus 架構面臨嚴重的可擴展性問題：

| 架構 | 核心數量 | 頻寬擴展 | 延遲特性 |
|------|----------|----------|----------|
| **Shared Bus** | 2-8 | 固定（共享） | 隨負載增加 |
| **Crossbar** | 8-16 | O(N²) 成本 | 恆定 |
| **NoC** | 16+ | 可擴展 | 取決於 Hop Count |

::: info 為何需要 NoC
當 Core 數量超過 8-16 個時，傳統的 Bus 和 Crossbar 架構在面積、功耗和時序收斂方面都會遇到困難。NoC 提供了一種可擴展的解決方案，使用 Packet-switched Network 在 Core 之間傳輸資料。
:::

## System Architecture 對 NoC 的影響

NoC 並非獨立存在的元件，它必須與整個系統架構緊密配合。不同的系統架構對 NoC 有不同的需求：

### 流量特性

| 系統類型 | 主要流量模式 | Message Size | 延遲敏感度 |
|----------|--------------|--------------|------------|
| **CMP** | Many-to-few (Memory Controller) | 小（Request）到大（Data） | 高 |
| **GPU** | Streaming, Burst | 大（Memory Access） | 中 |
| **MPSoC** | 多樣化 | 變化大 | 依應用而定 |

### 一致性需求

不同系統對 **Cache Coherence** 的需求不同：

- **Shared Memory CMP**：需要硬體 Coherence Protocol，NoC 必須支援多種 Message Class
- **Message Passing**：不需要硬體 Coherence，但需要高效的點對點通訊
- **Heterogeneous SoC**：可能混合使用，需要靈活的 NoC 設計

## 本章內容

本章探討三種主要的電腦系統類型，On-chip Network 在其中形成關鍵骨幹：

| 系統類型 | 應用領域 | 章節 |
|----------|----------|------|
| **Shared-Memory CMP** | 高階伺服器和嵌入式產品 | [Shared Memory](./shared-memory) |
| **Message Passing** | 大規模平行處理 | [Message Passing](./message-passing) |
| **MPSoC** | 行動消費市場 | [NoC Interface 標準](./noc-interface-standards) |

- [Coherence Protocol](./coherence-protocol) - Cache Coherence 與 NoC 的關係

## 程式設計模型比較

程式設計師如何看待記憶體和通訊，對底層硬體架構有深遠的影響：

### Shared Memory 模型

在 Shared Memory 模型中：
- 所有處理器邏輯上存取相同的 **Global Address Space**
- 通訊透過 **Load/Store** 指令隱式發生
- 硬體負責維護 **Cache Coherence**
- 程式設計師不需要明確管理資料移動

**Partitioned Global Address Space (PGAS)** 在現代 SMP 設計中很常見，其中較高位址位元選擇記憶體位址與哪個 Socket 關聯。

### Message Passing 模型

在 Message Passing 模型中：
- 每個處理器有自己的 **Private Address Space**
- 通訊透過 **Send/Receive** 操作顯式發生
- 程式設計師必須明確管理資料的移動
- 不需要硬體 Cache Coherence

### 模型比較總結

| 特性 | Shared Memory | Message Passing |
|------|---------------|-----------------|
| **Address Space** | 全域共享 | 分散式 |
| **通訊方式** | 隱式（Load/Store） | 顯式（Send/Receive） |
| **程式設計難度** | 較容易理解 | 需明確管理通訊 |
| **硬體複雜度** | 需要 Cache Coherence | 相對簡單 |
| **擴展性** | 受 Coherence 限制 | 較佳 |
| **效能可預測性** | 較難預測 | 較容易預測 |
| **常見 API** | OpenMP, Pthreads | MPI |

::: tip 混合方法
在大規模平行處理架構中，混合使用兩種模型很常見：
- **Node 內部**：使用 Shared Memory（OpenMP）
- **Node 之間**：使用 Message Passing（MPI）
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
3. 比較 Shared Memory 和 Message Passing 的差異
4. 認識常見的 NoC 介面標準（AMBA AXI、OCP 等）
5. 理解 Protocol-level Deadlock 的成因和解決方案
6. 分析不同 Cache 組態對網路流量的影響

## 關鍵術語

| 術語 | 說明 |
|------|------|
| **CMP** | Chip Multiprocessor，晶片多處理器 |
| **SMP** | Symmetric Multiprocessor，對稱多處理器 |
| **NUMA** | Non-Uniform Memory Access，非均勻記憶體存取 |
| **PGAS** | Partitioned Global Address Space |
| **MSHR** | Miss Status Handling Register |
| **TSHR** | Transaction Status Handling Register |
| **Home Node** | 負責特定位址 Coherence 的節點 |
| **Directory** | 追蹤 Cache Line 狀態的資料結構 |

## 相關章節

- [Topology](/03-topology/) - 網路拓撲如何影響系統效能
- [Flow Control](/05-flow-control/) - 流量控制與 Protocol Deadlock
- [Case Studies](/08-case-studies/) - 實際系統的架構分析

## 參考資料

- On-Chip Networks Second Edition, Chapter 2
