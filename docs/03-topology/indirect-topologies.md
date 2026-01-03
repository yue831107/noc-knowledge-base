# Indirect Topologies: Crossbar、Butterfly、Clos 和 Fat Tree

**Indirect Network** 透過一個或多個中間 Switch Node 階段連接 Terminal Node。只有 Terminal Node 是流量的 Source 和 Destination，中間 Node 只是在 Terminal Node 之間轉發流量。

## Crossbar

最簡單的 Indirect Topology 是 **Crossbar**。Crossbar 透過 n × m 個簡單的 Crosspoint Switch Node 將 n 個輸入連接到 m 個輸出。

### 特性

| 指標 | 值 |
|------|-----|
| Hop Count | 1 |
| Latency | 最低 |
| Bandwidth | 最高 |
| 成本 | O(N²) |

### Non-blocking

Crossbar 稱為 **Non-blocking**，因為它總是可以將發送方連接到唯一的接收方。

### 限制

Crossbar 的面積隨 Port 數量的平方增長，因此不適合大規模系統。Crossbar 將在 Chapter 6 Router Microarchitecture 中進一步討論。

## Butterfly Network

**Butterfly Network** 是 Indirect Topology 的一個例子。Butterfly Network 可以用 **k-ary n-fly** 描述：
- **k^n** 個 Terminal Node（例如 Core、Memory）
- **n** 級的 **k^(n-1)** 個 k × k 中間 Switch Node
- **k** 是 Switch 的 Degree
- **n** 是 Switch 級數

![Figure 3.3: A 2-ary 3-fly butterfly network](/images/ch03/Figure%203.3.jpg)

### 分析

| 指標 | 值 |
|------|-----|
| 每個中間 Switch 的 Degree | 2k |
| Hop Count | n - 1（固定，所有 Source-Destination 對相同） |
| Uniform Random Traffic 的 Maximum Channel Load | 1 |
| Maximum Injection Throughput | 1 flit/node/cycle |

### 優點

- 低 Hop Count
- 對 Uniform Traffic 有良好的頻寬

### 缺點

- **缺乏 Path Diversity**：沒有 Path Diversity，Butterfly Network 在不平衡流量模式下表現不佳
- **無法利用 Locality**：無法利用 Node 之間的局部性
- 對需要大量流量從一半發送到另一半的流量模式，Maximum Channel Load 會增加

## Flattened Butterfly

**Flattened Butterfly** 是 Butterfly 的折疊版本，將一行中的所有中間 Switch 折疊成一個 Switch，將 Indirect 版本轉換為 Direct 版本。

![Figure 3.4: A 4×4 flattened butterfly network](/images/ch03/Figure%203.4.jpg)

### 特性

- 每個 2 × 2 Switch 變成更高 Radix 的 Switch
- 在 4 × 4 版本中，每個 Router 有 7 個 Port（包括一個連接 Core 的 Port）
- Maximum Hop Count：2

### Routing 挑戰

Minimal Routing 在平衡流量負載方面做得很差，因此必須選擇 Non-minimal Path，從而增加 Hop Count。

## Clos Network

**對稱 Clos Network** 是三級網路，由 triple (m, n, r) 表徵：
- **m**：Middle Stage Switch 的數量
- **n**：每個 Input/Output Switch 的 Input/Output Port 數
- **r**：First/Last Stage Switch 的數量

![Figure 3.5: An (m=5, n=3, r=4) symmetric Clos network](/images/ch03/Figure%203.5.jpg)

### 特性

| 指標 | 值 |
|------|-----|
| 總 Node 數 | r × n |
| Hop Count | 4（所有 Source-Destination 對相同） |
| First/Last Stage Switch Degree | n + m |
| Middle Stage Switch Degree | 2r |
| Path Diversity | \|R_src-dst\| = m |

### Non-blocking 條件

當 **m ≥ 2n - 1** 時，Clos Network 是 **Strictly Non-blocking**，即任何輸入 Port 都可以連接到任何唯一的輸出 Port，就像 Crossbar 一樣。

### 缺點

Clos Network 無法利用 Source 和 Destination 對之間的 Locality。

## Fat Tree

**Fat Tree** 在邏輯上是一個 Binary Tree Network，其中連接資源（佈線）在靠近 Root Node 的階段增加。

![Figure 3.6: A fat tree network](/images/ch03/Figure%203.6.jpg)

### 結構

Fat Tree 可以從 **Folded Clos Network** 建構（如 Figure 3.6b 所示），在 Tree Network 上提供 Path Diversity。Clos 在 Root 處折疊回自身，邏輯上形成一個 5 級 Clos Network。

### 路由

Message 在 Tree 中向上路由，直到到達共同祖先，然後向下路由到目的地。這允許 Fat Tree 利用相鄰通訊 Node 之間的 Locality。

### 特性

| 指標 | 值 |
|------|-----|
| Switch 的邏輯 Degree | 4 |
| 上層 Link 寬度 | 比下層更寬 |
| Path Diversity | 由 Folded Clos 結構提供 |

### 應用

- Data Center 網路
- 高效能運算系統

## Indirect Topology 比較

| 特性 | Crossbar | Butterfly | Clos | Fat Tree |
|------|----------|-----------|------|----------|
| 類型 | Single-stage | Multi-stage | Multi-stage | Hierarchical |
| Hop Count | 1 | n-1 | 4 | 可變 |
| Path Diversity | N/A | 無 | m | 有 |
| Scalability | 差 | 中等 | 好 | 好 |
| Locality Support | 無 | 無 | 無 | 有 |
| 實作複雜度 | O(N²) | 中等 | 中等 | 高 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 3.3
