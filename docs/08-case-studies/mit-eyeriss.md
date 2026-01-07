# MIT Eyeriss (2016)

**Eyeriss** 是由 MIT 開發的專用深度學習加速器，展示了針對 CNN（卷積神經網路）工作負載優化的 On-chip Network 設計。

## 晶片概述

| 參數 | 值 |
|------|-----|
| **製程** | 65nm |
| **PE 數量** | 168 (12×14) |
| **頻率** | 200 MHz |
| **功耗** | 278 mW |
| **應用** | CNN 推理 |

![Figure 8.1: MIT Eyeriss Architecture](/images/ch08/Figure%208.1.jpg)

> **圖 8.1 解說**：Eyeriss 架構圖展示了 AI 加速器中 NoC 的獨特設計。不同於傳統的通用 [Mesh](/03-topology/direct-topologies) 拓撲，Eyeriss 採用階層式網路：Global Buffer Network 負責將資料從外部記憶體分發到 PE 陣列，PE Array Network 則處理 Processing Element 之間的局部通訊。這種設計針對 CNN 的資料重用模式進行了優化，大幅降低能耗。

Figure 8.1 展示了 Eyeriss 的整體架構，包含 PE Array、Global Buffer 和多層網路。

## 記憶體架構：Dataflow

::: info 記憶體模型
Eyeriss 採用 **Dataflow** 架構，這是深度學習加速器特有的記憶體模型。與傳統 CMP 的 Shared Memory 或 Message Passing 不同，Dataflow 架構的資料移動完全由**資料流動模式（Dataflow Pattern）**決定，而非由程式指令明確控制。
:::

### 為何 DNN 加速器不需要 Cache Coherence

| 傳統 CMP | Eyeriss (DNN 加速器) |
|----------|---------------------|
| 多核共享資料、競爭存取 | 資料流動模式固定 |
| 需要 Cache Coherence 確保一致性 | 資料重用由 Dataflow 精確控制 |
| 程式控制資料移動 | 硬體根據 CNN 結構自動搬移 |

### Dataflow 架構的特點

| 特性 | 說明 |
|------|------|
| **固定資料路徑** | Filter、Input、Psum 的流動路徑在編譯時決定 |
| **無 Cache** | PE 使用 Scratchpad（Register File）而非 Cache |
| **Multicast 支援** | 同一資料可同時傳送到多個 PE |
| **高資料重用** | Row-stationary Dataflow 最大化重用率 |

### 記憶體層次

```
┌─────────────────────────────────────────┐
│              Off-chip DRAM              │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────┴───────────────────────┐
│         Global Buffer (108 KB)          │  ← 全域資料暫存
│    (Filter / Input Feature Map 分發)    │
└─────────────────┬───────────────────────┘
                  ↓ Global Network (Multicast)
┌─────────────────┴───────────────────────┐
│    PE Array (168 PE, each with RF)      │  ← 每個 PE 有自己的 Register File
│         Local Network (Psum 傳遞)        │
└─────────────────────────────────────────┘
```

::: tip 與其他架構的比較
| 架構 | Coherence | 資料管理 | 典型應用 |
|------|-----------|----------|----------|
| **Shared Memory** | 需要 | 硬體自動（透明 Cache） | 通用 CMP |
| **Message Passing** | 不需要 | 軟體手動（DMA） | HPC、Cell |
| **Dataflow** | **不需要** | **Dataflow 模式自動** | **DNN 加速器** |
:::

## 網路架構

Eyeriss 採用**階層式網路架構**（參見 [Hierarchical Topology](/03-topology/hierarchical)），針對 CNN 的資料重用模式進行優化。

### Global Network (GLB NoC)

連接 Global Buffer 與 PE Array：

| 特性 | 說明 |
|------|------|
| **功能** | 分發 Input Feature Map 和 Filter |
| **Multicast** | 支援一對多傳輸（參見 [Multicast Routing](/04-routing/multicast-routing)） |
| **頻寬** | 高，滿足資料需求 |

