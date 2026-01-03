# Multi-core 時代

## 從 Single-core 到 Multi-core

不斷增加的功耗壓力，以及 Uniprocessor 架構效能提升的邊際效益遞減，促成了 Multi-core 晶片的出現。隨著每一代製程技術提供更多的 Transistor，加上 Multi-core 晶片模組化設計降低了設計複雜度，Multi-core 浪潮勢不可擋。

近年來，幾乎所有晶片廠商都推出了 Core 數量不斷增加的 Multi-core 產品。這波 Multi-core 浪潮可能導致數百甚至數千個 Core 整合在單一晶片上。我們已經看到：

- **HPC 領域**：超過 50 個 Core 的商用產品
- **研究原型**：超過 100 個 Core

此外，**異構性（Heterogeneity）** 在許多市場區隔中已成為常態，除了處理器 Core 之外，On-chip Fabric 還需要互連嵌入式記憶體、DSP 模組、Video Processor 和 Graphics Processor 等加速器。

## 通訊需求的增長

隨著 On-chip Core 數量增加，一個可擴展的低延遲、高頻寬通訊架構變得至關重要。

### 不同互連方式的演進

| Core 數量 | 主流互連方式 | 範例 |
|-----------|--------------|------|
| 4-8 | Bus / Crossbar | Sun Niagara (2005) - Crossbar |
| 9+ | Ring / Mesh | IBM Cell (2005) - 4 個 Ring |
| 64+ | Packet-switched Mesh | Tilera TILE64 (2007) - 5 個 Mesh |

### 應用領域的需求

Multi-core 和 Many-core 架構現在普遍存在於各種運算領域：

- **資料中心**：提升伺服器整合度
- **桌面應用**：特別是圖形和遊戲
- **吞吐量導向應用**：需要高頻寬通訊
- **多執行緒工作負載**：執行緒間同步需要低延遲通訊

### MPSoC（Multiprocessor System-on-Chip）

在 MPSoC 中，利用 On-chip Network 可以實現設計隔離：來自不同供應商的異構 IP Block 可以透過標準介面，以即插即用的方式通過 On-chip Network 進行通訊。

## 傳統互連架構的限制

### Bus 的問題

::: warning Bus 的擴展性限制
- **頻寬飽和**：隨著更多 Core 加入，Bus Traffic 很快達到飽和
- **功耗過高**：驅動長 Bus 並讓多個 Core 連接的功耗極高
- **仲裁延遲**：集中式 Arbiter 會隨著 Core 數量增加而增加延遲
:::

為解決這些問題，複雜的 Bus 設計開始採用分段、分散式仲裁、分離式交易等技術，逐漸接近 Switched On-chip Network。

### Crossbar 的問題

Crossbar 解決了 Bus 的頻寬問題，但對於大量 Node 來說擴展性不佳：

- **面積開銷**：例如 Sun Niagara 2 的 8×9 Crossbar 面積接近一個 Core
- **功耗消耗**：高功耗

為此，**階層式 Crossbar** 被提出：將 Core 分群，使用多層較小的 Crossbar 提供互連。例如 Sun Rock 架構的 16 個 Core，若使用平面 Crossbar 需要 17×17，但最終選擇了 5×5 Crossbar 連接每組 4 個 Core 的 Cluster，面積可減少 8 倍以上。

## 參考資料

- On-Chip Networks Second Edition, Chapter 1.1
