# Routing

本章介紹 Routing Algorithm，決定 Packet 如何從 Source 傳送到 Destination。

![Figure 4.1: Routing 類型比較](/images/ch04/Figure%204.1.jpg)

在決定網路 Topology 之後，Routing Algorithm 用於決定 Message 在網路中從 Source 到 Destination 所採用的路徑。Routing Algorithm 的目標是在 Topology 提供的路徑之間均勻分配流量，以避免 Hotspot 並減少 Contention，從而改善網路延遲和吞吐量。

所有這些效能目標都必須在遵守嚴格的實作限制下達成：Routing 電路可能延長 Critical Path Delay 並增加 Router 的面積佔用。雖然 Routing 電路的能耗開銷通常較低，但所選擇的特定路由直接影響 Hop Count，因此大幅影響能耗。此外，Routing Algorithm 啟用的 Path Diversity 對於在網路故障情況下提高彈性也很有用。

## 本章內容

- [Routing 類型](./routing-types) - 各種 Routing Algorithm 分類
- [Deadlock Avoidance](./deadlock-avoidance) - 避免 Routing Deadlock
- [Dimension-ordered Routing](./dimension-ordered) - XY Routing 等
- [Oblivious Routing](./oblivious-routing) - 不考慮網路狀態的 Routing
- [Adaptive Routing](./adaptive-routing) - 根據網路狀態調整的 Routing
- [Multicast Routing](./multicast-routing) - 一對多的 Routing
- [實作](./implementation) - Routing 的硬體實作

## 重點概念

::: tip Routing 的目標
好的 Routing Algorithm 需要達成：
1. **Correctness**：Packet 一定會到達目的地
2. **Deadlock-free**：不會陷入死鎖
3. **Low Latency**：選擇短路徑
4. **Load Balance**：分散網路負載
5. **Fault Tolerance**：Path Diversity 有助於在網路故障時增加彈性
:::

## 學習目標

1. 理解不同 Routing Algorithm 的特性
2. 掌握 Deadlock 的成因與避免方法
3. 比較 Deterministic、Oblivious 和 Adaptive Routing
4. 了解 Routing 的硬體實作方式

## 參考資料

- On-Chip Networks Second Edition, Chapter 4
