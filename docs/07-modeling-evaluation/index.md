# Modeling & Evaluation

建模 On-chip Network 架構的所有面向（Topology、Routing、Flow Control、Router Microarchitecture）無論是在模擬還是實際設計中，對於 On-chip Network 的設計空間探索和驗證都至關重要。評估結果包括效能（Synthetic 和/或 Real Traffic）、功耗和面積。

## 本章內容

| 主題 | 說明 |
|------|------|
| [Evaluation Metrics](./metrics) | Latency、Throughput、Energy、Area |
| [Modeling Infrastructure](./modeling-infra) | RTL、Software、Power/Area 模型 |
| [Traffic Patterns](./traffic-patterns) | Message Classes、Synthetic/Application Traffic |
| [Debug Methodology](./debug) | 除錯技巧與常見問題 |
| [NoC Generators](./noc-generators) | 商業與學術 NoC 生成器 |

## 評估流程

1. **選擇 Modeling 層級**：RTL、Cycle-accurate、Functional
2. **設定 Traffic Pattern**：Synthetic 或 Application-based
3. **執行模擬**：收集 Latency、Throughput、Power 數據
4. **分析結果**：與 Ideal 和 Baseline 比較
5. **迭代優化**：調整設計參數

## 關鍵評估指標

### Design-time Metrics

| 指標 | 說明 |
|------|------|
| $t_{router}$ | 單一 Router 的 Pipeline 延遲 |
| $t_{wire}$ | 兩個 Router 之間的 Wire 延遲 |
| Bisection Bandwidth | Topology 的理論吞吐量上限 |
| Area | Router 和 Link 的面積 |

### Runtime Metrics

| 指標 | 說明 |
|------|------|
| H | 平均 Hop Count |
| $t_{contention}$ | 競爭造成的延遲 |
| Actual Throughput | 實際達到的吞吐量 |
| Dynamic Power | 隨流量變化的功耗 |

## 學習目標

1. 理解 NoC 效能評估的關鍵指標和分析模型
2. 熟悉 RTL 和 Software 模擬工具
3. 掌握不同流量模式的特性和用途
4. 了解 NoC 設計的 Debug 方法論
5. 認識商業和學術 NoC Generator

## 參考資料

- On-Chip Networks Second Edition, Chapter 7
