# On-chip Network Modeling Infrastructure

有多種 On-chip Network Modeling 基礎設施可供電腦架構和 NoC 研究人員使用，用於研究新穎的 Network Topology、Routing Algorithm、Flow Control 方法、Router Microarchitecture 和新興的 Link 技術。

## RTL 與 Software Models

### RTL Simulation

使用 Cadence/Synopsys/MentorGraphics 工具進行 RTL 模擬提供：

- **最準確的網路實作**
- **最準確的 Cycle-accurate Timing 資訊**
- On-chip Network RTL 既是模型也是最終設計
- 這是業界常見的設計空間探索方法

### FPGA Emulation

現代 FPGA 增加的 On-chip Logic 和 Memory 容量允許整個 On-chip System 在單一設備上實現：

- 與 Software 相比，FPGA-based On-chip Network Emulator 可將模擬時間**減少數個數量級**
- 這些戲劇性的加速是可能的，因為 Emulator 是通過在 FPGA 上佈置整個 On-chip Network 來構建的
- 允許硬體利用 On-chip Network 中 Emulated 事件之間的所有可用 Fine 和 Coarse Grain Parallelism

### Software Simulators

當 On-chip Network 的端點（即 Multicore System）也被納入時，在 RTL 中模擬整個系統變得高度困難。因此，Software（如 C++）模擬器被廣泛用於：

- **Network Design** 的設計空間探索
- 與 Memory Sub-system 其餘部分的 **Co-design**

Topology、Routing Algorithm、Flow Control 和 Router Microarchitecture 可以以不同程度的細節建模，權衡精確度和模擬時間。

::: warning 注意
不建議在大型 Multicore 模擬中「簡化」網路模型，因為 On-chip Network Latency 和 Bandwidth 可能直接影響整個分散式 CMP/MPSoC 的效能，只能通過對網路內部進行 Cycle-by-cycle 競爭建模來捕捉。
:::

## Power 與 Area Models

功耗是當今系統的一級設計約束。On-chip Network 功耗的早期估算對於在各種子系統之間分配功耗和面積預算至關重要。

### RTL-based 估算

Router 的 RTL 模型可以被合成、佈置和佈線以獲得準確的面積估算。產生的 Netlist 可以從 RTL 模擬中反標活動因子以提供準確的功耗估算。

然而，這種嚴格的方法在建模包含 Core、Cache 和 On-chip Network 的完整 CMP 時通常變得複雜甚至不可行。原因包括：

- 每個元件的 RTL 不可用
- 無法存取先進節點的標準單元
- 模擬速度

### DSENT

**DSENT** 是一個 Timing-driven On-chip Network Area 和 Power Modeling 工具，適用於 Electrical 和 Optical On-chip Network。

- 提供 Technology-portable 的標準單元集合
- 可從中構建更大的電氣元件（如 Router Buffer、Arbiter、Crossbar 和 Link）
- 給定 Foundry 的 PDK 和設計的頻率約束，DSENT 應用：
  1. **Timing Optimization** 來調整 Gate 大小以達到 Energy-optimality
  2. **Expected Transition Propagation** 來準確估算功耗

DSENT 可作為獨立工具下載，也作為 gem5 的一部分發布。它取代了舊的 **Orion 2.0** 模型。

### McPAT

**McPAT** 是一個整合的 Power、Area 和 Timing Modeling 工具，用於 Multicore，建模處理器、Cache 和 Interconnect 的功耗。它針對 180nm、90nm 和 65nm 的已發表晶片進行了驗證，並使用 DSENT 進行 On-chip Network Power 模型。

## State-of-the-art Simulators

![Table 7.3: State-of-the-art On-chip Network Simulators](/images/ch07/Table%207.3.jpg)

Table 7.3 列出了一些提供 Cycle-accurate On-chip Network 模擬的 State-of-the-art Framework。

### Standalone Simulators

| Simulator | Language | 特點 |
|-----------|----------|------|
| **Garnet** | C++ | gem5 Full-System 整合 |
| **BookSim2** | C++ | gpgpusim Full-System 整合 |
| **Topaz** | C++ | Standalone |
| **Flexsim1.2** | C++ | Standalone |
| **SuperSim** | C++ | Standalone |
| **NOCulator** | C++ | Standalone |

### RTL-based Simulators

| Simulator | Language | 特點 |
|-----------|----------|------|
| **OpenSMART** | BSV, Chisel | Standalone |
| **OpenSoC** | Chisel | Standalone |
| **CONNECT** | BSV | FPGA 優化 |
| **NoCem** | VHDL | FPGA 優化 |
| **NoCGEN** | VHDL | Standalone |
| **DART** | Verilog | Standalone |

### Full-System vs Network-only

- 有些 Full-System Simulator（如 SESC、zsim）不以 Cycle-accurate 方式建模 On-chip Network，而是使用固定或機率性延遲以提高模擬速度
- 除了 Simulator 之外，也設計了用於各種 Topology 和 Microarchitecture 的 On-chip Network 效能分析模型

## 模擬層級比較

| 層級 | 精確度 | 速度 | 用途 |
|------|--------|------|------|
| RTL Simulation | 最高 | 最慢 | 最終驗證、Tape-out |
| FPGA Emulation | 高 | 快 | 大規模系統驗證 |
| Cycle-accurate SW | 中 | 中 | 架構探索 |
| Functional | 低 | 快 | 早期評估 |
| Analytical | 最低 | 最快 | 快速估算 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 7.2, 7.6
