# Intel TeraFLOPS (2007)

**Intel TeraFLOPS**（又稱 Polaris）是 Intel 在 2007 年展示的 80 核研究晶片，是首個達到 **1 TFLOPS** 效能的單一晶片。它驗證了大規模 On-chip Network 的可行性。

## 晶片概述

| 參數 | 值 |
|------|-----|
| **製程** | 65nm |
| **核心數** | 80 |
| **Topology** | 10×8 2D Mesh |
| **頻率** | 3.16-5.67 GHz |
| **峰值效能** | 1.01 TFLOPS |
| **功耗** | 62-265W |
| **Die Size** | 275 mm² |

![Figure 8.11: Intel TeraFLOPS Architecture](/images/ch08/Figure%208.11.jpg)

Figure 8.11 展示了 TeraFLOPS 的 80 個 Tile 排列和 2D Mesh 網路。

## 歷史意義

### 里程碑

| 年份 | 系統 | TFLOPS 達成方式 |
|------|------|-----------------|
| 1997 | ASCI Red | 超級電腦（數千節點） |
| 2007 | Intel TeraFLOPS | 單一晶片 |

### 研究目標

1. 驗證大規模 On-chip Network
2. 探索 Manycore 架構
3. 評估功耗和頻率擴展

## Tile 架構

![Figure 8.12: TeraFLOPS Tile Architecture](/images/ch08/Figure%208.12.jpg)

Figure 8.12 展示了單個 Tile 的內部結構。

### 簡化的 PE

每個 Tile 包含極簡化的 Processing Element：

| 元件 | 說明 |
|------|------|
| **FPU** | 單/雙精度浮點 |
| **FMAC** | 2 個乘加單元 |
| **SRAM** | 3 KB 指令，2 KB 資料 |
| **Router** | 5-port Mesh Router |

### 設計哲學

| 原則 | 實現 |
|------|------|
| **簡單核心** | 沒有 Cache、複雜控制 |
| **高效能密度** | FMAC 主導面積 |
| **低功耗** | 每核心約 3W |

## 2D Mesh 網路

### 網路規格

| 參數 | 值 |
|------|-----|
| **Topology** | 10×8 2D Mesh |
| **Link Width** | 39 bits |
| **頻率** | 與 Tile 同步 |
| **Bisection BW** | 1.62 TB/s |

### Router 設計

| 參數 | 規格 |
|------|------|
| **Ports** | 5 (N, S, E, W, Local) |
| **Pipeline** | 2-stage |
| **Flow Control** | Wormhole |
| **Routing** | XY Dimension-ordered |

### Wormhole 選擇

| 原因 | 說明 |
|------|------|
| **低 Buffer** | 每 port 只需小 Buffer |
| **簡單** | 適合高頻率設計 |
| **低延遲** | Pipeline 切穿 |

## 功耗分析

### 總體分佈

| 元件 | 功耗佔比 |
|------|----------|
| Tile (計算) | ~75% |
| **Router/Network** | ~10% |
| Clock | ~10% |
| Others | ~5% |

### 網路功耗

| 項目 | 說明 |
|------|------|
| Link | 主要功耗來源 |
| Buffer | 較小（Wormhole） |
| Router Logic | 簡單設計 |

## 頻率擴展

### 測試結果

| 電壓 | 頻率 | 效能 | 功耗 |
|------|------|------|------|
| 0.95V | 3.16 GHz | 0.5 TFLOPS | 62W |
| 1.2V | 5.1 GHz | 0.8 TFLOPS | 175W |
| 1.35V | 5.67 GHz | 1.01 TFLOPS | 265W |

### 觀察

- 接近 6 GHz 的晶片內通訊
- DVFS 提供寬廣的功耗/效能權衡
- 網路可以跟上高頻率

## 設計限制

### 簡化代價

| 限制 | 影響 |
|------|------|
| 無 Cache | 需要軟體管理 |
| 簡單控制 | 有限的程式模型 |
| 專用工作負載 | 通用性差 |

### 記憶體頻寬

| 問題 | 說明 |
|------|------|
| **On-chip** | 僅 256 KB 總計 |
| **Off-chip** | 頻寬不足 |
| **瓶頸** | 記憶體綁定工作負載 |

## 程式設計

### Message Passing

| 特點 | 說明 |
|------|------|
| **模型** | 明確訊息傳遞 |
| **API** | 自訂低階 API |
| **適合** | 規則資料流 |

### 典型應用

| 應用 | 適合度 |
|------|--------|
| 矩陣運算 | 極佳 |
| FFT | 佳 |
| 通用程式 | 差 |

## 後續影響

### Knights 系列前身

TeraFLOPS 的研究直接影響了：

| 產品 | 繼承的設計 |
|------|-----------|
| **Knights Ferry** | Manycore 概念 |
| **Knights Corner** | 眾核 Ring 網路 |
| **Knights Landing** | 2D Mesh 演進 |

### 驗證的觀點

1. **NoC 可擴展**
   - 80 核心可以有效連接
   - 2D Mesh 是可行的

2. **高頻率 NoC**
   - 接近 6 GHz 的網路運作
   - 不是系統瓶頸

3. **功耗可控**
   - NoC 佔總功耗約 10%
   - 可以接受

## 與其他研究晶片比較

| 晶片 | 年份 | 核心 | 網路 | 重點 |
|------|------|------|------|------|
| RAW (MIT) | 2002 | 16 | Mesh | 可重配置 |
| **TeraFLOPS** | 2007 | 80 | Mesh | 效能 |
| SCC (Intel) | 2010 | 48 | Mesh | 可程式性 |

## 設計啟示

### 研究價值

1. **規模驗證**
   - 證明 80+ 核心可行
   - 2D Mesh 可擴展到此規模

2. **高頻率設計**
   - NoC 不是頻率瓶頸
   - 簡單設計達成高頻率

3. **功耗評估**
   - 提供真實功耗數據
   - 指導未來設計

### 後續方向

| 需要改進 | 解決方案 |
|----------|----------|
| 可程式性 | 加入 Cache、複雜控制 |
| 記憶體頻寬 | HBM、3D 堆疊 |
| 通用性 | 完整 ISA 支援 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 8.7
- S. Vangal et al., "An 80-Tile Sub-100W TeraFLOPS Processor in 65nm CMOS," ISSCC 2007

