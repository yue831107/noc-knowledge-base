# Heterogeneous SoC 中的 NoC

現代 SoC 整合了多種不同類型的處理單元和加速器，形成**異構系統**。為這些多樣化元件提供高效互連是 NoC 設計的重大挑戰。

## 異構 SoC 架構

### 典型組成

現代異構 SoC 包含多種處理單元：

| 單元類型 | 功能 | 特點 |
|----------|------|------|
| **CPU** | 通用計算、OS | 低延遲、控制導向 |
| **GPU** | 圖形、並行計算 | 高吞吐、資料平行 |
| **NPU/AI** | 神經網路推理 | 矩陣運算、能效 |
| **DSP** | 訊號處理 | 低功耗、即時 |
| **ISP** | 影像處理 | Streaming、低延遲 |
| **VPU** | 影片編解碼 | 高頻寬 |

### 代表性產品

| 產品 | 組成 |
|------|------|
| **Apple M-series** | CPU + GPU + Neural Engine |
| **Qualcomm Snapdragon** | CPU + GPU + Hexagon DSP + NPU |
| **NVIDIA Orin** | CPU + GPU + DLA + PVA |
| **AMD APU** | CPU + GPU |

## NoC 設計挑戰

### 不同的流量特性

各類處理單元有不同的通訊需求：

| 單元 | Packet 大小 | 頻寬需求 | 延遲敏感度 |
|------|-------------|----------|------------|
| CPU | 小（64B） | 中 | 高 |
| GPU | 大（128B+） | 極高 | 中 |
| NPU | 大 | 高 | 中 |
| ISP | 中-大 | 高 | 高（即時） |
| DSP | 小-中 | 中 | 高 |

### 不同的介面協定

| 協定 | 用途 | 特點 |
|------|------|------|
| **AXI** | 通用 | 支援亂序 |
| **ACE/CHI** | Coherent | Cache 一致性 |
| **AHB** | 簡單周邊 | 低開銷 |
| **專用** | 加速器 | 優化特定用途 |

### QoS 需求

| 需求 | 說明 |
|------|------|
| **頻寬保證** | 確保最低頻寬 |
| **延遲限制** | 最大延遲約束 |
| **優先級** | 關鍵流量優先 |
| **隔離** | 防止互相干擾 |

## 互連架構選擇

### 階層式設計

多層次的互連結構：

| 層級 | 連接 | 特點 |
|------|------|------|
| **Cluster 內** | 同類核心 | 低延遲、高頻寬 |
| **Cluster 間** | 不同 Cluster | 中等延遲 |
| **全域** | Memory、I/O | 高頻寬 |

### 專用子網路

為特定流量設計專用網路：

| 子網路 | 用途 | 優化目標 |
|--------|------|----------|
| **Coherent** | CPU Cache 一致性 | 延遲 |
| **Non-coherent** | 加速器資料 | 頻寬 |
| **Control** | 配置、中斷 | 可靠性 |
| **Debug** | 除錯存取 | 不影響主網路 |

### 混合 Topology

不同區域使用不同 Topology：

| 區域 | Topology | 原因 |
|------|----------|------|
| CPU Cluster | Crossbar | 低延遲 |
| GPU | 階層 Ring | 高頻寬 |
| 全域 | Mesh | 擴展性 |

## Cache Coherence 考量

### 異構 Coherence 挑戰

| 挑戰 | 說明 |
|------|------|
| **不同 Cache 結構** | CPU 和 GPU Cache 不同 |
| **不同一致性需求** | 加速器可能不需要完整 Coherence |
| **功耗** | Snoop 流量增加功耗 |

### Coherence 策略

| 策略 | 適用 | 特點 |
|------|------|------|
| **Full Coherence** | CPU Cluster | 標準協定 |
| **I/O Coherence** | 加速器 | 單向一致性 |
| **Non-coherent** | Streaming | 軟體管理 |

### 商業解決方案

