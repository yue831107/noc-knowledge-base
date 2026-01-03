# Router Microarchitecture

Router 必須在嚴格的面積和功耗約束下，滿足延遲和吞吐量需求。這是 Many-core 系統設計師面臨的主要挑戰。

Router 的複雜度隨著頻寬需求增加而提升。當不需要高吞吐量時，可以使用非常簡單的 Router（非 Pipelined、Wormhole、無 VC、有限 Buffering），具有低面積和功耗開銷。但當 On-chip Network 的延遲和吞吐量需求提高時，挑戰就會出現。

## 本章內容

- [VC Router](./vc-router) - Virtual Channel Router 架構
- [Buffers](./buffers) - Buffer 與 VC 設計
- [Switch Design](./switch-design) - Crossbar Switch 設計
- [Allocators](./allocators) - 分配器與仲裁器
- [Pipeline](./pipeline) - Router Pipeline 設計
- [Low-power](./low-power) - 低功耗技術
- [Physical Implementation](./physical-impl) - 物理實作

## Router Microarchitecture 的重要性

Router 的 Microarchitecture 決定：

| 影響 | 說明 |
|------|------|
| **Critical Path Delay** | 影響每跳延遲和整體網路延遲 |
| **Buffer/Link 效率** | Routing、Flow Control 和 Pipeline 實作影響資源利用率 |
| **網路吞吐量** | 資源利用效率決定整體吞吐量 |
| **能耗** | Dynamic 和 Leakage 功耗，由電路元件和活動決定 |
| **面積** | Microarchitecture 和底層電路直接影響網路面積 |

## 學習目標

1. 理解 VC Router 的運作流程和各元件功能
2. 掌握 Buffer 組織、Crossbar 和 Allocator 的設計權衡
3. 了解 Router Pipeline 和各種優化技術
4. 認識低功耗設計方法（DVFS、Clock Gating、Power Gating）
5. 了解 Router 的物理實作考量

## 參考資料

- On-Chip Networks Second Edition, Chapter 6
