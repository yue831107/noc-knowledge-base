# Virtual Channels

**Virtual Channel (VC)** 是一種將單一 Physical Channel 多工成多個邏輯 Channel 的技術，每個 VC 有獨立的 Buffer。這是 On-chip Network 中最重要的 Flow Control 機制之一。

## 概念

Virtual Channel 將一個 Physical Channel 分成多個獨立的邏輯 Channel：
- 每個 VC 有自己的 Buffer（稱為 **Virtual Channel Buffer**）
- 多個 VC 共享同一條 Physical Link
- 不同 Packet 可以分配到不同 VC
- 一個 VC 阻塞不影響其他 VC

![Figure 5.6: Virtual Channel Flow Control](/images/ch05/Figure%205.6.jpg)

## 運作原理

### VC Flow Control 流程

1. **VC 分配**：
   - Head Flit 到達時，請求分配 VC
   - VC Allocator 分配一個空閒的 VC
   - 該 VC 被標記為已佔用

2. **Flit 傳輸**：
   - 後續 Flit 使用相同 VC
   - 多個 VC 的 Flit 可以在同一 Link 上 **Interleave**（交錯傳輸）

3. **VC 釋放**：
   - Tail Flit 傳輸完成後
   - 釋放 VC 給其他 Packet 使用

### 與 Wormhole 的結合

VC Flow Control 通常與 Wormhole 結合使用：
- **Buffer 分配**：Flit 級別（每個 VC 獨立）
- **Link 分配**：Flit 級別（多個 VC 可以交錯使用 Link）

這與純 Wormhole 不同，純 Wormhole 的 Link 是 Packet 級別分配。

## 解決 Head-of-line Blocking

### 問題回顧

在純 Wormhole 中：
- 當 Head Flit 被阻擋，整個 Packet 停止
- 後方其他 Packet（即使要去不同方向）也被阻擋
- 這就是 **Head-of-line (HOL) Blocking**

### VC 解決方案

以 Figure 5.6 為例：

- **Packet A**（淺灰色）使用 VC 0，目的地是 East
- **Packet B**（深灰色）使用 VC 1，目的地是 North
- 當 Packet A 被 East Port 阻擋時：
  - Packet A 的 Flit 停在 VC 0
  - Packet B 可以繼續使用 VC 1 前進到 North
  - **不會被 Packet A 阻擋！**

### 效果

- 不同目的地的 Packet 可以獨立前進
- Link 效率提高（不會因一個 Packet 阻塞而閒置）
- 整體吞吐量增加

## VC 的多種用途

Virtual Channel 不只解決 HOL Blocking，還有許多重要用途：

### 1. Traffic Class Separation

分離不同類型的流量，避免互相干擾：

| VC | Traffic Class | 說明 |
|----|---------------|------|
| VC 0 | Request | Cache 請求訊息 |
| VC 1 | Response | Cache 回應訊息 |
| VC 2 | Writeback | 寫回訊息 |

::: tip Protocol Deadlock 預防
在 Cache Coherence Protocol 中，Request 和 Response 使用不同 VC 可以避免 Protocol-level Deadlock。例如，Response 不會被 Request 阻擋。
:::

### 2. QoS (Quality of Service) Support

為不同優先級的流量提供不同服務品質：

| VC | 優先級 | 用途 |
|----|--------|------|
| VC 0 | 高 | Real-time、低延遲流量 |
| VC 1 | 中 | 一般計算流量 |
| VC 2 | 低 | Background、Prefetch 流量 |

高優先級 VC 可以優先使用 Link，確保低延遲。

### 3. Deadlock Avoidance

使用 VC 打破 Channel Dependency Graph 中的 Cycle：

- **Dateline**：在跨越特定邊界時切換 VC
- **Escape VC**：保留一個 VC 使用 Deadlock-free Routing
- 詳見 [Deadlock-free Flow Control](./deadlock-free)

### 4. Adaptive Routing Support

支援 Adaptive Routing Algorithm：

- 不同方向的路由使用不同 VC
- 避免 Adaptive Routing 引入的 Deadlock
- 提高路由靈活性

## 設計考量

### VC 數量

| VC 數量 | 優點 | 缺點 |
|---------|------|------|
| 少（2-4） | 面積小、功耗低 | HOL Blocking 緩解有限 |
| 多（8+） | 更好的隔離效果 | 面積大、VC Allocator 複雜 |

典型設計使用 **4-8 個 VC**。

### Buffer 深度

每個 VC 的 Buffer 深度影響效能：

$$
Buffer_{depth} \geq \frac{RTT \times Bandwidth}{Flit_{size}}
$$

- **RTT**：Round-trip Time（Credit 返回時間）
- **Bandwidth**：Link 頻寬
- **Flit size**：Flit 大小

::: warning 總 Buffer 增加
使用 VC 會增加總 Buffer 量：
- 純 Wormhole：每 Port 需要幾個 Flit Buffer
- 使用 VC：每 Port 需要 (VC 數量 × 每 VC Buffer 深度) 的 Buffer
:::

### VC Allocator 複雜度

VC Allocator 需要在多個請求中選擇：
- 輸入：多個等待分配 VC 的 Head Flit
- 輸出：為每個 Head Flit 分配一個 VC

複雜度隨 VC 數量和 Port 數量增加。

## VC vs Wormhole 比較

| 特性 | 純 Wormhole | VC Flow Control |
|------|-------------|-----------------|
| Buffer 分配 | Flit | Flit（每 VC 獨立） |
| Link 分配 | Packet | Flit（可 Interleave） |
| HOL Blocking | 嚴重 | 緩解 |
| Buffer 需求 | 最小 | 較多（VC 數量 × 深度） |
| 複雜度 | 低 | 中等（需要 VC Allocator） |
| Deadlock 處理 | 依賴 Routing | 可用 VC 打破 Cycle |

## 實際應用

大多數現代 On-chip Network 都使用 Virtual Channel：

- **Intel Xeon Phi**：使用 VC 分離不同 Traffic Class
- **Tilera TILE-Gx**：4 個 VC 用於不同優先級
- **NVIDIA GPU**：使用 VC 處理不同類型的記憶體請求

## 參考資料

- On-Chip Networks Second Edition, Chapter 5.5
