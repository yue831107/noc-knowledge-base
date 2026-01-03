# Topology

On-chip Network Topology 決定了網路中 Node 和 Channel 的實體佈局和連接方式。Topology 的選擇對整體網路成本效能有著深遠的影響。

## Topology 的影響

Topology 決定了：

- **Hop 數量**：Message 必須穿越的 Router 數量，直接影響網路延遲
- **互連長度**：Hop 之間的 Link 長度，影響傳輸延遲
- **能源消耗**：穿越 Router 和 Link 都會消耗能源
- **路徑多樣性**：Node 之間可用替代路徑的數量，影響流量分散能力
- **頻寬需求**：網路支援的最大頻寬

## 實作複雜度

Topology 的實作複雜度取決於兩個因素：

1. **Node Degree**：每個 Node 的 Link 數量（Router Radix）
2. **佈線難度**：Wire 長度和所需的 Metal Layer 數量

## Bus vs. Switched Network

最簡單的 Topology 是 **Bus**，透過單一共享 Channel 連接一組元件。Bus 上的每個 Message 都可以被所有元件觀察到，是有效的廣播媒介。然而，Bus 的可擴展性有限，因為額外的元件會使共享 Channel 飽和。

本章主要討論 **Switched Topology**，其中元件透過一組 Router 和 Link 相互連接。

## 本章內容

- [Metrics](./metrics) - 評估 Topology 的指標
- [Direct Topologies](./direct-topologies) - Ring、Mesh、Torus
- [Indirect Topologies](./indirect-topologies) - Crossbar、Butterfly、Clos、Fat Tree
- [Irregular Topologies](./irregular-topologies) - 不規則拓撲與 Topology Synthesis
- [Hierarchical](./hierarchical) - 階層式拓撲與 Concentration
- [實作考量](./implementation) - Place-and-Route 與 Abstract Metrics 的限制

## 學習目標

1. 理解評估 Topology 的關鍵指標（Degree、Diameter、Bisection Bandwidth、Hop Count、Channel Load、Path Diversity）
2. 比較各種 Direct 和 Indirect Topology 的優缺點
3. 了解 Irregular Topology 的應用場景和合成方法
4. 掌握 Topology 選擇的設計考量和實作限制

## 參考資料

- On-Chip Networks Second Edition, Chapter 3
