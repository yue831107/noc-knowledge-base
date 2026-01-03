# Tilera TILEPRO64 (2008)

**TILEPRO64** 是 Tilera 公司開發的 64 核處理器，是最早的商用眾核處理器之一。它展示了多網路 On-chip Network 設計和 Tile-based 架構。

## 晶片概述

| 參數 | 值 |
|------|-----|
| **製程** | 90nm |
| **核心數** | 64 |
| **Topology** | 8×8 2D Mesh |
| **頻率** | 866 MHz |
| **功耗** | 15-30W |
| **應用** | 網路設備、多媒體 |

![Figure 8.9: Tilera TILEPRO64 Architecture](/images/ch08/Figure%208.9.jpg)

Figure 8.9 展示了 TILEPRO64 的 8×8 Tile Array 和五個獨立網路。

## Tile 架構

每個 Tile 是一個完整的計算單元：

| 元件 | 說明 |
|------|------|
| **Core** | 3-way VLIW 處理器 |
| **L1 I-Cache** | 8 KB |
| **L1 D-Cache** | 8 KB |
| **L2 Cache** | 64 KB (作為 L3 的一部分) |
| **Switch** | 5 個網路的 Router |

### VLIW Core

| 特點 | 規格 |
|------|------|
| **ISA** | Tile64 (自訂) |
| **發射寬度** | 3-way |
| **Pipeline** | 5-stage |
| **功耗** | ~0.5W/core |

## 五網路架構

TILEPRO64 最顯著的特點是其**五個完全獨立的 2D Mesh 網路**。

### 網路配置

![Figure 8.10: Tilera Five-Network Architecture](/images/ch08/Figure%208.10.jpg)

Figure 8.10 展示了五個網路的功能分配。

| 網路 | 名稱 | 用途 |
|------|------|------|
| **UDN** | User Dynamic Network | 使用者空間訊息傳遞 |
| **IDN** | I/O Dynamic Network | I/O 資料傳輸 |
| **TDN** | Tile Dynamic Network | 系統服務 |
| **MDN** | Memory Dynamic Network | 記憶體存取 |
| **STN** | Static Network | 靜態路由（可程式化） |

### Dynamic vs Static

| 類型 | 特點 | 用途 |
|------|------|------|
| **Dynamic** | 硬體路由 | 一般通訊 |
| **Static** | 軟體定義路由 | 資料流應用 |

### 網路參數

| 參數 | 所有網路 |
|------|----------|
| **Topology** | 2D Mesh |
| **Routing** | Dimension-ordered |
| **Flow Control** | Credit-based |
| **Flit Width** | 32 bits |

## iMesh 技術

Tilera 的 **iMesh** 是其網路技術的總稱。

### 特點

| 特點 | 說明 |
|------|------|
| **多網路** | 5 個獨立平面 |
| **確定性延遲** | 可預測的 Routing |
| **高頻寬** | 每 Tile 50+ Gbps |
| **低功耗** | 每 Tile < 100 mW (網路) |

### 使用者可存取網路

**UDN** 的獨特之處：

| 特點 | 說明 |
|------|------|
| **直接存取** | 使用者程式可直接使用 |
| **零複製** | Register 直接傳輸 |
| **低延遲** | 繞過 OS |

```c
// UDN 使用範例
__tile_udn_send(dest_tile, data);
data = __tile_udn_receive();
```

## 記憶體架構

### 分散式 Cache

| 層級 | 類型 | 說明 |
|------|------|------|
| L1 | Private | 每 Tile |
| L2 | Private | 每 Tile |
| L3 | Distributed | 所有 L2 組成 |

### Cache Coherence

| 特點 | 說明 |
|------|------|
| **Protocol** | 目錄式 |
| **Home Node** | 根據位址 Hash |
| **網路使用** | MDN |

## 設計動機

### 為何五個網路

1. **流量隔離**
   - 不同類型流量不互相干擾
   - 保證關鍵路徑頻寬

2. **Deadlock 避免**
   - 每個網路獨立，無交叉依賴
   - 簡化 Deadlock Freedom 證明

3. **QoS 保證**
   - 系統流量不影響使用者流量
   - 可預測的效能

### 權衡

| 優點 | 缺點 |
|------|------|
| 流量隔離 | 面積開銷 |
| 簡單設計 | Wire 成本 |
| QoS | 資源可能閒置 |

## 效能特點

### 低延遲

| 距離 | 延遲 |
|------|------|
| 相鄰 Tile | 1-2 cycles |
| 對角 (7 hops) | ~14 cycles |

### 高聚合頻寬

| 指標 | 值 |
|------|-----|
| 每 Tile | 50+ Gbps |
| 全晶片 | 2+ Tbps |

## 程式設計模型

### 通訊選項

| 模型 | 網路 | 用途 |
|------|------|------|
| 共享記憶體 | MDN | 一般並行程式 |
| 訊息傳遞 | UDN | 資料流應用 |
| 靜態資料流 | STN | 串流處理 |

### 典型用法

```c
// 共享記憶體（自動使用 MDN）
shared_array[i] = value;

// 訊息傳遞（使用 UDN）
send_to_tile(neighbor, packet);
```

## 後續產品

### TILE-Gx

| 改進 | 說明 |
|------|------|
| 核心數 | 36-72 |
| 製程 | 40nm |
| 頻率 | 1.2+ GHz |
| 網路 | 改進的 iMesh |

## 設計啟示

### 多網路設計價值

1. **簡化設計**
   - 每個網路簡單
   - 容易驗證

2. **效能隔離**
   - 關鍵流量有保證頻寬
   - 可預測的延遲

3. **靈活程式設計**
   - 使用者可直接使用網路
   - 支援多種通訊模式

### 適用場景

| 場景 | 適合度 |
|------|--------|
| 網路處理 | 極佳 |
| 多媒體 | 極佳 |
| 資料流 | 極佳 |
| 通用計算 | 佳 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 8.6
- D. Wentzlaff et al., "On-Chip Interconnection Architecture of the Tile Processor," IEEE Micro 2007

