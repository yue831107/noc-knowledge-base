# Oblivious Routing

使用 **Oblivious Routing Algorithm** 時，路由路徑的選擇與網路狀態無關。透過不使用網路狀態資訊，這些 Routing Algorithm 可以保持簡單。

## 基本概念

- 路徑選擇**不考慮**當前網路狀態（如擁塞程度）
- 但**可能有多條路徑**可選
- 選擇機制通常是**隨機**的

## 與 Deterministic Routing 的差異

| 特性 | Deterministic | Oblivious |
|------|---------------|-----------|
| 路徑數量 | 只有一條路徑 | 可能有多條路徑 |
| 選擇機制 | 不需要選擇機制 | 需要選擇機制（如 Random） |
| Load Balance | 差 | 較好 |
| 實作複雜度 | 最簡單 | 簡單 |

::: info
Deterministic Routing 是 Oblivious Routing 的子集。
:::

## Valiant's Algorithm

**Valiant's Randomized Routing Algorithm** 是 Oblivious Routing 的經典範例。

![Figure 4.4: Oblivious Routing 範例](/images/ch04/Figure%204.4.jpg)

### 運作方式

要使用 Valiant's Algorithm 將 Packet 從 Source *s* 路由到 Destination *d*：

1. **隨機選擇**一個中間目的地 *d'*
2. **Phase 1**：先從 *s* 路由到 *d'*
3. **Phase 2**：再從 *d'* 路由到 *d*

### 優點

- **Load Balance**：透過先路由到隨機選擇的中間目的地，Valiant's Algorithm 能夠在網路中平衡流量
- **隨機化**：使任何流量模式看起來像 Uniform Random
- **Path Diversity**：提供更多路徑選擇

### 缺點

- **破壞 Locality**：例如，透過路由到中間目的地，Mesh 上的近鄰流量的 Locality 被破壞
- **Hop Count 增加**：如 Figure 4.4a 所示，Hop Count 可能從 3 hop 增加到 9 hop
- **延遲增加**：更多 Hop 意味著更高的平均 Packet 延遲
- **能耗增加**：Packet 在網路中消耗更多能量
- **Maximum Channel Load 加倍**：可能使網路頻寬減半

## Minimal Oblivious Routing

**Minimal Oblivious Routing** 透過限制路由選擇只在最短路徑中進行，以保留 Locality。

### 運作方式

在 k-ary n-cube Topology 中，中間 Node *d'* 必須位於由 *s* 和 *d* 為角落 Node 所界定的最小 n 維子網路的 **Minimal Quadrant** 內。

### 範例（Figure 4.4b）

- 現在 *d'* 只能在由 *s* 和 *d* 形成的 Minimal Quadrant 內選擇
- 保持 Minimum Hop Count 為 3
- 圖中顯示一種可能的選擇（另外兩條路徑以虛線顯示）

## 結合 X-Y Routing

無論是 Valiant's Routing（考慮 Minimal 或 Non-minimal 選擇 *d'*），都可以使用 DOR 從 *s* 路由到 *d'*，再從 *d'* 到 *d*：

- 如果使用 DOR，並非所有路徑都會被利用
- 但比起直接從 *s* 確定性路由到 *d*，可以實現更好的 Load Balancing

## Deadlock 考量

::: warning 並非所有 Oblivious Routing 都是 Deadlock-free
- **Valiant's Algorithm + X-Y Routing**：Deadlock-free
- **Minimal Oblivious + X-Y Routing**：Deadlock-free
- **隨機選擇 X-Y 或 Y-X 路由**：**不是** Deadlock-free，因為允許所有四種轉向，可能導致 Figure 4.2 中的循環
:::

## ROMM (Randomized Oblivious Multi-phase Minimal)

結合 Minimal Routing 和隨機化：

1. 只在 **Minimal Path** 中選擇
2. **隨機選擇**要走哪條 Minimal Path

### 特點

- 保留 Locality
- 提供 Load Balance
- 維持 Minimal Hop Count

## 設計權衡

| 特性 | Valiant's | Minimal Oblivious |
|------|-----------|-------------------|
| Load Balance | 最佳 | 良好 |
| Locality | 完全破壞 | 保留 |
| Hop Count | 可能大幅增加 | 維持最小 |
| 延遲 | 較高 | 較低 |
| 能耗 | 較高 | 較低 |
| 頻寬利用 | 可能減半 | 較佳 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 4.4
