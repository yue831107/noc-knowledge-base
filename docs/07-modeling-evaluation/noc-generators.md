# NoC Generators

**NoC Generator** 是自動產生 On-chip Network RTL 或模型的工具。這些工具允許設計者快速探索設計空間，並產生可合成的硬體描述。

## 商業 NoC Generator

商業 NoC Generator 提供經過驗證的、可量產的 NoC IP，通常包含完整的設計流程支援。

### ARM CoreLink

**ARM CoreLink** 系列互連 IP：

| 產品 | 特點 | 目標應用 |
|------|------|----------|
| **CCI** (Cache Coherent Interconnect) | 全 Coherent | 行動 SoC |
| **CCN** (Cache Coherent Network) | Mesh Topology | 伺服器、HPC |
| **CMN** (Coherent Mesh Network) | 最新一代 | 高效能運算 |
| **NIC** (Network Interconnect) | Non-coherent | I/O 子系統 |

**特點**：
- 與 ARM Core 深度整合
- 支援 AMBA ACE/CHI Protocol
- 包含 Power Management
- 提供 Performance Monitor

### Arteris FlexNoC

**Arteris FlexNoC** 是 ASIC 市場的領導者之一：

| 功能 | 說明 |
|------|------|
| **Topology** | 可配置任意 Topology |
| **Protocol** | 支援 AMBA、OCP |
| **QoS** | 頻寬和延遲保證 |
| **Power** | 自動 Clock Gating |

**設計流程**：
1. 使用 GUI 或腳本定義 Topology
2. 配置 QoS 參數
3. 產生 RTL 和驗證環境
4. 整合到 SoC 設計流程

### Sonics (現為 Meta)

**Sonics** 提供多種 NoC 產品：

| 產品 | 用途 |
|------|------|
| **SonicsGN** | 通用 NoC |
| **SonicsMX** | 混合記憶體存取 |
| **SonicsLV** | 低功耗 |

### NetSpeed (現為 Intel)

**NetSpeed Orion** 特點：

- AI-driven 設計空間探索
- 自動 Topology 優化
- 支援 Chiplet 互連
- 物理感知合成

## 學術 NoC Generator

學術 NoC Generator 通常開源，適合研究和教學。

### OpenSMART

**OpenSMART** 由 Stanford 開發：

| 特性 | 說明 |
|------|------|
| **語言** | Bluespec SystemVerilog (BSV)、Chisel |
| **授權** | BSD |
| **特點** | 可合成、參數化 |

**支援的配置**：
- Topology：Mesh、Ring、Custom
- Flow Control：Credit-based、VC
- Routing：Dimension-ordered、Adaptive
- Router Pipeline：1-5 Cycle

### OpenSoC Fabric

**OpenSoC Fabric** 使用 Chisel 實作：

| 特性 | 說明 |
|------|------|
| **語言** | Chisel (Scala) |
| **輸出** | Verilog RTL |
| **特點** | 與 Rocket Chip 整合 |

```scala
// OpenSoC 配置範例
val config = new NetworkConfig {
  val topology = Mesh(4, 4)
  val vcCount = 4
  val flitWidth = 128
  val bufferDepth = 8
}
```

### CONNECT

**CONNECT** 由 Princeton 開發，專注於 FPGA 實作：

| 特性 | 說明 |
|------|------|
| **語言** | Bluespec SystemVerilog |
| **目標** | FPGA Emulation |
| **特點** | 高效 FPGA 映射 |

**優化技術**：
- FPGA-specific Router Architecture
- BRAM-based Buffer
- Distributed Arbitration

### OpenPiton

**OpenPiton** 是 Princeton 的開源 Manycore 處理器：

| 特性 | 說明 |
|------|------|
| **Core** | OpenSPARC T1 |
| **NoC** | 3 個獨立 Network |
| **規模** | 可擴展到 8000+ Core |

**網路配置**：
- NoC 1：Coherence Request
- NoC 2：Coherence Response
- NoC 3：Memory and I/O

### xpipes

**xpipes** 由 Bologna 大學開發：

| 特性 | 說明 |
|------|------|
| **語言** | SystemC (模擬)、VHDL (合成) |
| **特點** | 支援異質 Master/Slave |
| **協定** | OCP-based |

### DRNoC

**DRNoC** (Dynamic Reconfigurable NoC)：

| 特性 | 說明 |
|------|------|
| **目標** | FPGA 動態重配置 |
| **特點** | 支援 Runtime Topology 變更 |

### NoCGEN

**NoCGEN** 產生 VHDL RTL：

| 特性 | 說明 |
|------|------|
| **語言** | VHDL |
| **配置** | XML-based |
| **特點** | 簡單易用 |

## 生成器比較

| Generator | 語言 | 開源 | FPGA | ASIC | 特點 |
|-----------|------|------|------|------|------|
| ARM CoreLink | - | 否 | 否 | 是 | 商業、整合 |
| Arteris FlexNoC | - | 否 | 否 | 是 | 商業、靈活 |
| OpenSMART | BSV/Chisel | 是 | 是 | 是 | 參數化 |
| OpenSoC | Chisel | 是 | 是 | 是 | Rocket 整合 |
| CONNECT | BSV | 是 | 是 | 否 | FPGA 優化 |
| OpenPiton | Verilog | 是 | 是 | 是 | 完整處理器 |

## 生成流程

### 典型流程

1. **配置輸入**
   - Topology 規格
   - Buffer/VC 參數
   - 協定選擇
   - 時序約束

2. **產生輸出**
   - RTL（Verilog/VHDL）
   - 測試環境
   - 合成腳本
   - 文件

3. **驗證整合**
   - 連接 Testbench
   - 執行回歸測試
   - 功耗/面積估算

### 配置參數

| 參數類別 | 選項 |
|----------|------|
| **Topology** | Mesh、Torus、Ring、Tree、Custom |
| **Data Width** | 32、64、128、256 bits |
| **VC Count** | 1-16 |
| **Buffer Depth** | 2-64 flits |
| **Routing** | Dimension-ordered、Adaptive、Source |
| **Flow Control** | Credit、Wormhole、VC |
| **Arbitration** | Round-robin、Priority、Weighted |

## 選擇指南

### 研究用途

| 需求 | 推薦 |
|------|------|
| 快速原型 | OpenSMART、OpenSoC |
| FPGA 驗證 | CONNECT |
| 完整系統 | OpenPiton |
| 靈活配置 | OpenSMART |

### 產品用途

| 需求 | 推薦 |
|------|------|
| ARM-based SoC | ARM CoreLink |
| 通用 ASIC | Arteris FlexNoC |
| 高效能運算 | NetSpeed Orion |
| 自動優化 | Arteris、NetSpeed |

## 自建 vs 使用 Generator

| 考量 | 自建 | 使用 Generator |
|------|------|----------------|
| **開發時間** | 長 | 短 |
| **可維護性** | 依團隊 | 依工具 |
| **優化程度** | 可高度優化 | 通用優化 |
| **學習曲線** | 需 NoC 專業 | 需學習工具 |
| **成本** | 人力成本 | 授權費用 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 7.5

