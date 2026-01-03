# Irregular Topologies

## 為什麼需要 Irregular Topology

MPSoC 設計可能利用各種異構 IP Block。由於這種異構性，像 Mesh 或 Torus 這樣的規則 Topology 可能並不適合。對於這些異構核心，客製化的 Topology 通常更節能並能提供比標準 Topology 更好的效能。

### 適用場景

- **異構系統**：不同大小的 IP Block
- **已知通訊模式**：通訊需求在設計時已知（*a priori*）
- **特定應用**：MPSoC 的通訊模式是結構化的

## 客製化 Topology 範例

![Figure 3.7: A regular (mesh) topology and a custom topology for a video object plane decoder (VOPD)](/images/ch03/Figure%203.7.jpg)

### VOPD（Video Object Plane Decoder）案例

以 Figure 3.7 為例，MPSoC 由 12 個異構 IP Block 組成：

**Mesh Topology (Figure 3.7a)**：
- 需要 12 個 Router (R)
- 每個 Switch 需要 5 個 Input/Output Port（四個基數方向 + Injection/Ejection Port）
- 5 × 5 Crossbar

**Custom Topology (Figure 3.7b)**：
- 僅需 5 個 Switch（從 12 個減少到 5 個）
- 顯著節省功耗和面積
- 某些 Block 可以直接連接（如 VLD 和 Run Length Decoder）
- 最大的 Switch 只需要 4 × 4
- 不是每個 Router 的 Link 輸入和輸出之間都需要連接

## Application Characterization Graph

基於結構化通訊模式，可以建構一個 **Application Characterization Graph** 來捕捉 IP Block 的點對點通訊需求。

要開始建構所需的 Topology，必須確定：
1. 元件數量
2. 元件大小
3. 通訊模式所決定的所需連接性

## Topology 合成方法

### Splitting（分割）

從一個連接所有 Node 的大型 Crossbar 開始，然後迭代地分割成較小的 Switch 以滿足一組設計約束。

**分割流程**：
1. 建立一個大型全連接 Switch（Crossbar）
2. 這個大型 Crossbar 可能違反設計約束
3. 迭代地分割成較小的 Switch 直到滿足約束
4. 當 Switch 被分割成兩個較小的 Switch 時，它們之間的頻寬必須滿足必須在分區之間流動的通訊量
5. Node 可以在分區之間移動以優化 Switch 之間的通訊量

### Merging（合併）

從大量的 Switch（如 Mesh 或 Torus）開始，將它們合併以減少功耗和面積。

**合併流程**：
1. 首先進行各種 MPSoC 元件的 Floorplanning
2. 基於 Application Characterization Graph 進行 Floorplanning（高通訊量的 Node 應放置在一起）
3. Router 放置在每個 Channel 交叉點
4. 如果不違反頻寬或效能約束，且有合併的好處（如降低功耗），則合併相鄰的 Router

## Topology Synthesis Algorithm 範例

![Figure 3.8: Topology synthesis algorithm example](/images/ch03/Figure%203.8.jpg)

Topology 合成和映射是一個 **NP-hard 問題**。Figure 3.8 展示了一個來自 Murali et al. 的 Application-specific Topology Synthesis Algorithm 範例。

### 演算法步驟

這個演算法是一個 **Splitting Algorithm** 的範例：

1. **輸入**：Application Communication Graph（Figure 3.8a），顯示各種應用任務之間所需的頻寬

2. **合成不同 Topology**：從所有 IP Core 透過一個大型 Switch 連接，到每個 Core 有自己的 Switch 的另一個極端

3. **對於給定的 Switch 數量 i**：
   - 輸入圖被分割成 i 個 **Min-cut Partition**
   - Figure 3.8b 顯示 i = 3 的 Min-cut Partition
   - Min-cut Partition 使跨越分區的邊具有比分區內的邊更低的權重
   - 每個分區分配的 Node 數量保持大致相同

4. **確定路由**：必須限制路由以避免 Deadlock

5. **建立實體 Link**：必須找到所有流量流的路徑

6. **確定 Switch 大小和連接性**

7. **評估設計**：檢查功耗和 Hop Count 目標是否滿足

8. **Floorplan**：確定合成設計的面積和 Wire 長度

## 挑戰

::: warning Routing 複雜度
Irregular Topology 的 Routing 比規則 Topology 複雜得多，通常需要：
- **Table-based Routing**：使用查找表決定路由
- **Source Routing**：在 Source 端計算完整路徑
- **特殊的 Deadlock Avoidance 機制**：不規則結構需要額外的 Deadlock 避免技術
:::

## 設計權衡

| 方面 | Regular Topology | Irregular Topology |
|------|------------------|-------------------|
| 設計複雜度 | 低 | 高 |
| 功耗 | 可能較高 | 可優化到較低 |
| 面積 | 可能較大 | 可優化到較小 |
| 可重用性 | 高 | 低（Application-specific） |
| Routing 複雜度 | 低 | 高 |
| 驗證難度 | 低 | 高 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 3.4
