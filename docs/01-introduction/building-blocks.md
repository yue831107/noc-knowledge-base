# Building Blocks

On-chip Network 由多個相互關聯的元件組成，這些元件共同決定了網路的效能和成本特性。本節介紹 NoC 的四個主要建構區塊。

## NoC 的四大建構區塊

一個完整的 On-chip Network 設計涵蓋以下四個主要領域：

| 建構區塊 | 對應章節 | 主要關注點 |
|----------|----------|------------|
| **Topology** | Chapter 3 | Node 和 Channel 的排列方式 |
| **Routing** | Chapter 4 | Packet 如何穿越網路 |
| **Flow Control** | Chapter 5 | 資源如何分配給 Packet |
| **Router Microarchitecture** | Chapter 6 | Router 的實際微架構實作 |

這四個元件中的設計選擇是相互關聯的，需要綜合考量。

## Topology（拓撲）

**Topology** 決定了 Network 中 Node 和 Channel 的實體排列方式。

### 主要拓撲類型

- **Direct Topology**：每個 Router 都連接一個 Terminal Node（如 Ring、Mesh、Torus）
- **Indirect Topology**：某些 Router 僅用於轉發（如 Crossbar、Butterfly、Fat Tree）

### 拓撲選擇的考量

Topology 的選擇會影響：
- **網路直徑**：最長路徑的長度
- **路徑多樣性**：Source 到 Destination 之間可用路徑的數量
- **佈線複雜度**：實體佈線的難易程度
- **面積成本**：所需的 Router 和 Link 數量

## Routing（路由）

**Routing** 決定了 Packet 從 Source 到 Destination 所經過的路徑。

### 路由演算法分類

::: tip 路由演算法的關鍵屬性
一個好的路由演算法需要提供：
1. **最短路徑**或接近最短的路徑
2. **負載平衡**以分散流量
3. **Deadlock-free**以避免死鎖
4. **低延遲的路由決策**
:::

| 分類方式 | 類型 | 說明 |
|----------|------|------|
| **依資訊來源** | Oblivious | 不考慮網路狀態 |
| | Adaptive | 根據網路狀態動態調整 |
| **依決策地點** | Source Routing | 在 Source 端決定完整路徑 |
| | Distributed Routing | 每個 Router 獨立決策 |
| **依路徑選擇** | Deterministic | 相同 Source-Destination 永遠走相同路徑 |
| | Minimal | 只走最短路徑 |

### 常見路由演算法

最常見的確定性路由是 **Dimension-Ordered Routing (DOR)**：
- 在 2D Mesh 中稱為 **XY Routing**
- 先沿 X 軸移動，再沿 Y 軸移動
- 簡單且保證 Deadlock-free

## Flow Control（流量控制）

**Flow Control** 處理 Packet 在網路中的資源分配，包括 Buffer 和 Channel 的分配。

### 資料單位層級

- **Message**：最高層級的傳輸單位
- **Packet**：網路層級的單位，包含路由資訊
- **Flit**：Flow Control 層級的單位（Flow control unit）
- **Phit**：Physical Transfer 單位

### 主要 Flow Control 機制

| 機制 | 緩衝需求 | 特點 |
|------|----------|------|
| **Store-and-Forward** | 完整 Packet | 簡單但延遲高 |
| **Virtual Cut-Through** | 完整 Packet | 可 Pipeline |
| **Wormhole** | 少數 Flit | 低延遲、低緩衝需求 |

### Virtual Channel

**Virtual Channel (VC)** 是 On-chip Network 中的重要概念：

- 一個 Physical Channel 可以被多個 Virtual Channel 共享
- 提供 Deadlock Avoidance 的機制
- 增加網路利用率
- 支援 QoS 和優先權

## Router Microarchitecture

Router 是 Network 的核心元件，其微架構設計直接影響效能和功耗。

### Router 內部結構

Router 包含以下主要元件：
- **Input Buffers**：per-VC 或 per-port 的緩衝區
- **Route Computation**：計算輸出方向（RC / Lookahead）
- **VC Allocation**：分配 Virtual Channel（Separable/Wavefront）
- **Switch Allocation**：仲裁 Crossbar 使用權
- **Crossbar Switch**：N×N multiplexer

### Router Pipeline 階段

典型的 Router 操作分為多個 Pipeline 階段：

1. **Buffer Write (BW)**：將 Flit 寫入輸入緩衝區
2. **Route Computation (RC)**：計算輸出方向
3. **VC Allocation (VA)**：分配輸出端的 Virtual Channel
4. **Switch Allocation (SA)**：競爭 Crossbar 使用權
5. **Switch Traversal (ST)**：穿越 Crossbar
6. **Link Traversal (LT)**：在 Link 上傳輸到下一個 Router

### 效能與成本權衡

Router 設計需要在多個因素之間取得平衡：

| 設計選擇 | 效能影響 | 成本影響 |
|----------|----------|----------|
| 更多 VC | 提高吞吐量 | 增加面積和功耗 |
| 更深 Buffer | 降低 Blocking | 增加面積和延遲 |
| 更多 Port | 支援更高 Radix | 面積二次方增長 |
| Pipeline 更短 | 降低延遲 | 可能降低頻率 |

## Link Architecture

**Link** 連接相鄰的 Router，在 On-chip 環境中有其獨特設計。

### On-chip Link 特性

大多數 On-chip Network 使用傳統的 Full-swing 邏輯和 Repeated Wire：

- **Full-swing Wire**：傳輸 1 時從 0V 轉換到供應電壓，傳輸 0 時轉回
- **Repeater**：在長 Wire 上等間隔放置以減少延遲
- **Pipeline Register**：長距離 Link 可能需要 Register 來維持時序

### Link 組成

Link 包含：
- Data Wires（Flit Width）
- Control Wires（Flow Control）
- Optional: Clock 等

## 後續章節預覽

| 章節 | 建構區塊 | 重點內容 |
|------|----------|----------|
| Chapter 3 | Topology | Ring、Mesh、Torus、Fat Tree 等 |
| Chapter 4 | Routing | XY Routing、Adaptive Routing、Deadlock Avoidance |
| Chapter 5 | Flow Control | Wormhole、Virtual Channel、Credit-based |
| Chapter 6 | Router | Pipeline、Buffer、Allocator、Crossbar |

## 參考資料

- On-Chip Networks Second Edition, Chapter 1.3.2

