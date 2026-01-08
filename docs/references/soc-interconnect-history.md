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

現代 SoC 可以包含 **Non-coherent 和 Coherent NoC 的混合**。Coherent NoC 主要管理有 Cache 的 CPU，而 Non-coherent NoC 處理 SoC 中其餘的互連。

### Non-coherent NoC（FlexNoC）

![Figure 6: Non-coherent NoC deployments](/arteris/6.jpg)

**Figure 6** 展示了 Non-coherent NoC 的典型部署：

| 部分 | 架構 | 說明 |
|------|------|------|
| **(a) Single Processor** | 單一 CPU + L1 + L2 | 單處理器系統，不存在多核心 Cache 一致性問題，可直接使用 Non-coherent NoC |
| **(b) 4-Core Cluster** | 4 個 CPU + 各自 L1 + 共享 L2 | Cluster 內部已有 Coherence 機制保證 4 個 CPU 之間的一致性，因此對外可使用 Non-coherent NoC；若需與其他 Cluster 或 Accelerator 共享資料，則需改用 Coherent NoC |

#### 定義與運作方式

Non-coherent NoC **不在 SoC 中實現 Cache Coherence Protocol**。每個處理器或核心獨立管理自己的 Local Cache，不保證資料修改對系統中其他部分可見。當需要資料一致性時，依賴**軟體機制**來處理。這種方式雖然可能效率較低，但比硬體 Coherence 機制**更簡單、更省電**。

#### 核心價值

Non-coherent NoC 是一種先進的互連 IP 解決方案，透過解決以下挑戰來優化 SoC 開發：

- **Performance（效能）**
- **Power Efficiency（功耗效率）**
- **Area Minimization（面積最小化）**

#### 設計特點

| 特點 | 說明 |
|------|------|
| **設計彈性** | 可客製化以適應各種 SoC 架構，從單核心到複雜系統 |
| **低延遲** | 不承擔 Cache Coherence 開銷，對需要極低延遲回應的應用特別有益 |
| **設計簡化** | 比 Cache-coherent 互連更為直接 |
| **主要職責** | 處理 SoC 中除了 Cached CPU 以外的互連 |

### Coherent NoC（Ncore）

![Figure 5: Coherent NoC deployments](/arteris/5.jpg)

**Figure 5** 展示了 Coherent NoC 的典型部署：多個 CPU Cluster 透過 Coherent NoC（含 L3 Cache）互連。

#### 核心功能：資料共享

Cache Coherent 互連實現 **CPU、GPU 和 Accelerator 之間的無縫通訊和資料共享**，確保系統中對 Shared Memory 的**統一視圖（Unified View）**。透過在硬體中維護多個處理器間的一致性，Coherent NoC 能夠**提升效率**並**簡化軟體開發**。

#### Distributed Cache Coherence

Coherent NoC 專為先進 SoC 架構設計，支援 **Distributed Cache Coherence** 等特性，使其成為 **AI、Data Centers、HPC** 等高效能低延遲應用的理想選擇。

#### 何時需要 Coherent NoC？

在多個 IP 需要維護 Shared Memory 一致性的系統中，Coherent NoC 是必要的。具體情況包括 CPU Cluster 需要與以下 IP 維護 Cache Coherence：

- 第二個 CPU Cluster
- I/O Coherent Interface
- Accelerator

#### Ncore：分散式異構架構

Ncore IP 是一個 **Distributed Heterogeneous Cache Coherent Interconnect（分散式異構快取一致性互連）**。與固定或 Hub-based Cache Controller 不同，Ncore 是分散式解決方案，由複製的單元和核心元件組成，具有以下優勢：

| 特性 | 說明 |
|------|------|
| **Configurable Snoop Filters** | 多個可配置的 Snoop Filter，追蹤 Cache 狀態 |
| **Embedded Caches** | 嵌入式快取 |
| **Scalability** | 可擴展以適應各種處理需求 |
| **Flexibility** | 比固定或集中式架構更大的彈性 |

