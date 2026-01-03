# Princeton Piton (2015)

**Piton** 是由 Princeton 大學開發的開源多核處理器，作為 **OpenPiton** 專案的基礎。它展示了可擴展到數千核心的 On-chip Network 設計。

## 晶片概述

| 參數 | 值 |
|------|-----|
| **製程** | 32nm |
| **核心數** | 25 (可擴展至 8000+) |
| **Topology** | 5×5 2D Mesh |
| **頻率** | 1 GHz |
| **開源** | 是 (OpenPiton) |

![Figure 8.2: Princeton Piton Architecture](/images/ch08/Figure%208.2.jpg)

Figure 8.2 展示了 Piton 的 Tile 架構和三個獨立網路的配置。

## Tile 架構

每個 Tile 包含：

| 元件 | 說明 |
|------|------|
| **Core** | OpenSPARC T1 (修改版) |
| **L1.5 Cache** | Private，連接 Core 和 L2 |
| **L2 Cache Slice** | 分散式共享 L2 |
| **Router** | 3 個獨立 Router |

### Cache 階層

| 層級 | 類型 | 大小 |
|------|------|------|
| L1 I-Cache | Private | 16 KB |
| L1 D-Cache | Private | 8 KB |
| L1.5 Cache | Private | 8 KB |
| L2 Cache | Shared (distributed) | 64 KB/tile |

## 三網路架構

Piton 使用**三個完全獨立的 2D Mesh 網路**，這是其最顯著的設計特點。

### 網路分配

| 網路 | 名稱 | 用途 |
|------|------|------|
| **NoC 1** | Request Network | Cache Coherence Request |
| **NoC 2** | Response Network | Cache Coherence Response |
| **NoC 3** | Memory/IO Network | 記憶體和 I/O 存取 |

### 設計理由

**為何使用三個網路？**

1. **Protocol Deadlock 避免**
   - Request 和 Response 分離
   - 消除 Request-Response 循環依賴

2. **流量隔離**
   - 不同類型流量不互相干擾
   - 保證關鍵路徑頻寬

3. **簡化設計**
   - 每個網路只處理單一訊息類型
   - 不需要複雜的 VC 管理

### 網路參數

| 參數 | NoC 1 | NoC 2 | NoC 3 |
|------|-------|-------|-------|
| Flit Width | 64-bit | 64-bit | 64-bit |
| VC Count | 2 | 2 | 2 |
| Buffer Depth | 2 | 2 | 2 |

## Cache Coherence Protocol

Piton 實作了修改版的 **MESI Protocol**：

### 狀態

| 狀態 | 說明 |
|------|------|
| **M** (Modified) | 獨佔且已修改 |
| **E** (Exclusive) | 獨佔且乾淨 |
| **S** (Shared) | 共享 |
| **I** (Invalid) | 無效 |

### Directory-based 實作

| 特點 | 說明 |
|------|------|
| 分散式 Directory | 與 L2 Slice 共存 |
| Home Node | 根據位址 Hash 決定 |
| 無 Broadcast | 使用 Directory 追蹤 |

## 網路細節

### Router Microarchitecture

| 參數 | 規格 |
|------|------|
| **Pipeline** | 2-stage |
| **Ports** | 5 (N, S, E, W, Local) |
| **Routing** | Dimension-ordered (XY) |
| **Flow Control** | Credit-based |

### 設計特點

1. **簡單設計**
   - 最小化 Router 複雜度
   - 2-stage Pipeline 達成單 Cycle 跳躍

2. **確定性 Routing**
   - XY Routing 簡單且 Deadlock-free
   - 可預測的延遲

3. **有限 Buffering**
   - 2-flit Buffer 足夠因為多網路分離流量
   - 降低面積和功耗

## 可擴展性

### 設計目標

Piton 設計為可擴展到**數千核心**：

| 規模 | Mesh 大小 | 核心數 |
|------|-----------|--------|
| 小型 | 5×5 | 25 |
| 中型 | 16×16 | 256 |
| 大型 | 64×64 | 4,096 |
| 極大 | 89×89 | ~8,000 |

### 擴展考量

| 考量 | 解決方案 |
|------|----------|
| Diameter | 可接受（2D Mesh） |
| Memory | 分散式 Directory |
| Power | 局部通訊為主 |

## 開源 OpenPiton

### 專案特點

| 特點 | 說明 |
|------|------|
| **完整 RTL** | Verilog 原始碼 |
| **驗證環境** | 測試和驗證套件 |
| **文件** | 完整設計文件 |
| **擴展性** | 可配置核心數量 |

### 使用方式

```bash
# Clone OpenPiton
git clone https://github.com/PrincetonUniversity/openpiton

# 配置和編譯
source piton/piton_settings.bash
sims -sys=manycore -x_tiles=2 -y_tiles=2
```

## 設計啟示

### 多網路設計

| 優點 | 缺點 |
|------|------|
| 天然 Deadlock-free | 面積增加 |
| 流量隔離 | 線路複雜 |
| 簡單設計 | 資源可能未充分利用 |

### 適用場景

- **研究平台**：開放、可修改
- **可擴展設計**：驗證大規模系統
- **教學用途**：完整的參考設計

## 參考資料

- On-Chip Networks Second Edition, Chapter 8.2
- J. Balkind et al., "OpenPiton: An Open Source Manycore Research Framework," ASPLOS 2016

