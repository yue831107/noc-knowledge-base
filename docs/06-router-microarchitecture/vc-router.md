# Virtual Channel Router 架構

本節介紹 **Credit-based Virtual Channel Router** 的 Microarchitecture，說明典型 Router 的運作方式。

## Router 架構概覽

![Figure 6.1: Credit-based Virtual Channel Router Microarchitecture](/images/ch06/Figure%206.1.jpg)

> **圖 6.1 解說**：此圖是理解 NoC Router 內部運作的核心。Router 包含五大元件：Input Buffers（暫存進入的 Flit）、Route Computation（計算輸出方向）、VC Allocator（分配虛擬通道）、Switch Allocator（仲裁 Crossbar 使用權）、Crossbar Switch（實際轉發 Flit）。圖中也顯示 Credit 訊號如何在 Router 之間流動以進行 [Flow Control](/05-flow-control/buffer-backpressure)。

Figure 6.1 展示了一個最先進的 Credit-based VC Router 架構。假設是 2-D Mesh，Router 有 5 個輸入和輸出 Port，對應四個鄰居方向和本地 Processing Element (PE) Port。

### 主要元件

| 元件 | 功能 |
|------|------|
| **Input Buffers** | 在 Flit 進入 Router 時儲存，並在 Router 中保持 |
| **Route Computation** | 計算（或查詢）Packet 的正確輸出 Port |
| **VC Allocator** | 解決輸出 VC 的競爭，將 VC 分配給輸入 VC |
| **Switch Allocator** | 決定哪些 Flit 被選中穿越 Crossbar |
| **Crossbar Switch** | 負責將 Flit 從輸入 Port 物理移動到輸出 Port |

### Input Buffered 設計

大多數 On-chip Network Router 採用 **Input Buffered** 設計：
- Packet 只在輸入 Port 的 Buffer 中儲存
- 允許使用單埠記憶體（Single-ported Memory），節省面積和功耗
- 本範例假設每個輸入 Port 有 4 個 VC，每個 VC 有自己的 Buffer Queue（4 Flit 深）

### 與 Processor Pipeline 的差異

Router 的 Buffer 運作與 Processor Pipeline 不同：
- **Processor**：在每個 Pipeline Stage 之間使用 Buffer Latch 指令
- **Router**：Flit 在進入 Router 時寫入 Buffer，並在整個停留期間保持在同一 Buffer

## VC 狀態

每個 [Virtual Channel](/05-flow-control/virtual-channels) 需要維護以下狀態：

| 狀態 | 說明 |
|------|------|
| **Global (G)** | Idle / Routing / 等待輸出 VC / 等待輸出 VC 的 Credit / Active |
| **Route (R)** | Packet 的輸出 Port，由 Head Flit 的 Route Computation 填入 |
| **Output VC (O)** | 輸出 VC（下游 Router 的 VC），由 Head Flit 的 VA 填入 |
| **Credit Count (C)** | 輸出 Port R 的 VC O 的可用 Credit 數量 |
| **Pointers (P)** | Head 和 Tail Flit 的指標（用於 Variable-length Queue） |

### 狀態使用方式

- **Route (R)**：用於 Switch Allocation，Head Flit 做完 Route Computation 後填入
- **Output VC (O)**：由 Head Flit 做完 VA 後填入，供後續 Body/Tail Flit 使用
- **Credit Count (C)**：用於 Body 和 Tail Flit 的 Flow Control
- **Pointers (P)**：用於 Shared Pool / Variable-length Queue 的 Buffer 管理

## Head / Body / Tail Flit 處理流程

### Head Flit 流程

```
BW → RC → VA → SA → ST → LT
```

1. **Buffer Write (BW)**：Head Flit 到達，寫入 Buffer
2. **Route Computation (RC)**：計算輸出 Port（參見 [Routing](/04-routing/)）
3. **VC Allocation (VA)**：分配下游 Router 的 VC
4. **Switch Allocation (SA)**：競爭 Crossbar（參見 [Allocators](/06-router-microarchitecture/allocators)）
5. **Switch Traversal (ST)**：穿越 Crossbar
6. **Link Traversal (LT)**：傳輸到下一個 Router

### Body / Tail Flit 流程

```
BW → SA → ST → LT
```

- 不需要 RC（繼承 Head 的路由）
- 不需要 VA（繼承 Head 分配的 VC）
- **Tail Flit**：離開 Router 時釋放 Head 預留的 VC

## 無 VC 的 Wormhole Router

沒有 VC 的 [Wormhole](/05-flow-control/flit-based) Router 不需要 VA Stage：

- 不需要 VC Allocator
- 每個輸入 Port 只有一個 Deep Buffer Queue
- Pipeline 簡化：BW → RC → SA → ST → LT

這種 Router 更簡單，但會遭受 Head-of-line Blocking。

## Credit 機制

Router 使用 Credit 進行 Flow Control：
- **Credits Out**：當下游 Buffer 空出時，發送 Credit 給上游
- **Credits In**：接收下游的 Credit，更新 Credit Count

Credit Count 決定是否可以發送 Flit：
- Credit > 0：可以發送
- Credit = 0：必須等待

## 相關章節

- [Buffers](/06-router-microarchitecture/buffers) - Buffer 組織與設計
- [Allocators](/06-router-microarchitecture/allocators) - VC 和 Switch Allocator 設計
- [Pipeline](/06-router-microarchitecture/pipeline) - Router Pipeline 優化技術
- [Virtual Channels](/05-flow-control/virtual-channels) - VC 的概念與用途

## 參考資料

- On-Chip Networks Second Edition, Chapter 6.1