分散式架構也能簡化 **Power Management**、**Physical Implementation** 和 **Timing Closure**。

#### Protocol 支援

| Interface 類型 | Protocol | 說明 |
|----------------|----------|------|
| **Fully Coherent** | CHI-E, CHI-B, ACE | 完全一致性 Agent |
| **I/O Coherent** | ACE-Lite | I/O 一致性 Agent |
| **Non-coherent** | AXI | 無一致性需求的子系統或裝置 |

#### Proxy Cache

Ncore IP 包含**可配置的 Proxy Cache**，提升 Non-coherent Agent 存取 Coherent Subsystem 的效能，讓非快取 IP 也能獲得系統級 Coherency 的好處。

### 混合架構：Coherent + Non-coherent

![Figure 7: Mixture of coherent and non-coherent NoCs](/arteris/7.jpg)

**Figure 7** 展示了現代 SoC 中 Coherent 和 Non-coherent NoC 的混合架構。

基於 Ncore 互連的系統可以在邏輯上劃分為 **Coherent Subsystem** 和 **Non-coherent Subsystem**。現代 SoC 設計結合兩種 NoC 互連，以利用每種方法的優勢。透過謹慎選擇實現方式，設計者可以創建提供**最佳 Performance、Power Efficiency 和 Scalability 平衡**的 SoC。

#### Coherent vs Non-coherent 比較

| 面向 | Coherent NoC | Non-coherent NoC |
|------|--------------|------------------|
| **主要職責** | 管理 Cached CPU | 處理 SoC 其餘互連 |
| **核心功能** | CPU/GPU/Accelerator 資料共享 | 效能、功耗、面積優化 |
| **Cache Coherence** | 硬體實現 | 軟體處理 |
| **軟體開發** | 簡化（硬體維護一致性） | 需自行處理一致性 |
| **功耗** | 較高（Coherence 開銷） | 較低 |
| **延遲** | - | 更低（無 Coherence 開銷） |
| **適用場景** | AI、HPC、資料中心 | 各種 SoC 架構 |

## 現代高階 SoC 架構

![Figure 8: Modern high-end SoC example](/arteris/8.jpg)

**Figure 8** 展示了現代高階 SoC 的典型架構，包含 Coherent 和 Non-coherent NoC 的混合部署。

## NoC Topology

![Figure 10: Common NoC Topologies](/arteris/10.jpg)

**Figure 10** 展示了常見的 NoC Topology。

::: tip 對應章節
關於 Topology 的詳細分析，請參考 [Topology 章節](/03-topology/)。
:::

## 自動化 NoC 生成

![Figure 9: PU arrays using NoC-based soft tiling](/arteris/9.jpg)

**Figure 9** 展示了現代 NoC IP 的自動化能力，支援 Processing Unit 陣列的自動生成和配置。

## 關鍵要點總結

### 演進驅動力

根據 Arteris 技術文件，SoC 互連的演進驅動力：

| 時代 | 技術 | 驅動演進的問題 |
|------|------|----------------|
| **第一代** | Bus | Arbitration Bottleneck |
| **第二代** | Crossbar | Timing Closure、面積、功耗問題 |
| **第三代** | NoC | 透過 Packetization 解決佈線問題 |
| **第四代** | Coherent + Non-coherent NoC | 支援 CPU/GPU/Accelerator 資料共享 |

### 何時選擇 Coherent vs Non-coherent？

根據原文描述：

**選擇 Coherent NoC 的情況：**
> "If the CPU cluster is required to maintain cache coherence with other IPs, for example, a second CPU cluster, an I/O coherent interface, or accelerator, then a coherent NoC will be employed."

**選擇 Non-coherent NoC 的情況：**
> "Coherent NoCs will primarily manage cached CPUs, while non-coherent NoCs will handle the rest of the SoC interconnect."

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
