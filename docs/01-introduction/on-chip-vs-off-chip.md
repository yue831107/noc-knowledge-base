# On-chip vs Off-chip Networks

## 設計需求的差異

雖然 On-chip Network 可以借鏡先前用於超級電腦、工作站叢集和網際網路路由器的 Multi-chassis 互連網路的想法，但 On-chip Network 面臨的設計需求在量級上有很大差異，因此需要新穎的設計。

### 優勢：移至晶片內的好處

幸運的是，透過移至晶片內，先前 Multi-chassis 互連網路面臨的 I/O 瓶頸得到了大幅緩解：

- **豐富的 On-chip 佈線**：提供比 Off-chip I/O 高出數個數量級的頻寬
- **消除延遲開銷**：避免了與 Off-chip I/O 傳輸相關的固有延遲開銷

### 挑戰：嚴格的技術限制

另一方面，許多嚴格的技術限制對 On-chip Network 設計提出了挑戰：

| 挑戰 | 說明 |
|------|------|
| **超低延遲** | 必須在極低延遲下提供高頻寬 |
| **功耗預算** | 必須在嚴格的功耗範圍內運作 |
| **面積預算** | Cache 和互連與 Core 競爭晶片面積 |

## 功耗考量

::: warning 功耗是關鍵問題
On-chip Network 的功耗可能很高：
- Intel 80-core TeraFLOPS Network 消耗約 **30%** 的晶片功耗
- MIT RAW On-chip Network 消耗約 **36%** 的晶片功耗

因此，功耗限制必須被考慮。例如 Intel Single-chip Cloud Computer 的創新使功耗降至僅佔總晶片功耗的 **10%**。
:::

儘管有所改善，功耗仍然是推動該領域前進的重要議題。

## On-chip Network 的優勢

相比於 Bus 和 Crossbar，On-chip Network 具有以下優勢：

### 1. 可擴展性

Network 代表了一種可擴展的 On-chip 通訊解決方案，其面積和功耗開銷與 Node 數量呈次線性相關。

### 2. 佈線效率

On-chip Network 在佈線使用上非常高效，透過在相同 Link 上多工不同的通訊流來提供高頻寬。

### 3. 模組化設計

具有規則 Topology 的 On-chip Network 擁有固定長度的局部短互連，可以使用規則的重複結構進行最佳化和模組化建構，減輕驗證負擔。

## Link 架構

大多數 On-chip Network 原型使用傳統的 Full-swing 邏輯和 Repeated Wire：

- **Full-swing Wire**：傳輸 1 時從 0V（Ground）轉換到供應電壓，傳輸 0 時轉回 Ground
- **Repeater**：在長 Wire 上等間隔放置 Repeater（Inverter 或 Buffer）是減少延遲的有效技術
- **延遲縮放**：使延遲隨 Repeater 數量線性增長，而非隨長度二次方增長

## 參考資料

- On-Chip Networks Second Edition, Chapter 1.2
