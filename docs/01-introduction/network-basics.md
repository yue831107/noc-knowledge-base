# Network 基礎

本節為後續章節涵蓋的術語和主題奠定基礎。許多基本概念也適用於 Off-chip Network，但在不同的設計 Trade-off 和創新機會下運作。

## 什麼是 On-chip Network？

On-chip Network 作為更廣泛的互連網路類別的子集，可以被視為一個促進 Node 之間資料傳輸的可程式化系統。On-chip Network 之所以可以被視為一個系統，是因為它整合了許多元件，包括 Channel、Buffer、Switch 和控制邏輯。

### 為什麼不用專用佈線？

對於少量 Node，可以使用專用的 Ad hoc 佈線來互連。然而，隨著 On-chip 元件數量增加，使用專用佈線會變得有問題：直接連接每個元件所需的佈線量將變得過於龐大。

## 效能指標

在討論不同的 On-chip 設計方案時，需要同時考慮 Network 的**效能**和**成本**。

### Latency（延遲）

效能通常以 Network Latency 或 Accepted Traffic 來衡量。對於快速估算，常使用 **Zero-load Latency**：

::: tip Zero-load Latency
Zero-load Latency 是指當網路中沒有其他 Packet 時，一個 Packet 所經歷的延遲。它提供了訊息延遲的下限。

計算方式：平均距離（以 Network Hop 數表示）乘以穿越單一 Hop 的延遲。
:::

### Throughput（吞吐量）

除了提供超低延遲通訊外，Network 還必須提供高吞吐量。因此，效能也以 **Throughput** 來衡量。

::: tip Saturation Throughput
高 Saturation Throughput 表示 Network 可以在所有 Packet 經歷極高延遲之前，接受大量 Traffic，維持更高的頻寬。
:::

### Latency vs. Throughput 曲線

下圖展示了 On-chip Network 的 Latency vs. Throughput 曲線：

![Figure 1.1: Latency vs. throughput for an on-chip network](/images/ch01/fig1-1.jpg)

> **圖 1.1 解說**：此圖是理解 NoC 效能的關鍵。橫軸為注入流量（Offered Traffic），縱軸為封包延遲（Latency）。曲線顯示當流量增加時，延遲如何變化。理想的網路設計應該在高流量下仍維持低延遲。

**曲線特徵：**
- **低負載區**：Latency 接近 Zero-load Latency，維持平穩
- **中等負載區**：Latency 隨 Traffic 增加而緩慢上升
- **飽和區**：接近 Saturation Throughput 時，Latency 急劇上升（網路壅塞）

## 成本指標

On-chip Network 的兩個主要成本是 **Area（面積）** 和 **Power（功耗）**。

如前所述，Many-core 架構在非常嚴格的功耗預算下運作。不同設計對功耗和面積的影響將在本書中討論，並在 [Router Microarchitecture](/06-router-microarchitecture/) 中深入探討。

## 相關章節

- [Topology Metrics](/03-topology/metrics) - 深入了解網路拓撲的評估指標
- [Evaluation Metrics](/07-modeling-evaluation/metrics) - 完整的效能評估方法

## 參考資料

- On-Chip Networks Second Edition, Chapter 1.3
