# Hierarchical Topologies

到目前為止，我們假設網路 Node 和 Terminal Node 之間是一對一的對應關係，也假設整個系統使用統一的 Topology。然而，這些並不一定是如此。在實際系統中，多個 Node 可能被群集在一個 Topology 中，這些群集透過另一個 Topology 連接在一起，形成階層式設計。

![Figure 3.9: Hierarchical topologies](/images/ch03/Figure%203.9.jpg)

## Concentration（集中）

最簡單的階層式 Topology 形式是多個 Core 使用 **Concentrator** 共享一個 Router Node。

### 工作原理

在 Figure 3.9a 中，四個 Terminal Node（Core、Cache 等）共享一個網路 Router。

### 優點

- **減少 Router 數量**：降低網路所需的 Router 數量
- **減少 Hop Count**：減少網路中的 Hop 數
- **降低面積**：減小網路的大小（面積）
- **提高可擴展性**：幫助網路擴展到更大規模

::: tip 範例
在 Figure 3.9a 中，Concentration 允許使用 3 × 3 Mesh 連接 36 個 Node，只需要 9 個 Router，而不是 36 個。
:::

### 缺點

- **增加網路複雜度**：Concentrator 必須實作頻寬共享策略
- **頻寬共享**：
  - 動態共享：每個 Node 獲得 1/c 的 Injection 頻寬（c 為 Concentration Factor）
  - 靜態分區：固定分配頻寬給每個 Node
- **Injection Port Bottleneck**：在高突發通訊期間，Injection Port 頻寬可能成為瓶頸

### Concentration Factor

**Concentration Factor (c)** 是共享單一 Router 的 Terminal Node 數量。較高的 Concentration Factor 可以減少更多的 Router，但會增加頻寬競爭。

## Hierarchy of Rings（Ring 階層）

Figure 3.9b 展示了另一種階層式 Topology。一個 32 核心晶片被分割成 4 個 Cluster，每個 Cluster 包含 8 個 Core。

### 結構

- **Local Network**：每個 Cluster 透過一個 Bi-directional Ring 連接 8 個 Core
- **Global Network**：四個 Ring 透過另一個 Ring 連接在一起

### 挑戰

這種階層式 Topology 的挑戰在於 **Central Ring 的頻寬仲裁**。

## 設計考量

### 優點

- **減少全域佈線**：減少 Global Wire 的數量
- **分層優化**：可針對不同層級進行優化
- **更好的可擴展性**：更容易擴展到大量 Node

### 缺點

- **跨層級延遲增加**：跨層級通訊延遲增加
- **設計複雜度提高**：需要考慮不同層級之間的介面
- **頻寬管理複雜**：需要在不同層級之間管理頻寬

## 階層式設計範例

### Cluster-based Design

將晶片分成多個 Cluster，每個 Cluster 內部使用一種 Topology（如小型 Mesh），Cluster 之間使用另一種 Topology（如 Ring 或高頻寬 Link）。

**優點**：
- 利用 Cluster 內部的 Locality
- 減少長距離通訊

### 3D Integration

在 3D IC 中，不同層可以使用不同的 Topology：

| 層級 | 用途 | Topology |
|------|------|----------|
| Layer 0 | Cores | 2D Mesh |
| Layer 1 | L2 Cache | 2D Mesh |
| Layer 2 | Memory | Direct connections |

層與層之間透過 **TSV（Through-Silicon Via）** 連接。

## 與其他 Topology 的比較

| 特性 | Flat Topology | Hierarchical Topology |
|------|---------------|----------------------|
| Router 數量 | 多 | 少 |
| 設計複雜度 | 低 | 高 |
| Locality 利用 | 有限 | 良好 |
| 可擴展性 | 有限 | 良好 |
| 最大頻寬 | 固定 | 可分層配置 |
| 延遲一致性 | 較一致 | 取決於層級 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 3.5
