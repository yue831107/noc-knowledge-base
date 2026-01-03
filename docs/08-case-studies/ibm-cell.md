# IBM Cell (2005)

**Cell Broadband Engine** 是由 IBM、Sony 和 Toshiba 聯合開發的異構多核處理器，最著名的應用是 PlayStation 3。它展示了早期的異構多核 On-chip Network 設計。

## 晶片概述

| 參數 | 值 |
|------|-----|
| **製程** | 90nm (後來 65nm、45nm) |
| **核心組成** | 1 PPE + 8 SPE |
| **頻率** | 3.2 GHz |
| **峰值效能** | 204.8 GFLOPS (單精度) |
| **功耗** | 85W |
| **應用** | PS3、高效能運算 |

![Figure 8.13: IBM Cell Architecture](/images/ch08/Figure%208.13.jpg)

Figure 8.13 展示了 Cell 的整體架構，包含 PPE、8 個 SPE 和 EIB 互連。

## 異構架構

Cell 是最早的**商用異構多核**處理器之一。

### 核心類型

| 核心 | 類型 | 數量 | 用途 |
|------|------|------|------|
| **PPE** | Power Processor Element | 1 | 主控制、OS |
| **SPE** | Synergistic Processor Element | 8 | 資料平行運算 |

### PPE (Power Processor Element)

| 特點 | 規格 |
|------|------|
| **架構** | 雙執行緒 Power ISA |
| **L1 Cache** | 32 KB I + 32 KB D |
| **L2 Cache** | 512 KB |
| **用途** | 執行 OS、協調 SPE |

### SPE (Synergistic Processor Element)

![Figure 8.14: SPE Architecture](/images/ch08/Figure%208.14.jpg)

Figure 8.14 展示了 SPE 的內部結構。

| 特點 | 規格 |
|------|------|
| **架構** | 128-bit SIMD |
| **Local Store** | 256 KB |
| **Register File** | 128 × 128-bit |
| **峰值** | 25.6 GFLOPS |

## Element Interconnect Bus (EIB)

Cell 的網路是其最獨特的設計之一：**4 個雙向環**。

### EIB 結構

![Figure 8.15: Element Interconnect Bus](/images/ch08/Figure%208.15.jpg)

Figure 8.15 展示了 EIB 的環結構。

| 參數 | 值 |
|------|-----|
| **Topology** | 4 Ring (2 CW + 2 CCW) |
| **連接節點** | 12 (1 PPE + 8 SPE + 2 I/O + MIC) |
| **環數** | 4 個獨立環 |
| **頻寬** | 204.8 GB/s (峰值) |

### 環方向

| 環 | 方向 | 頻寬 |
|-----|------|------|
| Ring 0 | 順時針 | 25.6 GB/s |
| Ring 1 | 順時針 | 25.6 GB/s |
| Ring 2 | 逆時針 | 25.6 GB/s |
| Ring 3 | 逆時針 | 25.6 GB/s |

### 為何選擇 Ring

| 考量 | Ring 優勢 |
|------|----------|
| **節點數量** | 12 節點適合 |
| **頻寬** | 多環提供高頻寬 |
| **延遲** | 最壞 6 跳 |
| **設計簡單** | 規則結構 |

## 資料流架構

Cell 採用**明確資料移動**模型。

### Local Store 程式設計

| 特點 | 說明 |
|------|------|
| **無 Cache** | SPE 沒有硬體 Cache |
| **軟體管理** | DMA 控制資料移動 |
| **雙緩衝** | 隱藏延遲 |

### DMA 引擎

| 功能 | 說明 |
|------|------|
| **List DMA** | 支援 Scatter-gather |
| **異步** | DMA 與計算重疊 |
| **頻寬** | 每 SPE 25.6 GB/s |

### 程式設計模式

```c
// SPE 程式設計範例
// 1. DMA 輸入資料到 Local Store
mfc_get(local_buf, main_mem_addr, size, tag, 0, 0);
mfc_write_tag_mask(1 << tag);
mfc_read_tag_status_all();

// 2. 在 Local Store 中計算
process_data(local_buf);

// 3. DMA 結果回主記憶體
mfc_put(local_buf, main_mem_addr, size, tag, 0, 0);
```

## EIB 協定

### Token-based Flow Control

| 特點 | 說明 |
|------|------|
| **機制** | Token 控制傳輸 |
| **無擁塞** | 預留資源 |
| **確定性** | 可預測延遲 |

### 仲裁

![Figure 8.16: EIB Arbitration](/images/ch08/Figure%208.16.jpg)

Figure 8.16 展示了 EIB 的仲裁機制。

| 特點 | 說明 |
|------|------|
| **公平** | 輪替服務 |
| **優先** | 支援優先級 |
| **多環利用** | 自動選擇最佳環 |

## 效能特點

### 頻寬

| 元件 | 頻寬 |
|------|------|
| **EIB 總計** | 204.8 GB/s |
| **每 SPE** | 25.6 GB/s |
| **記憶體** | 25.6 GB/s (XDR) |

### 延遲

| 距離 | 環延遲 |
|------|--------|
| 相鄰節點 | 幾 cycles |
| 最遠節點 | ~20 cycles |

## 應用領域

### PlayStation 3

| 用途 | 說明 |
|------|------|
| 遊戲物理 | SPE 加速 |
| 圖形處理 | 與 RSX GPU 配合 |
| 音訊處理 | SPE 處理 |

### 高效能運算

| 應用 | 說明 |
|------|------|
| **Roadrunner** | 首個 PFLOPS 超級電腦 |
| 科學模擬 | 高浮點效能 |
| 影像處理 | 資料平行 |

## 設計權衡

### 優點

| 優點 | 說明 |
|------|------|
| 高效能 | 高浮點密度 |
| 確定性 | 可預測延遲 |
| 高頻寬 | 200+ GB/s |

### 缺點

| 缺點 | 說明 |
|------|------|
| 程式設計困難 | 需要手動 DMA |
| 非通用 | SPE 限制多 |
| 除錯困難 | 異構複雜性 |

## 對 NoC 設計的影響

### 設計教訓

1. **異構需要複雜互連**
   - 不同元件有不同需求
   - 需要靈活的網路

2. **高頻寬可達成**
   - 多環提供高聚合頻寬
   - 適合資料密集應用

3. **程式設計模型重要**
   - 硬體能力需要軟體配合
   - 過於複雜會限制採用

### 後續影響

| 影響領域 | 說明 |
|----------|------|
| GPU 設計 | 類似的 SIMD 思想 |
| 異構計算 | ARM big.LITTLE 等 |
| 加速器 | 明確資料移動 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 8.8
- J. Kahle et al., "Introduction to the Cell Multiprocessor," IBM Journal of R&D 2005