### Local Network (PE Array)

PE 之間的局部連接：

| 特性 | 說明 |
|------|------|
| **方向** | 水平和垂直相鄰 |
| **用途** | Partial Sum 傳遞 |
| **Dataflow** | Row-stationary |

## Row-stationary Dataflow

Eyeriss 的核心創新是 **Row-stationary Dataflow**，最大化資料重用：

### 重用層級

| 層級 | 重用類型 | 說明 |
|------|----------|------|
| **Convolutional** | Filter | 同一 Filter 用於多個位置 |
| **Filter** | Weight | Weight 在 PE 內重用 |
| **Row** | Input/Psum | 相鄰行共享資料 |

### 網路支援

| 操作 | 網路需求 |
|------|----------|
| Filter 分發 | Multicast 到 PE 列 |
| Input 分發 | Unicast 到指定 PE |
| Psum 傳遞 | PE 間局部傳輸 |

## Multicast 網路

### 設計動機

CNN 中同一 Filter 需要被多個 PE 使用：

- **傳統 Unicast**：需要多次傳輸相同資料
- **Multicast**：單次傳輸到多個目的地

### 實作方式

| 元件 | 功能 |
|------|------|
| **Tag 比較** | 確定哪些 PE 接收 |
| **Row Selector** | 選擇目標行 |
| **Column Broadcast** | 行內廣播 |

### 頻寬節省

| 模式 | 頻寬使用 |
|------|----------|
| Unicast | N × Filter Size |
| Multicast | 1 × Filter Size |
| 節省比例 | 高達 N 倍 |

## Network-on-Chip 細節

### Global Buffer Network

| 參數 | 規格 |
|------|------|
| **Topology** | Bus + Distribution Tree |
| **Data Width** | 16-bit (activation) |
| **Buffer Size** | 108 KB |

### PE Array Network

| 參數 | 規格 |
|------|------|
| **Topology** | 2D Array |
| **Connections** | 4 neighbors |
| **Data Width** | 16-bit |

## 功耗分析

### 網路功耗佔比

| 元件 | 功耗佔比 |
|------|----------|
| PE Array | 55% |
| Global Buffer | 30% |
| **NoC** | ~10% |
| Control | 5% |

### 節能策略

| 策略 | 效果 |
|------|------|
| Multicast | 減少重複傳輸 |
| Data Reuse | 減少記憶體存取 |
| Gating | 閒置 PE 關閉（參見 [Low-power 技術](/06-router-microarchitecture/low-power)） |

## 設計啟示

### 針對 DNN 的 NoC 設計原則

1. **資料重用感知**：網路支援 Dataflow 的重用模式
2. **Multicast 支援**：減少冗餘傳輸
3. **階層式設計**：Global + Local 網路分離
4. **靈活映射**：支援不同 Layer 配置

### 與傳統 NoC 的差異

| 面向 | 傳統 NoC | Eyeriss NoC |
|------|----------|-------------|
| Traffic | 隨機/均勻 | 結構化模式（參見 [Traffic Patterns](/07-modeling-evaluation/traffic-patterns)） |
| Routing | 通用 | 應用專用 |
| Multicast | 通常不支援 | 核心功能 |
| 優化目標 | 通用效能 | 能效比 |

## 後續發展

### Eyeriss v2

| 改進 | 說明 |
|------|------|
| 更大規模 | 更多 PE |
| 靈活 Dataflow | 支援更多網路結構 |
| 更高能效 | 改進的資料重用 |

## 相關案例

- [Intel Xeon Phi](/08-case-studies/intel-xeon-phi) - 高效能運算的 Mesh 網路
- [IBM Cell](/08-case-studies/ibm-cell) - 異構多核的 Ring 網路

## 參考資料

- On-Chip Networks Second Edition, Chapter 8.1
- Y.-H. Chen et al., "Eyeriss: An Energy-Efficient Reconfigurable Accelerator for Deep Convolutional Neural Networks," ISSCC 2016