| 方案 | 開發者 | 特點 |
|------|--------|------|
| **CCI/CCN/CMN** | ARM | 完整 Coherence |
| **CCIX** | 聯盟 | Chip-to-chip |
| **CXL** | 聯盟 | 記憶體擴展 |

## QoS 設計

### 頻寬管理

| 機制 | 功能 |
|------|------|
| **Rate Limiter** | 限制注入率 |
| **頻寬分配** | 固定或動態分配 |
| **Credit 控制** | 限制進入網路 |

### 優先級機制

| 機制 | 說明 |
|------|------|
| **Static Priority** | 固定優先級 |
| **Weighted Round-robin** | 加權輪替 |
| **Virtual Channel** | VC 優先級 |
| **Age-based** | 等待時間優先 |

### 延遲保證

| 機制 | 說明 |
|------|------|
| **預留路徑** | 專用路徑 |
| **虛擬電路** | VC 隔離 |
| **TDM** | 時分多工 |

## 加速器 NoC 設計

### AI/ML 加速器特點

| 特點 | NoC 需求 |
|------|----------|
| **資料重用** | Multicast 支援 |
| **Weight 分發** | Broadcast 效率 |
| **Partial Sum** | 歸約網路 |
| **高頻寬** | 寬 Flit、深 Buffer |

### Dataflow 感知 NoC

| 技術 | 說明 |
|------|------|
| **Multicast** | 一對多傳輸 |
| **Reduction** | 累加操作 |
| **Systolic** | 脈動陣列連接 |

### 範例：Eyeriss NoC

| 特點 | 設計 |
|------|------|
| **Global Network** | Weight/Activation 分發 |
| **Local Network** | PE 間 Partial Sum |
| **Row-stationary** | 資料重用優化 |

## 記憶體子系統整合

### 多種記憶體

| 類型 | 特點 | 連接方式 |
|------|------|----------|
| **LPDDR** | 低功耗 | Memory Controller |
| **HBM** | 高頻寬 | Interposer NoC |
| **SRAM** | 低延遲 | 直接連接 |

### 記憶體一致性

| 層級 | 一致性 |
|------|--------|
| L1 Cache | 完整 Coherence |
| L2 Cache | Cluster 內 Coherence |
| Last Level | Directory-based |
| Memory | 無（由 LLC 保證） |

## 設計方法論

### 需求分析

1. **識別流量類型**
   - 控制 vs 資料
   - Coherent vs Non-coherent

2. **量化需求**
   - 頻寬要求
   - 延遲約束
   - QoS 等級

3. **選擇架構**
   - 單一 vs 多網路
   - Topology 選擇

### 驗證

| 階段 | 方法 |
|------|------|
| **架構探索** | 高層次模擬 |
| **RTL 驗證** | Cycle-accurate 模擬 |
| **FPGA 原型** | 硬體驗證 |
| **矽後測試** | 效能測量 |

## 商業 NoC IP

### 主要供應商

| 供應商 | 產品 | 特點 |
|--------|------|------|
| **ARM** | CoreLink | 完整解決方案 |
| **Arteris** | FlexNoC | 高度可配置 |
| **Synopsys** | AXI IP | 介面 IP |

### 選擇考量

| 考量 | 說明 |
|------|------|
| **靈活性** | 是否可配置 |
| **效能** | 頻寬、延遲 |
| **整合** | 與 EDA 工具整合 |
| **支援** | 技術支援品質 |

## 未來趨勢

### Chiplet 異構

| 趨勢 | 說明 |
|------|------|
| **多 Die** | 不同功能 Chiplet |
| **跨 Die NoC** | UCIe、Infinity Fabric |
| **異構整合** | 不同製程混合 |

### 智慧化 NoC

| 技術 | 應用 |
|------|------|
| **ML 路由** | 動態路徑選擇 |
| **負載預測** | 主動擁塞控制 |
| **自適應 QoS** | 動態優先級調整 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 9.4
- J. Cong et al., "Accelerator-rich Architectures: Opportunities and Progresses," DAC 2014

