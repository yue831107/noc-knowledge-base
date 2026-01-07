# SoC Interconnect 演進史

::: info 來源
本文整理自 [Arteris: The SoC Interconnect Fabric: A Brief History](https://www.arteris.com/blog/the-soc-interconnect-fabric-a-brief-history/)，並補充相關技術細節。
:::

## 概述

SoC 互連架構的發展經歷了三個主要時代：

| 時代 | 技術 | 年代 | 特點 |
|------|------|------|------|
| **第一代** | Shared Bus | 1990s-2000s | 簡單、低成本、擴展性差 |
| **第二代** | Crossbar Switch | 2000s-2010s | 高頻寬、面積大、功耗高 |
| **第三代** | Network-on-Chip | 2006-現在 | 可擴展、靈活、功耗效率佳 |

這個演進過程反映了 SoC 複雜度的指數成長：從幾個 IP 區塊到數百個，從單一處理器到異構多核心系統。

## 第一代：Shared Bus（共享匯流排）

### 基本架構

![Figure 1: Simple bus interconnect architecture](/arteris/1.jpg)

**Figure 1** 展示了最基本的 Bus 互連架構：單一 Initiator（發起者）透過共享匯流排與多個 Target（目標）通訊。

### AMBA 標準的誕生

**1996 年**，ARM 發布了第一個事實上的商業標準：**AMBA（Advanced Microcontroller Bus Architecture）**。

| 標準 | 年份 | 說明 |
|------|------|------|
| **ASB** | 1996 | Advanced System Bus，用於一般 SoC IP 互連 |
| **APB** | 1996 | Advanced Peripheral Bus，用於低速周邊 |
| **AHB** | 1999 | Advanced High-performance Bus，取代 ASB |
| **AXI** | 2003 | Advanced eXtensible Interface（AMBA 3） |

同時期，**OCP-IP** 組織於 2001 年開始制定 **OCP（Open Core Protocol）** 規範，提供另一種開放標準選擇。

::: tip 對應章節
關於 AMBA AXI 和 OCP 的詳細介紹，請參考 [NoC Interface 標準](/02-system-architecture/noc-interface-standards)。
:::

### Bus 的限制

隨著 SoC 中 IP 區塊數量增加，Bus 架構開始顯現其局限性：

| 問題 | 說明 |
|------|------|
| **頻寬共享** | 所有 Master 競爭同一頻寬 |
| **仲裁延遲** | Master 數量增加導致等待時間增長 |
| **時序收斂** | 長導線導致時序難以滿足 |
| **階層複雜度** | 需要 Bridge 連接多個 Bus，增加設計複雜度 |

## 第二代：Crossbar Switch（交叉開關）

### 基本架構

![Figure 2: Simple crossbar switch interconnect structure](/arteris/2.jpg)

**Figure 2** 展示了 Crossbar 架構：每個 Initiator 可以同時與不同的 Target 通訊，透過 Switch 矩陣建立連接。

### Crossbar 的優勢

| 優勢 | 說明 |
|------|------|
| **並行存取** | 多對 Initiator-Target 可同時通訊 |
| **低延遲** | 直接路徑，無需等待 Bus 仲裁 |
| **高頻寬** | 聚合頻寬隨端口數增加 |

### Crossbar 的問題

然而，Crossbar 架構帶來了新的挑戰：

| 問題 | 說明 |
|------|------|
| **面積成本** | O(N²) 的 Switch 數量 |
| **佈線壅塞** | 大量導線難以佈局 |
| **功耗增加** | 大型 Crossbar 消耗大量功耗 |
| **時序問題** | 中央集中式設計導致時序收斂困難 |

### 階層式 Crossbar 的困境

![Figure 4: Cascaded crossbar vs NoC architecture](/arteris/4.jpg)

**Figure 4（左）** 展示了階層式 Crossbar 的問題：
- **Congested Area**：中央 Crossbar 成為佈局壅塞點
- **Address decode and context tracking duplication**：每層都需重複解碼
- **Lots of Wires**：層間連線數量龐大
- **Protocol Restriction**：需要 Bridge 進行協定轉換（如 AHB2AXI）
- **Pipe Insertion/Clock Crossing/Power Crossing**：每層都需處理

## 第三代：Network-on-Chip（片上網路）

### 基本架構

![Figure 3: Simple network-on-chip interconnect architecture](/arteris/3.jpg)

**Figure 3** 展示了 NoC 架構：分散式的小型 Switch 透過 Packet 傳輸資料，形成網路拓撲。

### NoC 的核心概念

NoC 的關鍵洞察：**減少導線數量，透過封包化傳輸資料**。

| 概念 | 說明 |
|------|------|
| **Packetization** | 將資料分割成 Packet，透過較少的導線傳輸 |
| **Distributed Routing** | 分散式的小型 Router，而非集中式大型 Crossbar |
| **QoS 保證** | 每個傳輸可以有服務品質保證 |

### NoC 的優勢

**Figure 4（右）** 展示了 NoC 的優勢：

| 優勢 | 說明 |
|------|------|
| **Fewer Wires** | 導線數量大幅減少 |
| **No Congestion** | 分散式設計避免佈局壅塞 |
| **Flexible Pipe Insertion** | 可在任意位置插入 Pipeline 暫存器 |
| **Clock/Power Crossing Anywhere** | 時脈和電源域跨越更靈活 |
| **Configurable Topology** | 拓撲可依需求配置 |
| **Protocol Decoupling** | NIU 處理協定轉換（AXI、AHB、APB、OCP...） |

### 商業化里程碑

| 年份 | 事件 |
|------|------|
| **2006** | Arteris 推出首個商業 NoC IP 產品「NoC Solution」 |
| **2009** | Arteris 推出更先進的「FlexNoC」|
| **2025** | Arteris 推出「FlexGen」，宣稱 10× 生產力提升 |

::: info 產業數據
截至 2025 年 Q3，Arteris 技術已出貨超過 **39 億顆**晶片。
:::

## Crossbar vs NoC 詳細比較

| 面向 | Crossbar | NoC |
|------|----------|-----|
| **路由機制** | 物理 Switch 建立連接 | 透過 Packet 邏輯路由 |
| **擴展性** | 節點增加時效率下降 | 適合大規模系統 |
| **資源效率** | 每對 I-T 需直接硬體連接 | 共享 Router 和 Link |
| **面積** | O(N²) 成長 | 近似線性成長 |
| **功耗** | 高（大型集中式設計） | 較低（分散式設計） |
| **時序收斂** | 困難 | 較容易（Pipeline 可插入任意位置） |

## 現代 NoC 部署模式

### Coherent NoC（一致性 NoC）

![Figure 5: Coherent NoC deployments](/arteris/5.jpg)

**Figure 5** 展示了 Coherent NoC 部署：多個 CPU Cluster 透過支援 Cache Coherence 的 NoC（含 L3 Cache）互連。

適用場景：
- 多核心 CPU
- 需要硬體 Cache Coherence 的系統
- SMP（Symmetric Multiprocessing）架構

### Non-Coherent NoC（非一致性 NoC）

![Figure 6: Non-coherent NoC deployments](/arteris/6.jpg)

**Figure 6** 展示了 Non-Coherent NoC 部署：
- **(a) Single processor**：單一處理器連接周邊
- **(b) 4-core cluster**：4 核心 Cluster 內部使用 Shared L2，對外透過 Non-Coherent NoC

適用場景：
- 嵌入式系統
- 周邊互連
- 不需要硬體 Coherence 的加速器

### 混合架構

![Figure 7: Mixture of coherent and non-coherent NoCs](/arteris/7.jpg)

**Figure 7** 展示了混合架構：
- **CPU Cluster** 透過 Coherent NoC（含 L3 Cache）互連
- **其他 IP** 透過 Non-Coherent NoC 互連
- 兩個 NoC 之間透過 **Bridge** 連接

::: tip 設計考量
混合架構是現代高階 SoC 的常見設計：
- Coherent NoC 用於需要共享記憶體的 CPU
- Non-Coherent NoC 用於 GPU、NPU 等專用加速器
:::

## 現代高階 SoC 架構

![Figure 8: Modern high-end SoC example](/arteris/8.jpg)

**Figure 8** 展示了現代高階 SoC 的典型架構：

| 區域 | 互連類型 | 說明 |
|------|----------|------|
| **CPU（Processor Clusters）** | Coherent NoC | 多個 PC（Processor Cluster）組成陣列 |
| **NPU（Processing Elements）** | Non-coherent NoC | 大量 PE（Processing Element）組成陣列 |
| **其他 IP** | Non-coherent NoC | 周邊和加速器 |

## NoC 拓撲選擇

![Figure 10: Common NoC Topologies](/arteris/10.jpg)

**Figure 10** 展示了常見的 NoC 拓撲：

| 拓撲 | 特點 | 適用場景 |
|------|------|----------|
| **(a) Crossbar** | 全連接、低延遲、高成本 | 小規模、低延遲需求 |
| **(b) Star** | 中央集中、簡單 | 小規模、周邊互連 |
| **(c) Ring** | 簡單、延遲隨規模增長 | 中小規模、順序存取 |
| **(d) Tree** | 階層式、頻寬瓶頸 | 階層式記憶體 |
| **(e) Mesh** | 規則、可擴展 | 大規模 CMP |
| **(f) Torus** | Mesh + Wraparound | 高效能運算 |

::: tip 對應章節
關於拓撲的詳細分析，請參考 [Topology 章節](/03-topology/)。
:::

## 自動化 NoC 生成

![Figure 9: PU arrays using NoC-based soft tiling](/arteris/9.jpg)

**Figure 9** 展示了現代 NoC IP 的自動化能力：

1. **定義 Processing Unit（PU）**：設計者定義基本的處理單元
2. **Auto-replicate PUs**：自動複製成陣列
3. **Auto-generate NoC**：自動生成連接的 NoC（Coherent 或 Non-coherent）
4. **Auto-configure NIUs**：自動配置 Network Interface Unit

這種「Soft Tiling」技術大幅提升了大規模設計的生產力。

## 關鍵要點

### 演進驅動力

```
效能需求 ──► 更多 IP 區塊 ──► 頻寬需求增加
                │
                ▼
         Bus 無法滿足
                │
                ▼
         Crossbar 面積/功耗爆炸
                │
                ▼
         NoC：可擴展的解決方案
```

### 技術選擇指引

| IP 數量 | 建議架構 | 原因 |
|---------|----------|------|
| < 5 | Shared Bus | 簡單、低成本 |
| 5-15 | Crossbar 或 Partial Crossbar | 平衡效能和成本 |
| > 15 | NoC | 唯一可擴展的選擇 |

### 現代趨勢

1. **Chiplet**：NoC 擴展到 Die-to-Die 互連
2. **AI 加速器**：大規模 PE 陣列需要高效 NoC
3. **異構整合**：混合 Coherent/Non-coherent NoC
4. **自動化**：NoC IP 工具支援自動生成和優化

## 與教科書的對應

| 本文主題 | 對應章節 |
|----------|----------|
| Bus/Crossbar/NoC 比較 | [Chapter 1: Introduction](/01-introduction/) |
| AMBA AXI、OCP 標準 | [NoC Interface 標準](/02-system-architecture/noc-interface-standards) |
| 拓撲選擇 | [Chapter 3: Topology](/03-topology/) |
| Coherence/Non-coherence | [Coherence Protocol](/02-system-architecture/coherence-protocol) |
| Router 設計 | [Chapter 6: Router Microarchitecture](/06-router-microarchitecture/) |

## 參考資料

- [Arteris: The SoC Interconnect Fabric: A Brief History](https://www.arteris.com/blog/the-soc-interconnect-fabric-a-brief-history/)
- [Arteris: Busses, Crossbars and NoCs: The 3 Eras of SoC Interconnect History](https://www.arteris.com/blog/busses-crossbars-and-nocs-the-3-eras-of-soc-interconnect-history/)
- [Arteris: Network-on-Chip (NoC) Technology](https://www.arteris.com/learn/network-on-chip-technology/)
- On-Chip Networks Second Edition, Morgan & Claypool Publishers
