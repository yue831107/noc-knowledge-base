# Topology Metrics

由於 Topology 是設計師在建構 On-chip Network 時首先要做的決定，因此在確定網路的其他方面（如 Routing、Flow Control 和 Microarchitecture）之前，能夠快速比較不同 Topology 是非常有用的。

![Figure 3.1: Common on-chip network topologies](/images/ch03/Figure%203.1.jpg)

> **圖 3.1 解說**：此圖展示三種常見的 NoC 拓撲結構。(a) Ring：節點排成環狀，每個節點連接兩個鄰居；(b) Mesh：節點排成二維網格，每個節點最多連接四個鄰居；(c) Torus：Mesh 加上環繞連接（Wraparound），邊緣節點也連接到對面邊緣。選擇不同拓撲會直接影響網路的延遲、頻寬和實作成本。

## Traffic-Independent Metrics

這些是設計時期的指標，與流經網路的流量無關。

### Degree

**Degree** 指的是每個 Node 的 Link 數量。

| Topology | Degree | 說明 |
|----------|--------|------|
| Ring | 2 | 每個 Node 有兩條 Link |
| 2D Mesh | 4 | 連接到四個鄰居（邊緣 Node 除外） |
| 2D Torus | 4 | 每個 Node 都有四條 Link 連接到四個鄰居 |

::: tip Router Radix
每個 Router 的 Port 數稱為 **Router Radix**。Degree 是網路成本的代理指標，因為較高的 Degree 需要更多 Router Port，增加實作複雜度和面積/能源開銷。
:::

### Bisection Bandwidth

**Bisection Bandwidth** 是將網路分割成兩個相等部分的切割線上的頻寬。

以 Figure 3.1 為例：
- **Ring**：2 條 Link 跨越 Bisection
- **Mesh**：3 條 Link 跨越 Bisection
- **Torus**：6 條 Link 跨越 Bisection

Bisection Bandwidth 用於定義特定網路的最壞情況效能，因為它限制了可以從系統一側移動到另一側的資料總量。它也是實作網路所需的全域佈線量的代理指標。

::: info On-chip vs. Off-chip
Bisection Bandwidth 對 On-chip Network 的重要性不如 Off-chip Network，因為 On-chip 佈線被認為相對於 Off-chip Pin 頻寬是充裕的。
:::

### Diameter

**Diameter** 是 Topology 中任意兩個 Node 之間的最大距離，距離以最短路徑中的 Link 數量計算。

以 Figure 3.1 為例（假設 8 或 9 個 Node）：
- **Ring**：Diameter = 4
- **Mesh**：Diameter = 4
- **Torus**：Diameter = 2

Diameter 是在沒有壅塞情況下最大延遲的代理指標。

## Traffic-Dependent Metrics

這些指標取決於流經網路的流量（即 Source-Destination 對）。

### Hop Count

**Hop Count** 是 Message 從 Source 到 Destination 所經過的 Link 數量。這是網路延遲的簡單代理指標，因為每個 Node 和 Link 都會產生傳播延遲。

- **Maximum Hop Count**：由網路的 Diameter 決定
- **Average Hop Count**：所有可能 Source-Destination 對的平均 Hop 數，是網路延遲的有用代理指標

假設 **Uniform Random Traffic**（每個 Node 有相等機率發送到其他每個 Node）和 Bidirectional Link 與最短路徑 Routing：

| Topology (Figure 3.1) | Max Hop Count | Avg Hop Count |
|----------------------|---------------|---------------|
| Ring | 4 | 2 2/9 |
| Mesh | 4 | 1 7/9 |
| Torus | 2 | 1 1/3 |

### Maximum Channel Load

**Maximum Channel Load** 是估計網路可支援的最大頻寬或網路飽和前每個 Node 可注入的最大 bps 的代理指標：

$$
\text{Maximum Injection Bandwidth} = \frac{1}{\text{Maximum Channel Load}}
$$

計算步驟：
1. 確定給定流量模式下網路中最壅塞的 Link 或 Channel
2. 估計該 Link 上的負載（相對於注入頻寬）

::: tip Channel Load 計算範例
Maximum Channel Load 越高，網路頻寬越低。
:::

![Figure 3.2: Channel load example with two rings connected via a single channel](/images/ch03/Figure%203.2.jpg)

> **圖 3.2 解說**：此圖說明瓶頸 Channel 如何限制整體網路效能。兩個 Ring 透過單一 Channel 連接，該連接成為瓶頸。在 Uniform Random Traffic 下，每個 Ring 有一半的流量需要跨越這條 Channel，導致網路在注入頻寬的 1/2 時就飽和。

**Figure 3.2 範例說明**：

兩個 Ring 透過單一 Channel 連接。假設 Uniform Random Traffic，每個 Node 有一半的流量會留在自己的 Ring 內，另一半需要跨越 Bottleneck Channel。因此，Bottleneck Channel 的負載為 4 × 1/2 = 2（每個 Ring 有 4 個 Node）。網路在注入頻寬的 1/2 時飽和。

### Path Diversity

**Path Diversity** 指的是 Source 和 Destination 之間可用的最短路徑數量（|R_src-dst|）。

- 當 |R| > 1 時，Topology 具有 Path Diversity
- Path Diversity 讓 [Routing Algorithm](/04-routing/) 有更大的靈活性來進行負載平衡
- 也使 Packet 能夠繞過網路中的故障

| Topology | Path Diversity |
|----------|----------------|
| Ring | 1（只有一條最短路徑） |
| Mesh | > 1（多條最短路徑） |
| Torus | > 1（多條最短路徑） |

例如，在 Figure 3.1b 的 Mesh 中，A 和 B 之間有 6 條不同的最短路徑，距離都是 4 hop。

## 相關章節

- [Direct Topologies](/03-topology/direct-topologies) - Ring、Mesh、Torus 的詳細介紹
- [Indirect Topologies](/03-topology/indirect-topologies) - Butterfly、Clos、Fat Tree
- [Routing Algorithm](/04-routing/) - 路由演算法如何利用 Path Diversity

## 參考資料

- On-Chip Networks Second Edition, Chapter 3.1
