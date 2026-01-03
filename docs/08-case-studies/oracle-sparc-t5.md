# Oracle SPARC T5 (2013)

**SPARC T5** 是 Oracle 的高效能伺服器處理器，專為企業級工作負載設計。它展示了針對高吞吐量伺服器應用的 On-chip Network 設計。

## 晶片概述

| 參數 | 值 |
|------|-----|
| **製程** | 28nm |
| **核心數** | 16 |
| **Threads** | 128 (8 threads/core) |
| **L3 Cache** | 8 MB |
| **頻率** | 3.6 GHz |
| **功耗** | 120W |

![Figure 8.7: Oracle SPARC T5 Architecture](/images/ch08/Figure%208.7.jpg)

Figure 8.7 展示了 SPARC T5 的整體架構和 Crossbar 互連。

## 網路架構

SPARC T5 使用**Crossbar-based 互連**，與大多數使用 Mesh 的多核處理器不同。

### Crossbar 互連

| 參數 | 值 |
|------|-----|
| **Topology** | Crossbar |
| **Ports** | 16 cores + Memory + I/O |
| **頻寬** | 非常高 |
| **延遲** | 最低 |

### 設計選擇理由

| 考量 | Crossbar 優勢 |
|------|---------------|
| **核心數量** | 16 核可接受 |
| **延遲** | 單跳到任何目的地 |
| **頻寬** | 全頻寬矩陣 |
| **伺服器工作負載** | 延遲敏感 |

## Core 架構

### 深度多線程

| 特點 | 規格 |
|------|------|
| **Threads/Core** | 8 (最細粒度 SMT) |
| **Pipeline** | 16-stage |
| **發射寬度** | 2-way OoO |
| **Register File** | 每 Thread 獨立 |

### 設計哲學

Oracle/Sun 的 **Throughput Computing** 理念：

- 大量硬體線程隱藏延遲
- 簡單核心、多線程
- 優化 Thread-level Parallelism

## Cache 階層

![Figure 8.8: SPARC T5 Cache Hierarchy](/images/ch08/Figure%208.8.jpg)

Figure 8.8 展示了 SPARC T5 的 Cache 階層結構。

### Cache 配置

| 層級 | 類型 | 大小 | 特點 |
|------|------|------|------|
| **L1 I-Cache** | Private | 16 KB | 每 Core |
| **L1 D-Cache** | Private | 16 KB | 每 Core |
| **L2 Cache** | Private | 128 KB | 每 Core |
| **L3 Cache** | Shared | 8 MB | 全域共享 |

### Coherence

| 特點 | 說明 |
|------|------|
| **Protocol** | MOESI 變體 |
| **Directory** | 集中式 |
| **Snoop** | 全系統 Snoop |

## Crossbar 設計細節

### 結構

| 元件 | 功能 |
|------|------|
| **Input Ports** | 來自各 Core 的請求 |
| **Output Ports** | 到 L3、Memory、I/O |
| **Arbiter** | 多對一仲裁 |
| **Buffers** | 請求佇列 |

### 仲裁策略

| 策略 | 說明 |
|------|------|
| **Round-robin** | 基本公平性 |
| **Priority** | 關鍵路徑優先 |
| **Age-based** | 防止 Starvation |

## 記憶體子系統

### Memory Controller

| 參數 | 值 |
|------|-----|
| **Channels** | 4 |
| **Type** | DDR3 |
| **頻寬** | ~100 GB/s |

### 存取路徑

1. Core 發出 Request
2. 通過 Crossbar 到 L3
3. 如 Miss，到 Memory Controller
4. Response 經 Crossbar 返回

## 效能特點

### 吞吐量導向

| 指標 | 設計目標 |
|------|----------|
| **TPS** | 最大化交易數 |
| **Throughput** | 高 Aggregate |
| **Latency** | 次要考量（多線程隱藏） |

### 適用工作負載

| 工作負載 | 適合度 |
|----------|--------|
| 資料庫 | 極佳 |
| Web 伺服器 | 極佳 |
| 批次處理 | 佳 |
| 單線程 | 普通 |

## 與 Mesh 比較

### 為何選擇 Crossbar

| 考量 | Crossbar | Mesh |
|------|----------|------|
| 核心數 | ≤16 可行 | 任意 |
| 延遲 | O(1) | O(√N) |
| 面積 | O(N²) | O(N) |
| 頻寬 | 全連接 | 局部受限 |

### 權衡

| Crossbar | Mesh |
|----------|------|
| 延遲最低 | 可擴展 |
| 不可擴展 | 延遲隨規模增加 |
| 設計簡單 | 需複雜 Routing |

## 設計啟示

### 伺服器 NoC 設計

1. **延遲重要**
   - 伺服器工作負載對延遲敏感
   - Crossbar 提供最低延遲

2. **適度規模**
   - 16 核是 Crossbar 的實際上限
   - 更大規模需要 Mesh 或階層式設計

3. **多線程隱藏延遲**
   - 深度 SMT 可以容忍網路延遲
   - 但低延遲仍然重要

### 應用場景

| 場景 | 適合的互連 |
|------|------------|
| 16 核以下 | Crossbar |
| 16-64 核 | 階層式 Crossbar |
| 64+ 核 | Mesh |

## 後續發展

### SPARC M7/M8

| 特點 | 說明 |
|------|------|
| 更多核心 | 32 核 |
| 網路演進 | 階層式設計 |
| 安全功能 | Silicon Secured Memory |

## 參考資料

- On-Chip Networks Second Edition, Chapter 8.5
- Oracle SPARC T5 Processor documentation

