# Conclusions

本章總結 On-chip Network 的發展趨勢、新興技術和未來研究方向。隨著 Moore's Law 放緩和應用需求的多樣化，NoC 設計面臨新的挑戰和機會。

## 本章內容

| 主題 | 說明 |
|------|------|
| [Beyond Conventional](./beyond-conventional) | 光互連、無線 NoC、3D 堆疊 |
| [Resilient NoC](./resilient-noc) | 可靠性設計、容錯機制 |
| [FPGA NoC](./fpga-noc) | FPGA 中的 Soft/Hard NoC |
| [Heterogeneous SoC](./heterogeneous-soc) | 異構系統中的 NoC 設計 |

## NoC 技術演進總結

### 從 Bus 到 Network

| 時期 | 主流互連 | 核心數 | 代表系統 |
|------|----------|--------|----------|
| 1990s | 共享 Bus | 1-4 | 早期 SMP |
| 2000s | Crossbar | 4-16 | Sun Niagara |
| 2010s | 2D Mesh | 8-72 | [Intel Xeon Phi](/08-case-studies/intel-xeon-phi) |
| 2020s | 階層式/異構 | 100+ | AMD Chiplets |

### 關鍵里程碑

| 年份 | 事件 | 意義 |
|------|------|------|
| 2002 | MIT RAW 晶片 | 首個學術 NoC 處理器 |
| 2005 | [IBM Cell](/08-case-studies/ibm-cell) | 商用異構 NoC |
| 2007 | [Intel TeraFLOPS](/08-case-studies/intel-teraflops) | 80 核 2D Mesh 驗證 |
| 2008 | [Tilera TILEPRO64](/08-case-studies/tilera) | 商用 64 核 NoC |
| 2015 | Intel Xeon Phi KNL | 商用大規模 Mesh |

## 設計趨勢

### 1. Chiplet 和 Die-to-Die 互連

隨著單一晶片擴展的限制，Chiplet 架構成為主流：

| 技術 | 說明 |
|------|------|
| **UCIe** | Universal Chiplet Interconnect Express |
| **EMIB** | Intel Embedded Multi-die Interconnect Bridge |
| **Infinity Fabric** | AMD 的 Chiplet 互連 |

→ 詳見 [Beyond Conventional](./beyond-conventional)

### 2. 專用加速器 NoC

針對特定工作負載優化的網路：

| 應用 | NoC 特點 | 案例 |
|------|----------|------|
| AI/ML | Multicast、資料重用 | [MIT Eyeriss](/08-case-studies/mit-eyeriss) |
| 圖形處理 | 高頻寬、Streaming | GPU NoC |
| 網路處理 | 低延遲、確定性 | NPU NoC |

→ 詳見 [Heterogeneous SoC](./heterogeneous-soc)

### 3. 能效優化

功耗已成為首要設計約束：

| 技術 | 節能效果 |
|------|----------|
| Near-threshold | 顯著降低動態功耗 |
| Power Gating | 減少 Leakage |
| DVFS | 動態功耗管理 |

→ 詳見 [Low-power 技術](/06-router-microarchitecture/low-power)

## 未來研究方向

### 近期（2-5 年）

| 方向 | 挑戰 |
|------|------|
| Chiplet NoC | 延遲、頻寬、功耗 |
| AI 加速器 NoC | Dataflow 優化 |
| 安全 NoC | 側信道防護 |

### 中期（5-10 年）

| 方向 | 挑戰 |
|------|------|
| 光互連 | 整合成本 |
| 3D 堆疊 | 散熱、TSV 密度 |
| 近記憶體運算 | 程式設計模型 |

### 長期（10+ 年）

| 方向 | 挑戰 |
|------|------|
| 量子互連 | 量子位元傳輸 |
| 神經形態 NoC | 仿生通訊 |
| 分子通訊 | 極小尺度互連 |

## 設計原則總結

### 永恆的權衡

| 權衡 | 考量 |
|------|------|
| 效能 vs 功耗 | 選擇適當的操作點 |
| 延遲 vs 吞吐量 | 根據應用需求 |
| 面積 vs 功能 | Buffer、VC 數量 |
| 複雜度 vs 可靠性 | 簡單更容易驗證 |

### 最佳實踐

1. **理解工作負載**
   - 分析通訊模式（參見 [Traffic Patterns](/07-modeling-evaluation/traffic-patterns)）
   - 識別效能瓶頸

2. **選擇適當 Topology**
   - 根據規模和需求（參見 [Topology](/03-topology/)）
   - 考慮物理實現

3. **平衡設計目標**
   - 效能、功耗、面積
   - 可靠性、可測試性

4. **迭代驗證**
   - 早期模擬評估（參見 [Modeling Infrastructure](/07-modeling-evaluation/modeling-infra)）
   - 逐步細化設計

## 學習建議

### 基礎知識

| 主題 | 重要性 |
|------|--------|
| 計算機架構 | 核心 |
| VLSI 設計 | 核心 |
| 排隊理論 | 重要 |
| 圖論 | 有幫助 |

### 實踐技能

| 技能 | 工具 |
|------|------|
| RTL 設計 | Verilog/VHDL |
| 模擬 | gem5/BookSim（參見 [相關工具](/appendix/tools)） |
| 功耗分析 | DSENT/McPAT |

### 進階主題

| 主題 | 方向 |
|------|------|
| 機器學習應用 | 自動化設計探索 |
| 形式驗證 | [Deadlock Freedom](/04-routing/deadlock-avoidance) |
| 新興技術 | 光互連、3D |

## 總結

On-chip Network 已從研究概念發展成為現代處理器的核心組件。本書涵蓋的基本原理——[Topology](/03-topology/)、[Routing](/04-routing/)、[Flow Control](/05-flow-control/)、[Router Microarchitecture](/06-router-microarchitecture/)——將持續適用於未來的設計。

隨著技術演進，新的挑戰將出現，但基本的設計方法論和權衡考量將保持不變。理解這些基礎知識，是應對未來挑戰的關鍵。

## 參考資料

- On-Chip Networks Second Edition, Chapter 9
