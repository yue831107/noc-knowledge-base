# SoC Interconnect 演進史

::: info 來源
本文整理自 [Arteris: The SoC Interconnect Fabric: A Brief History](https://www.arteris.com/blog/the-soc-interconnect-fabric-a-brief-history/) 及相關技術文件。
:::

## 概述

SoC 互連架構的發展經歷了三個主要時代，每個時代都是為了解決前一代的 Scalability 限制：

| 時代 | 技術 | 年代 | 核心問題 |
|------|------|------|----------|
| **第一代** | Shared Bus | 1990s-2000s | 多 Initiator 存取造成 Bottleneck |
| **第二代** | Crossbar Switch | 2000s-2010s | 面積、功耗、Timing Closure 問題 |
| **第三代** | Network-on-Chip | 2006-現在 | 透過 Packetization 解決佈線問題 |

## 第一代：Shared Bus

### 基本架構

![Figure 1: Simple bus interconnect architecture](/arteris/1.jpg)

**Figure 1** 展示了最基本的 Bus 架構：單一 Initiator 透過共享匯流排與多個 Target 通訊。

### AMBA 標準的誕生

**1996 年**，ARM 發布了第一個事實上的商業標準：**AMBA（Advanced Microcontroller Bus Architecture）**，推動了 IP Core 的互通性發展。

| 標準 | 年份 | 說明 |
|------|------|------|
| **ASB/APB** | 1996 | AMBA 1.0，第一代標準 |
| **AHB** | 1999 | AMBA 2.0，高效能匯流排 |
| **AXI** | 2003 | AMBA 3.0，將介面與 Topology 分離 |
| **OCP** | 2001 | Open Core Protocol，開放標準 |

### Bus 的根本限制

根據 [Arteris 技術文件](https://www.arteris.com/blog/busses-crossbars-and-nocs-the-3-eras-of-soc-interconnect-history/)：

> "As the integration of multiple cores within chips began in the 1990s, too many initiators trying to access different targets simultaneously created bottlenecks on the bus."

| 問題 | 說明 |
|------|------|
| **Arbitration Latency** | 多 Initiator 競爭時，仲裁造成長時間等待 |
| **Bandwidth 共享** | 所有 Master 競爭同一頻寬 |
| **無法並行存取** | 同一時間只有一對 Initiator-Target 可通訊 |

## 第二代：Crossbar Switch

### 基本架構

![Figure 2: Simple crossbar switch interconnect structure](/arteris/2.jpg)

**Figure 2** 展示了 Crossbar 架構：透過 Switch 矩陣，多對 Initiator-Target 可同時通訊。

### Crossbar 的問題

Crossbar 解決了 Bus 的並行存取問題，但帶來了新的挑戰。根據 [EDN 報導](https://www.edn.com/why-network-on-chip-has-displaced-crossbar-switches-at-scale/)：

> "The interconnect became a gating factor at the physical place-and-route and floorplanning stages of SoC design, because the huge crossbars and numbers of wires could no longer be squeezed into the nooks and crannies between IP blocks."

| 問題 | 技術細節 |
|------|----------|
| **面積成本** | O(N²) 的 Switch 數量 |
| **佈線壅塞** | Address + Data Read + Data Write + Response 多條寬 Datapath |
| **Timing Closure** | SoC 無法達到設計頻率 |
| **功耗增加** | 大型集中式設計消耗大量功耗 |
| **Protocol 複雜度** | 需追蹤 Outstanding Transaction，邏輯複雜 |

### 階層式 Crossbar 的困境

![Figure 4: Cascaded crossbar vs NoC architecture](/arteris/4.jpg)

**Figure 4（左）** 展示了階層式 Crossbar 的問題：

根據 [Arteris 技術說明](https://www.arteris.com/learn/noc-technology-basics/)：

> "There are typically inefficiencies associated with combining crossbars... requirements for a uniform data width in a crossbar, a single clock, and a single protocol—make cascading crossbars a non-optimal choice."

- **Congested Area**：中央 Crossbar 成為佈局瓶頸
- **Protocol Restriction**：層間需要 Bridge（如 AHB2AXI）
- **Context Tracking Duplication**：每層都需追蹤 Transaction 狀態

## 第三代：Network-on-Chip

### 核心概念：Packetization

NoC 的關鍵洞察：**透過 Packetization 減少導線數量**。

![Figure 3: Simple network-on-chip interconnect architecture](/arteris/3.jpg)

**Figure 3** 展示了 NoC 架構：分散式的小型 Switch 透過 Packet 傳輸資料。

根據 [Arteris NoC 技術基礎](https://www.arteris.com/learn/noc-technology-basics/)：

> "The Network Interface Unit (NIU) associated with an initiator IP accepts data from that IP, packetizes and serializes the data, and passes it into the NoC."

| NoC 元件 | 功能 |
|----------|------|
| **NIU（Network Interface Unit）** | Packetization/Depacketization，協定轉換 |
| **Switch/Router** | Packet 路由，極為簡單（約 Crossbar 的 1/4 面積） |
| **Link** | 連接 Switch 的導線，數量大幅減少 |

### NoC vs Crossbar

根據 Arteris 技術文件：

> "An NoC switch, for the same bandwidth, will be ~4× smaller than the equivalent AXI crossbar with all its logic required to track outstanding transactions."

**Figure 4（右）** 展示了 NoC 的優勢：

| 面向 | Crossbar | NoC |
|------|----------|-----|
| **Transaction 追蹤** | 在 Crossbar 內追蹤 | 在 NIU 處理，Switch 不需追蹤 |
| **Switch 複雜度** | 高（需處理 Protocol） | 低（只做 Packet 路由） |
| **佈線** | 寬 Datapath，壅塞 | 少量導線，可分散佈局 |
| **時脈** | 單一時脈域 | GALS（Globally Asynchronous Locally Synchronous） |
| **Protocol** | 需統一 | NIU 做轉換，支援多種 Protocol |

### 商業化里程碑

| 年份 | 事件 |
|------|------|
| **2006** | Arteris 推出首個商業 NoC IP「NoC Solution」 |
| **2009** | Arteris 推出「FlexNoC」（Non-coherent NoC） |
| **2014** | Arteris 推出「Ncore」（Cache Coherent NoC） |

::: info 產業數據
截至 2025 年 Q3，Arteris 技術已出貨超過 **39 億顆**晶片。
:::

## Coherent vs Non-coherent NoC

現代 SoC 通常需要**兩種 NoC**：Coherent NoC 用於需要資料一致性的處理器，Non-coherent NoC 用於其他 IP。

### Non-coherent NoC（FlexNoC）

![Figure 6: Non-coherent NoC deployments](/arteris/6.jpg)

**Figure 6** 展示了 Non-coherent NoC 的典型部署：

根據 [Arteris Cache Coherent Interconnect 說明](https://www.arteris.com/learn/cache-coherent-interconnect/)：

> "Non-coherent NoC interconnects do not implement cache coherence protocols across the SoC. Each processor or core manages its local cache independently."

**適用場景：**
- NPU、Video Codec 等加速器
- PCIe、USB 等周邊 I/O
- 不需要 CPU 共享資料的 IP

### Coherent NoC（Ncore）

![Figure 5: Coherent NoC deployments](/arteris/5.jpg)

**Figure 5** 展示了 Coherent NoC 的典型部署：多個 CPU Cluster 透過 Coherent NoC（含 L3 Cache）互連。

::: warning Coherent NoC 的核心價值
根據 [Arteris Ncore 說明](https://www.arteris.com/products/coherent-noc-ip/ncore/)：

> "The ability to share data coherently allows the appropriate computational element to access data more quickly, improving performance and reducing power consumption."

**關鍵特性：**
- 支援 **CPU、GPU、加速器之間的資料共享**
- 實現 **Distributed Cache Coherence**
- 使用 **Directory-based Protocol** 追蹤 Cache 狀態
:::

### Coherent NoC 技術細節

根據 [NVIDIA 開發者部落格的 Arteris 白皮書](https://developer-blogs.nvidia.com/wp-content/uploads/2019/12/arteris-ncore-white-paper.pdf)：

| 特性 | 說明 |
|------|------|
| **Protocol 支援** | AMBA CHI、ACE（AXI Coherency Extensions） |
| **Cache Protocol** | MOESI（Modified, Owned, Exclusive, Shared, Invalid） |
| **Coherence 機制** | Directory-based + Snoop-based |
| **Snoop Filter** | 可配置的 Directory，追蹤系統中所有 Cache 狀態 |
| **Proxy Cache** | 讓 Non-coherent Agent 也能存取 Coherent Subsystem |

### 為何需要 Distributed Cache Coherence？

傳統的集中式 Coherence（如 Snoop Bus）無法擴展到大量處理器。Ncore 採用 **Distributed Heterogeneous Cache Coherent Interconnect**：

| 集中式 Coherence | 分散式 Coherence（Ncore） |
|------------------|---------------------------|
| 單一 Snoop Bus | 多個可配置的 Snoop Filter |
| Scalability 差 | 支援最多 64 個 Fully-coherent Agent |
| 固定架構 | 可配置的 Embedded Cache |

### 混合架構：Coherent + Non-coherent

![Figure 7: Mixture of coherent and non-coherent NoCs](/arteris/7.jpg)

**Figure 7** 展示了現代 SoC 的典型架構：

根據 [Arteris 說明](https://www.arteris.com/learn/cache-coherent-interconnect/)：

> "A system based on the Ncore interconnect can be logically divided into a coherent subsystem and a non-coherent subsystem."

| 區域 | NoC 類型 | 連接的 IP |
|------|----------|-----------|
| **Coherent Subsystem** | Ncore | CPU Cluster、GPU（I/O-coherent）、Memory Controller |
| **Non-coherent Subsystem** | FlexNoC | NPU、Video、PCIe、周邊 |
| **Bridge** | - | 連接兩個 Subsystem |

**實際案例**：Toshiba Visconti 5 採用 8 個 NoC Instance，分為 Safety Island 和 Processing Island，使用 Ncore（Coherent）和 FlexNoC（Non-coherent）的組合。

## 現代高階 SoC 架構

![Figure 8: Modern high-end SoC example](/arteris/8.jpg)

**Figure 8** 展示了現代高階 SoC 的典型架構：

| 區域 | 互連 | 說明 |
|------|------|------|
| **CPU Cluster** | Coherent NoC | 多個 Processor Cluster，支援 Cache Coherence |
| **NPU** | Non-coherent NoC | 大量 Processing Element 組成陣列 |
| **其他 IP** | Non-coherent NoC | 周邊和專用加速器 |

## NoC Topology

![Figure 10: Common NoC Topologies](/arteris/10.jpg)

**Figure 10** 展示了常見的 NoC Topology：

| Topology | 特點 | 適用場景 |
|----------|------|----------|
| **(a) Crossbar** | 全連接、低 Latency | 小規模（< 8 節點） |
| **(b) Star** | 中央集中 | 周邊互連 |
| **(c) Ring** | 簡單、Latency 隨規模增長 | 中小規模 |
| **(d) Tree** | 階層式 | 階層式記憶體 |
| **(e) Mesh** | 規則、可擴展 | 大規模 CMP |
| **(f) Torus** | Mesh + Wraparound | 高效能運算 |

::: tip 對應章節
關於 Topology 的詳細分析，請參考 [Topology 章節](/03-topology/)。
:::

## 自動化 NoC 生成

![Figure 9: PU arrays using NoC-based soft tiling](/arteris/9.jpg)

**Figure 9** 展示了現代 NoC IP 的自動化能力：

1. **定義 Processing Unit（PU）**
2. **Auto-replicate PUs**：自動複製成陣列
3. **Auto-generate NoC**：自動生成 Coherent 或 Non-coherent NoC
4. **Auto-configure NIUs**：自動配置 Network Interface Unit

## 關鍵要點總結

### 演進驅動力

```
Bus: Arbitration Bottleneck
         │
         ▼
Crossbar: Timing Closure、面積、功耗問題
         │
         ▼
NoC: Packetization 解決佈線問題
         │
         ▼
Coherent NoC: 支援 CPU/GPU 資料共享
```

### Coherent vs Non-coherent 選擇

| 需求 | 選擇 | 原因 |
|------|------|------|
| CPU 之間資料共享 | Coherent NoC | 需要硬體維護 Cache 一致性 |
| CPU 與 GPU 共享資料 | Coherent NoC（I/O-coherent） | 減少資料複製，降低功耗 |
| 加速器、周邊 | Non-coherent NoC | 不需要 Coherence 的開銷 |
| 大型 SoC | 混合架構 | Coherent 區域 + Non-coherent 區域 |

### 與教科書的對應

| 本文主題 | 對應章節 |
|----------|----------|
| Bus/Crossbar/NoC 演進 | [Chapter 1: Introduction](/01-introduction/) |
| Topology 選擇 | [Chapter 3: Topology](/03-topology/) |
| Cache Coherence | [Coherence Protocol](/02-system-architecture/coherence-protocol) |
| Router 設計 | [Chapter 6: Router Microarchitecture](/06-router-microarchitecture/) |
| NoC Interface（AXI、CHI） | [NoC Interface 標準](/02-system-architecture/noc-interface-standards) |

## 參考資料

- [Arteris: The SoC Interconnect Fabric: A Brief History](https://www.arteris.com/blog/the-soc-interconnect-fabric-a-brief-history/)
- [Arteris: Busses, Crossbars and NoCs: The 3 Eras of SoC Interconnect History](https://www.arteris.com/blog/busses-crossbars-and-nocs-the-3-eras-of-soc-interconnect-history/)
- [Arteris: Cache-Coherent Interconnect for Modern SoC Design](https://www.arteris.com/learn/cache-coherent-interconnect/)
- [Arteris: Ncore Cache Coherent Interconnect IP](https://www.arteris.com/products/coherent-noc-ip/ncore/)
- [Arteris: NoC Technology Basics](https://www.arteris.com/learn/noc-technology-basics/)
- [EDN: Why Network-on-Chip Has Displaced Crossbar Switches at Scale](https://www.edn.com/why-network-on-chip-has-displaced-crossbar-switches-at-scale/)
- [NVIDIA Developer Blog: Arteris Ncore White Paper](https://developer-blogs.nvidia.com/wp-content/uploads/2019/12/arteris-ncore-white-paper.pdf)
