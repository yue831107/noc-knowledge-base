# Case Studies

本章介紹真實世界中的 On-chip Network 實作案例，涵蓋從研究晶片到商業產品的各種設計。這些案例展示了不同應用領域中 NoC 設計的權衡和創新。

## 案例總覽

![Table 8.1: Summary of On-chip Network Case Studies](/images/ch08/Table%208.1.jpg)

Table 8.1 總結了本章介紹的各種 On-chip Network 案例研究的關鍵參數和設計選擇。

## 記憶體架構總覽

不同系統採用不同的記憶體架構，這直接影響 NoC 的設計需求：

| Case Study | 記憶體架構 | Coherence Protocol | NoC 需求 |
|------------|------------|-------------------|----------|
| [Princeton Piton](./princeton-piton) | **Shared Memory** | MESI Directory | 支援 Coherence 流量 |
| [Intel Xeon Phi](./intel-xeon-phi) | **Shared Memory** | MESIF Directory | 高頻寬、低延遲 |
| [Oracle SPARC T5](./oracle-sparc-t5) | **Shared Memory** | MOESI Centralized | Crossbar 全連接 |
| [Tilera TILEPRO64](./tilera) | **Hybrid** | MDN (Coherent) | 多網路分離 |
| [Intel TeraFLOPS](./intel-teraflops) | **Message Passing** | 無 | 高頻寬點對點 |
| [IBM Cell](./ibm-cell) | **Message Passing (DMA)** | 無 | 高頻寬 DMA |
| [D.E. Shaw Anton 2](./anton2) | **Message Passing (DMA)** | 無 | 確定性延遲 |
| [MIT Eyeriss](./mit-eyeriss) | **Dataflow** | 無 | Multicast 支援 |

::: tip 記憶體架構影響
- **Shared Memory**：需要 Cache Coherence 支援，NoC 必須處理多種 Message Class
- **Message Passing**：不需要 Coherence，但需要高效的 DMA 傳輸
- **Dataflow**：針對特定資料流模式優化，通常需要 Multicast 能力
:::

## 案例分類

### 深度學習加速器

| 年份 | 名稱 | 特點 |
|------|------|------|
| 2016 | [MIT Eyeriss](./mit-eyeriss) | Row-stationary Dataflow、Multicast Network |

### 開源研究處理器

| 年份 | 名稱 | 特點 |
|------|------|------|
| 2015 | [Princeton Piton](./princeton-piton) | 開源 25 核、三個獨立網路 |

### 高效能運算

| 年份 | 名稱 | 特點 |
|------|------|------|
| 2015 | [Intel Xeon Phi](./intel-xeon-phi) | 72 核眾核處理器、2D Mesh |
| 2014 | [D.E. Shaw Anton 2](./anton2) | 分子動力學專用、3D Torus |
| 2007 | [Intel TeraFLOPS](./intel-teraflops) | 80 核研究晶片、首個 TFLOPS |

### 伺服器處理器

| 年份 | 名稱 | 特點 |
|------|------|------|
| 2013 | [Oracle SPARC T5](./oracle-sparc-t5) | 16 核伺服器、Crossbar |

### 商業眾核處理器

| 年份 | 名稱 | 特點 |
|------|------|------|
| 2008 | [Tilera TILEPRO64](./tilera) | 64 核、5 個獨立網路 |

### 異構處理器

| 年份 | 名稱 | 特點 |
|------|------|------|
| 2005 | [IBM Cell](./ibm-cell) | PPE + 8 SPE、EIB 環網路 |

## 設計演進

### Topology 趨勢

| 時期 | 主流 Topology | 代表晶片 |
|------|---------------|----------|
| 2005-2008 | Ring、Bus | IBM Cell |
| 2007-2012 | 2D Mesh | Intel TeraFLOPS、Tilera |
| 2013-今 | Mesh + Crossbar 混合 | Intel Xeon Phi |

### 核心數量趨勢

| 年份 | 典型核心數 | 代表晶片 |
|------|------------|----------|
| 2005 | 8-16 | IBM Cell (9) |
| 2008 | 64 | Tilera TILEPRO64 |
| 2015+ | 72+ | Intel Xeon Phi |

## 設計權衡總結

### Topology 選擇

| Topology | 優點 | 缺點 | 適用場景 |
|----------|------|------|----------|
| Ring | 簡單、低成本 | Diameter 大 | 少量核心 |
| 2D Mesh | 規則、可擴展 | 邊緣 Bisection 受限 | 中大型多核 |
| 3D Torus | 低 Diameter | 佈線複雜 | 特殊應用 |
| Crossbar | 最低延遲 | 不可擴展 | 少量高效能 |

### 網路數量選擇

| 策略 | 優點 | 缺點 | 範例 |
|------|------|------|------|
| 單一網路 | 簡單、低成本 | 需複雜 Deadlock 避免 | Intel TeraFLOPS |
| 多網路 | 天然 Deadlock-free | 面積成本高 | Piton (3)、Tilera (5) |

## 學習目標

1. 了解不同應用領域的 NoC 設計選擇
2. 分析真實系統中的設計權衡
3. 理解 NoC 設計如何隨技術和需求演進
4. 學習從案例中提取設計模式

## 參考資料

- On-Chip Networks Second Edition, Chapter 8

