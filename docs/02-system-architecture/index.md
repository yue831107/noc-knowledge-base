# Interface with System Architecture

過去 15 年來，單處理器核心電腦已讓位給 Multi-core 晶片。這些 Multi-core 和 Many-core 系統已成為電腦系統的主要構建模塊，標誌著我們設計和工程這些系統方式的重大轉變。

實現未來的效能提升將依賴於消除處理器與為這些高頻寬 Many-core 設計供給資料的記憶體元件之間的通訊瓶頸。執行單元或 Core 之間的高效通訊日益成為提高 Many-core 晶片效能的關鍵因素。

## 本章內容

本章探討三種主要的電腦系統類型，On-chip Network 在其中形成關鍵骨幹：

| 系統類型 | 應用領域 | 章節 |
|----------|----------|------|
| **Shared-Memory CMP** | 高階伺服器和嵌入式產品 | [Shared Memory](./shared-memory) |
| **Message Passing** | 大規模平行處理 | [Message Passing](./message-passing) |
| **MPSoC** | 行動消費市場 | [NoC Interface 標準](./noc-interface-standards) |

- [Coherence Protocol](./coherence-protocol) - Cache Coherence 與 NoC 的關係

## 重點概念

::: tip 系統整合的重要性
NoC 不是獨立存在的，它必須與處理器的 Memory Hierarchy、Coherence Protocol 緊密配合。理解這些介面是設計高效能 NoC 的關鍵。
:::

## 程式設計模型比較

| 特性 | Shared Memory | Message Passing |
|------|---------------|-----------------|
| **Address Space** | 全域共享 | 分散式 |
| **通訊方式** | 隱式（Load/Store） | 顯式（Send/Receive） |
| **程式設計難度** | 較容易理解 | 需明確管理通訊 |
| **硬體複雜度** | 需要 Cache Coherence | 相對簡單 |
| **擴展性** | 受 Coherence 限制 | 較佳 |

### Shared Memory 模型

在 Shared Memory 模型中，通訊透過資料的載入和儲存以及指令的存取隱式發生。所有處理器邏輯上存取相同的 Shared Memory，使每個處理器都能看到最新的資料。

**Partitioned Global Address Space (PGAS)** 在現代 SMP 設計中很常見，其中較高位址位元選擇記憶體位址與哪個 Socket 關聯。

### Message Passing 模型

相比之下，Message Passing 範式在 Node 和 Address Space 之間顯式移動資料，因此程式設計師必須明確管理通訊。在不同 Shared Memory Node 之間使用 Message Passing（如 MPI）的混合方法在大規模平行處理架構中很常見。

## 學習目標

完成本章後，你將能夠：

1. 了解 Shared Memory 系統對 NoC 的需求
2. 理解 Cache Coherence Protocol 如何影響 NoC 設計
3. 比較 Shared Memory 和 Message Passing 的差異
4. 認識常見的 NoC 介面標準（AMBA AXI、OCP 等）
5. 理解 Protocol-level Deadlock 的成因和解決方案

## 關鍵術語

| 術語 | 說明 |
|------|------|
| **CMP** | Chip Multiprocessor，晶片多處理器 |
| **SMP** | Symmetric Multiprocessor，對稱多處理器 |
| **PGAS** | Partitioned Global Address Space |
| **MSHR** | Miss Status Handling Register |
| **TSHR** | Transaction Status Handling Register |
| **Home Node** | 負責特定位址 Coherence 的節點 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 2

