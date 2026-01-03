# Flow Control

**Flow Control** 管理網路 Buffer 和 Link 的分配。它決定何時將 Buffer 和 Link 分配給 Message、分配的粒度，以及多個 Message 如何共享這些資源。

良好的 Flow Control Protocol 透過在低負載時不施加高開銷來降低 Message 延遲，並透過在 Message 之間有效共享 Buffer 和 Link 來提高網路吞吐量。Flow Control 在決定 Packet 存取 Buffer 和穿越 Link 的速率時，對網路能耗和功耗起著關鍵作用。

## 本章內容

- [資料單位](./data-units) - Message、Packet、Flit、Phit
- [Message-based](./message-based) - Circuit Switching
- [Packet-based](./packet-based) - Store and Forward、Virtual Cut-through
- [Flit-based (Wormhole)](./flit-based) - Wormhole Flow Control
- [Virtual Channels](./virtual-channels) - VC 的概念與應用
- [Deadlock-free Flow Control](./deadlock-free) - 避免 Deadlock 的機制
- [Buffer Backpressure](./buffer-backpressure) - 處理 Buffer 滿的情況

## Flow Control 技術總覽

![Table 5.1: Flow Control 技術摘要](/images/ch05/Table%205.1.jpg)

| 技術 | Link 分配 | Buffer 分配 | 說明 |
|------|-----------|-------------|------|
| Circuit Switching | Message | N/A (Bufferless) | 需要 Setup 和 Acknowledgement |
| Store and Forward | Packet | Packet | Head Flit 必須等待整個 Packet 收到後才能繼續 |
| Virtual Cut-through | Packet | Packet | Head 可以在 Tail 到達前開始下一跳傳輸 |
| Wormhole | Packet | Flit | Head-of-line Blocking 降低 Link 頻寬效率 |
| Virtual Channel | Flit | Flit | 可以在同一 Link 上 Interleave 不同 Packet 的 Flit |

## 重點概念

::: tip Flow Control 的角色
Flow Control 決定：
1. **資源分配時機**：何時將 Buffer 和 Link 分配給 Message
2. **分配粒度**：以 Message、Packet 還是 Flit 為單位分配
3. **資源共享**：多個 Message 如何共享網路資源
4. **Backpressure 機制**：如何處理下游 Buffer 滿的情況
:::

## 學習目標

1. 理解不同層級的資料單位（Message、Packet、Flit、Phit）
2. 比較各種 Flow Control 機制的 Trade-off
3. 掌握 Virtual Channel 的運作原理及其多種用途
4. 了解 Deadlock-free 設計方法（Dateline、Escape VC、Bubble）
5. 理解 Buffer Backpressure 機制（Credit-based vs On/Off）

## 參考資料

- On-Chip Networks Second Edition, Chapter 5
