# 相關工具

## 模擬器

### BookSim 2.0

Stanford 開發的 Cycle-accurate NoC 模擬器。

**功能**：
- 支援多種 Topology
- 可配置的 Router 參數
- 多種 Traffic Pattern

**安裝**：
```bash
git clone https://github.com/booksim/booksim2.git
cd booksim2/src
make
```

**使用**：
```bash
./booksim config_file
```

### Garnet (gem5)

gem5 全系統模擬器中的 NoC 模型。

**特點**：
- 與 CPU、Memory 整合
- 真實應用 Traffic
- Cycle-accurate

**網站**：https://www.gem5.org/

### Noxim

SystemC-based NoC 模擬器。

**網站**：https://github.com/davidepatti/noxim

## RTL 生成器

### OpenSMART

自動生成 NoC RTL 的工具。

**產出**：
- SystemVerilog RTL
- 可配置的參數

**網站**：https://github.com/smart-pim/OpenSMART

### Chisel

Scala-based 硬體描述語言，適合參數化設計。

```scala
class Router(p: Parameters) extends Module {
  val io = IO(new RouterBundle(p))
  // ...
}
```

## 功耗與面積估算

### Orion

NoC 專用功耗模型。

**估算項目**：
- Buffer 功耗
- Crossbar 功耗
- Link 功耗

### McPAT

系統級功耗分析工具。

**網站**：https://github.com/HewlettPackard/mcpat

## 開源 NoC 實作

### OpenPiton

Princeton 的開源多核處理器，包含完整 NoC。

**特點**：
- 可擴展的 Mesh
- 完整 RTL
- FPGA 可實作

**網站**：https://parallel.princeton.edu/openpiton/

### LioNMoC

可配置的 NoC 生成器。

## EDA 工具

### Synopsys Design Compiler
邏輯合成工具。

### Cadence Innovus
Place & Route 工具。

### Synopsys PrimeTime
時序分析工具。

## 除錯與視覺化

### GTKWave
開源波形檢視器。

```bash
gtkwave dump.vcd
```

### Verdi
Synopsys 的 Debug 工具。

## 學習資源

### 線上課程

- MIT OpenCourseWare: Computer System Architecture
- Coursera: Computer Architecture

### 書籍

- "Computer Architecture: A Quantitative Approach" - Hennessy & Patterson
- "On-Chip Networks, Second Edition" - Jerger, Krishna, Peh
