# FPGA 中的 NoC

FPGA 提供了獨特的 NoC 實現平台，既是研究工具也是實際產品。近年來，商業 FPGA 開始整合硬體 NoC，改變了 FPGA 系統設計的方式。

## FPGA 互連背景

### 傳統 FPGA 互連

FPGA 的可程式化互連資源：

| 層級 | 類型 | 特點 |
|------|------|------|
| **Local** | 相鄰 CLB 連線 | 最快 |
| **Switch Box** | 可配置開關矩陣 | 靈活 |
| **Long Lines** | 跨區域連線 | 延遲較高 |
| **Clock Network** | 專用時脈樹 | 低 Skew |

### 互連挑戰

| 挑戰 | 說明 |
|------|------|
| **資源有限** | 固定的 Routing 資源 |
| **延遲高** | 比 ASIC 高 3-5× |
| **功耗高** | 可程式開關功耗 |
| **擁塞** | 複雜設計難以佈線 |

## Soft NoC vs Hard NoC

### Soft NoC

在 FPGA 邏輯資源上**實現**的 NoC：

| 特點 | 說明 |
|------|------|
| **實現** | 使用 LUT、FF、BRAM |
| **靈活** | 完全可配置 |
| **資源消耗** | 佔用邏輯資源 |
| **效能** | 受限於 FPGA 速度 |

**優點**：
- 可根據需求客製化 Topology
- 可調整 Router Pipeline
- 適合研究和原型驗證

**缺點**：
- 消耗寶貴的邏輯資源
- 頻率和延遲受限
- 功耗較高

### Hard NoC

FPGA 內建的**硬體 NoC**：

| 特點 | 說明 |
|------|------|
| **實現** | 專用硬體電路 |
| **效能** | 高頻寬、低延遲 |
| **資源** | 不消耗邏輯資源 |
| **靈活性** | 固定 Topology |

**優點**：
- 高效能
- 釋放邏輯資源給使用者
- 功耗效率高

**缺點**：
- 固定配置
- 只有高端 FPGA 支援
- 設計需適應 NoC 位置

### 比較

| 面向 | Soft NoC | Hard NoC |
|------|----------|----------|
| 頻率 | 200-400 MHz | 1+ GHz |
| 延遲 | 較高 | 較低 |
| 資源 | 消耗 LUT/FF | 專用 |
| 靈活性 | 高 | 低 |
| 功耗 | 高 | 低 |

## 商業 Hard NoC

### AMD/Xilinx Versal

**Versal ACAP** 整合了硬體 NoC：

| 參數 | 規格 |
|------|------|
| **架構** | 2D Mesh |
| **頻寬** | 2+ TB/s 總計 |
| **延遲** | 數十 ns |
| **連接** | PL、PS、AIE、DDR |

**NoC 結構**：

| 元件 | 功能 |
|------|------|
| **NMU** | NoC Master Unit（發起請求） |
| **NSU** | NoC Slave Unit（接收請求） |
| **NPS** | NoC Packet Switch |
| **NCRB** | NoC Clock Region Bridge |

**使用方式**：
1. 在 Vivado 中配置 NoC
2. 定義 Master/Slave 連接
3. 設定 QoS 參數
4. 自動生成連接

### Intel Agilex

Intel FPGA 的 NoC 支援：

| 特點 | 說明 |
|------|------|
| **HBM 控制器** | 整合 NoC 連接 |
| **Fabric 互連** | 優化的互連結構 |

## Soft NoC 實現

### 典型架構

| 元件 | 實現 |
|------|------|
| **Buffer** | BRAM 或 Distributed RAM |
| **Crossbar** | LUT-based Mux |
| **Arbiter** | 組合邏輯 |
| **Router** | 完整 Pipeline |

### 資源使用範例

5-port Mesh Router（典型配置）：

| 資源 | 使用量 |
|------|--------|
| LUT | ~2000-4000 |
| FF | ~1000-2000 |
| BRAM | 1-4 |

### 優化技術

| 技術 | 效果 |
|------|------|
| **BRAM Buffer** | 減少 LUT 使用 |
| **簡化 Pipeline** | 減少 FF |
| **共享 Arbiter** | 減少邏輯 |
| **虛擬通道減少** | 降低複雜度 |

## FPGA NoC 設計考量

### Topology 選擇

| Topology | FPGA 適合度 | 原因 |
|----------|-------------|------|
| **Mesh** | 高 | 與 FPGA 結構匹配 |
| **Ring** | 中 | 簡單但延遲高 |
| **Butterfly** | 低 | 佈線複雜 |
| **Custom** | 視情況 | 需仔細規劃 |

### 時脈域

| 策略 | 說明 |
|------|------|
| **同步** | 單一時脈域 |
| **GALS** | 全域異步、局部同步 |
| **完全異步** | 無時脈 |

### Placement 考量

Router 放置影響效能：

| 策略 | 效果 |
|------|------|
| **規則佈局** | 可預測延遲 |
| **Floorplanning** | 優化關鍵路徑 |
| **Pblocks** | 控制佈局區域 |

## 應用場景

### 研究和原型

| 用途 | 說明 |
|------|------|
| **NoC 研究** | 驗證新架構 |
| **處理器原型** | 多核系統驗證 |
| **加速器開發** | 快速迭代 |

### 生產系統

| 應用 | NoC 類型 |
|------|----------|
| **資料中心加速** | Hard NoC |
| **通訊設備** | Soft/Hard |
| **嵌入式系統** | Soft NoC |

### AI 加速器

| 需求 | NoC 支援 |
|------|----------|
| **高頻寬** | Hard NoC 優勢 |
| **靈活 Dataflow** | Soft NoC 優勢 |
| **混合** | Hard + Soft |

## 設計流程

### Soft NoC 設計

1. **選擇/設計 Router**
   - 使用開源設計或自行設計
   - 參數化配置

2. **Topology 產生**
   - 使用 Generator 或手動連接
   - 產生 RTL

3. **整合到設計**
   - 連接 Master/Slave
   - 配置 Memory Map

4. **實現和驗證**
   - Synthesis、Place & Route
   - 時序驗證

### Hard NoC 設計 (Versal)

1. **NoC 配置**
   - 使用 Vivado NoC Designer
   - 定義連接

2. **QoS 設定**
   - 頻寬需求
   - 延遲限制

3. **驗證**
   - 模擬驗證
   - 硬體測試

## 開源 Soft NoC

### 可用專案

| 專案 | 語言 | 特點 |
|------|------|------|
| **CONNECT** | BSV | FPGA 優化 |
| **OpenSMART** | Chisel/BSV | 參數化 |
| **LioNMoC** | Verilog | 簡單易用 |

### 使用建議

| 需求 | 建議 |
|------|------|
| 研究原型 | CONNECT、OpenSMART |
| 教學 | 簡化設計 |
| 生產 | 商業 Hard NoC |

## 未來趨勢

### Hard NoC 普及

| 趨勢 | 說明 |
|------|------|
| **更多 FPGA 支援** | 擴展到中端產品 |
| **更高頻寬** | 滿足 AI 需求 |
| **更低延遲** | 優化 Router |

### Chiplet FPGA

| 概念 | 說明 |
|------|------|
| **Multi-die FPGA** | 多晶粒 FPGA |
| **Die-to-Die NoC** | 跨晶粒互連 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 9.3
- M. K. Papamichael and J. C. Hoe, "CONNECT: Re-examining Conventional Wisdom for Designing NoCs in the Context of FPGAs," FPGA 2012

