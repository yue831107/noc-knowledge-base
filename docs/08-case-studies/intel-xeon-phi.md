# Intel Xeon Phi (2015)

**Intel Xeon Phi**（代號 Knights Landing，KNL）是 Intel 的眾核處理器產品線，專為高效能運算（HPC）設計。它展示了商業級大規模 On-chip Network 的設計。

## 晶片概述

| 參數 | 值 |
|------|-----|
| **製程** | 14nm |
| **核心數** | 最多 72 |
| **Tile 數** | 38 (36 compute + 2 I/O) |
| **每 Tile 核心** | 2 |
| **頻率** | 1.3-1.5 GHz |
| **TDP** | 215-250W |

![Figure 8.3: Intel Xeon Phi (Knights Landing) Architecture](/images/ch08/Figure%208.3.jpg)

Figure 8.3 展示了 Knights Landing 的整體架構，包含 Tile 配置和 2D Mesh 互連。

## Tile 架構

![Figure 8.4: Xeon Phi Tile Detail](/images/ch08/Figure%208.4.jpg)

Figure 8.4 展示了單個 Tile 的內部結構。

### Tile 組成

| 元件 | 說明 |
|------|------|
| **2 Cores** | 修改版 Atom Core (Silvermont) |
| **L1 Cache** | 每 Core 32 KB I + 32 KB D |
| **L2 Cache** | 共享 1 MB |
| **VPU** | 512-bit Vector Processing Unit |

### Core 特點

| 特點 | 規格 |
|------|------|
| ISA | x86-64 + AVX-512 |
| SMT | 4 threads/core |
| 總 Threads | 最多 288 |
| Vector Width | 512-bit |

## 2D Mesh 網路

Knights Landing 使用**全連接 2D Mesh**作為 On-chip Network。

### 網路規格

| 參數 | 值 |
|------|-----|
| **Topology** | 2D Mesh |
| **Mesh Size** | ~8×8 (不規則) |
| **Link Width** | 64 bytes |
| **Rings** | 2 (YX + XY) |

### Dual Ring 設計

| 特點 | 說明 |
|------|------|
| **YX Ring** | Y 維度優先 |
| **XY Ring** | X 維度優先 |
| **目的** | 增加頻寬、降低擁塞 |

## 記憶體子系統

### MCDRAM (High Bandwidth Memory)

| 參數 | 值 |
|------|-----|
| **容量** | 16 GB |
| **頻寬** | ~490 GB/s |
| **位置** | On-package |
| **用途** | 高頻寬工作集 |

### DDR4

| 參數 | 值 |
|------|-----|
| **容量** | 最多 384 GB |
| **頻寬** | ~90 GB/s |
| **Channels** | 6 |

### 記憶體模式

| 模式 | MCDRAM 用途 |
|------|-------------|
| **Flat** | 作為可定址記憶體 |
| **Cache** | 作為 DDR4 的 L3 Cache |
| **Hybrid** | 部分 Flat、部分 Cache |

## Cache Coherence

### Directory-based Protocol

| 特點 | 說明 |
|------|------|
| **Directory 位置** | 分散在所有 Tile |
| **Protocol** | MESIF 變體 |
| **Snoop Filter** | 減少 Snoop 流量 |

### Coherence 流程

1. Core 發出 Request
2. 送到 Home Tile（根據位址）
3. Directory 查找 Sharer
4. 發送 Invalidation（如需要）
5. 回傳 Data/Ack

## 功耗管理

### 技術

| 技術 | 說明 |
|------|------|
| **Per-Core DVFS** | 每核心獨立頻率 |
| **Power Gating** | 關閉閒置 Tile |
| **Turbo Boost** | 動態超頻 |

### 功耗分佈

| 元件 | 功耗佔比 |
|------|----------|
| Cores | ~60% |
| **Mesh Network** | ~10-15% |
| Memory Controllers | ~15% |
| Others | ~10-15% |

## 設計特點

### 優點

| 優點 | 說明 |
|------|------|
| **擴展性** | 支援大量核心 |
| **頻寬** | 雙環提供高頻寬 |
| **商業驗證** | 量產產品 |

### 權衡

| 權衡 | 說明 |
|------|------|
| **延遲** | Mesh 延遲比 Ring 高 |
| **複雜度** | Directory 增加設計複雜度 |
| **功耗** | 大規模網路功耗顯著 |

## 與前代比較

### Knights Corner (KNC) vs Knights Landing (KNL)

| 特性 | KNC | KNL |
|------|-----|-----|
| 製程 | 22nm | 14nm |
| 核心數 | 61 | 72 |
| 網路 | 雙向 Ring | 2D Mesh |
| 記憶體 | GDDR5 | MCDRAM + DDR4 |
| 主機 | 協處理器 | 獨立處理器 |

### 網路演進原因

- Ring 在 60+ 核心時延遲過高
- Mesh 提供更好的擴展性
- 更均勻的頻寬分佈

## 程式設計模型

### 並行程式設計

| 模型 | 支援 |
|------|------|
| **OpenMP** | 完整支援 |
| **MPI** | 節點內外 |
| **SIMD** | AVX-512 內建 |

### 記憶體使用

```c
// MCDRAM 使用範例（numactl）
// Flat 模式：直接定址
numactl --membind=1 ./app  // MCDRAM on NUMA node 1

// Cache 模式：自動管理
// 無需程式修改
```

## 設計啟示

### 大規模 NoC 設計

1. **Mesh 優於 Ring**：核心數超過 ~60 時
2. **分散式 Directory**：避免單點瓶頸
3. **多記憶體層級**：MCDRAM 作為高頻寬層

### 商業考量

| 考量 | Knights Landing 選擇 |
|------|---------------------|
| 相容性 | x86 指令集 |
| 程式模型 | 標準 HPC 工具 |
| 功耗 | 在可接受範圍 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 8.3
- A. Sodani et al., "Knights Landing: Second Generation Intel Xeon Phi Product," IEEE Micro 2016

