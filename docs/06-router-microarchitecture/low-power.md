# Low-power Microarchitecture

功耗自 1990 年代以來一直是嵌入式和高效能晶片的挑戰。自 2000 年代中期以來，它已成為大多數設計的主要約束。Multicore 是功耗問題的答案，而由此產生的通訊基礎設施（On-chip Network）在今天的 Multicore 總功耗中扮演活躍角色——包括 Dynamic 和 Leakage。

## 功耗分佈

![Figure 6.18: 32nm 單 Cycle Mesh Router 的功耗和面積](/images/ch06/Figure%206.18.jpg)

Figure 6.18a 繪製了具有 4 個 VC 的最先進 Mesh Router 的功耗分佈（32nm 晶片量測數據）：

### 低負載時

| 元件 | Dynamic | Static |
|------|---------|--------|
| Input VCs | 主要來自時脈 Latch | 高 |
| Crossbar | 低 | 中 |
| Links | 低 | 中 |
| Switch Allocator | 低 | 低 |
| Other | 低 | 低 |

低負載時，Buffer 和其他狀態（VC 和 Credit）的 Dynamic 功耗主要來自 **時脈 Latch**，而非實際流量。

### 高負載時（飽和）

- **Buffer**：貢獻 55% 的 Dynamic 功耗
- **Crossbar 和 Links**：貢獻 34%
- **Static 功耗**：佔低負載總功耗的 75%，高負載時仍佔 53%

## Dynamic Power 優化

Dynamic 功耗方程式：

$$
P = \alpha C V^2 f
$$

- $\alpha$：活動因子（Activity Factor）
- $C$：被切換的電容
- $V$：操作電壓
- $f$：操作頻率

減少功耗有兩類技術：
1. **動態降低 V 和 f**（DVFS）
2. **降低 α 和 C**

### DVFS (Dynamic Voltage and Frequency Scaling)

**DVFS** 是減少數位電路功耗最普遍的設計技術：

- 流量較少的 Router 可以在較低的電壓-頻率狀態下運行
- 不影響整體效能

#### On-chip Network DVFS 的挑戰

1. **多電壓-頻率島**：
   - 需要在每對不同電壓-頻率島的介面使用 **Bi-synchronous FIFO**
   - 會產生額外延遲

2. **多電源供應線**：
   - 大多數現有方案假設使用多個供應線存取不同電壓
   - 使用多個電壓軌需要晶片外的多個電壓轉換器
   - 以及多個電源分配網路的面積開銷
   - 高頻寬整合電壓調節器可以緩解這個問題（允許快速 < 50ns 電壓轉換）

#### DVFS 政策考量

由於與 Tile/Core 相關的 On-chip Network 不僅服務該 Core 注入的 Flit，還服務來自不同 Core 的 Flit，On-chip Network Fabric 的 DVFS 政策必須與 Core 的 DVFS 政策不同處理。

現有文獻使用靜態網路參數（如平均 Queue 利用率、記憶體請求的平均返回時間等）來決定 Router 的新電壓-頻率狀態。

### Power-Efficient 設計

第二類技術試圖透過 **降低電容或切換活動** 來減少功耗。

#### 降低有效電容

On-chip Network 的 Dynamic 功耗可以透過降低被切換的有效電容來減少：

- **Wire 主導網路功耗**：Wire 電容遠大於 Gate 電容
- **Low-swing Signaling**：降低訊號擺幅
- **Equalized Links**：使用等化 Link
- **減少 Pipeline 階段**：減少 Register 數量
- **優化 Buffer、Crossbar、Arbiter**：
  - SRAM 比 Flip-flop 和 Register File 更節能
  - Matrix-style Crossbar 通常比 Mux-based Crossbar 更有效
  - Crossbar 可以分段或使用 Low-swing Link 設計
  - 複雜 Arbiter 可以拆分為多個簡單 Arbiter

#### 降低切換活動

降低切換活動是另一種減少 Dynamic 功耗的技術：

- **Clock Gating**：減少非活動電路的 Latch 切換活動
- Figure 6.18a 低負載時的 Dynamic 功耗主要來自時脈，提供減少功耗的機會
- **高效編碼**：利用 Router 之間發送的 Bit 編碼減少 Bit Toggle

## Leakage Power 優化

在 Sub-nm 技術下，Transistor 不再是理想開關，即使「關閉」時也會漏電。這導致低活動或無活動期間的高功耗。

### Leakage 功耗來源

On-chip Network 的 Leakage 功耗已被證明對現代技術的總功耗有顯著貢獻。原因是用於實作 Buffer、輸入 VC 狀態和輸出 Credit 狀態的大量 **Latch/Flip-flop/SRAM**。

### Power Gating

**Power Gating** 是當今晶片普遍使用的技術來減輕 Leakage 功耗。

#### Power Gating 的挑戰

1. **Power Domain 粒度**：
   - 候選：Router 中的各種模組、每個 Router、整個 On-chip Network
   - 細粒度最有效但不實際（需要數百個模組的 Power Gating 電路）
   - 大多數商業晶片將整個 On-chip Network 視為一個 Power Domain

2. **決定開關哪些 Router**：
   - 如果連接 Router 的 Tile 是活躍的，Router 需要非常頻繁地喚醒
   - 增加大量延遲開銷
   - 關閉某些 Router 可能導致關鍵 IP Block（如記憶體控制器）無法存取

3. **Irregular Topology 的 Deadlock**：
   - 關閉某些 Router 會使底層 Topology 變得不規則
   - 這可能導致 Routing Deadlock
   - 某些路徑變得無法存取，迫使 Flit 使用其他路徑造成循環依賴
   - 需要額外支援（如 Deadlock-free Up/Down Routing）

## 面積分佈

Figure 6.18b 繪製了相同 Router 的面積分佈：

| 元件 | 面積佔比 |
|------|----------|
| Input VCs (Buffer) | ~70% |
| Crossbar | ~20% |
| Switch Allocator | ~5% |
| Other | ~5% |

Buffer 和 Crossbar 貢獻超過 **90%** 的面積。

## 設計建議

| 技術 | 目標 | Trade-off |
|------|------|-----------|
| DVFS | Dynamic Power | 需要多電壓域、FIFO |
| Clock Gating | Dynamic Power | 控制邏輯開銷 |
| Low-swing Signaling | Dynamic Power | 需要放大器 |
| Power Gating | Leakage Power | 喚醒延遲、Routing 複雜性 |
| Buffer Bypassing | Dynamic Power | 需要投機邏輯 |
| Crossbar Slicing | Area/Power | 只適用於特定 Routing |

## 參考資料

- On-Chip Networks Second Edition, Chapter 6.6
