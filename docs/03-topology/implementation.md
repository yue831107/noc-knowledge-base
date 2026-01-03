# Topology 實作考量

本節討論 Topology 在晶片上的實作，包括實體佈局的影響，以及在本章開頭定義的抽象指標的角色。

## Place-and-Route

Topology 的實體設計有兩個元件需要仔細考慮：**Link** 和 **Router**。

### Link 實作

Link 在 Semi-global 或 Global Metal Layer 上路由，取決於 Channel 寬度和它們需要穿越的距離。

**Wire 特性**：
- Wire 電容比電晶體高一個數量級，如果未優化可能主導網路能耗
- 目標時脈頻率決定需要插入的 **Repeater** 的大小和間距以滿足時序

**優化技術**：
- **較粗的 Wire**：配合較大間距可降低 Wire 電阻和耦合電容
- **增加速度和能源效率**：但 Metal Layer 密度規則和 DRC 限制了這些參數的調整空間

**面積考量**：
- Core 到 Core 的 Link 可以路由在 Active Logic 上方，減少面積開銷
- 但需注意電晶體切換可能在 Wire 中引入串擾
- 在低電壓運作的敏感電路（如 SRAM）上方路由切換的 Link 可能引入 Glitch 和錯誤
- Cache 上方的區域通常禁止佈線
- 整個晶片的 Floorplan 需要仔細考慮 Router Link 相對於處理器核心、Cache、Memory Controller 等的位置

### Router 實作

**Node Degree 的影響**：

Node Degree（Router 進出的 Port 數量）決定了開銷，因為每個 Port 都有相關的 Buffer、狀態邏輯，並需要一條 Link 到下一個 Node。

| 元件 | 隨 Degree 增加的影響 |
|------|---------------------|
| Input Buffer Queue | 增加 |
| Allocator Requestors | 增加 |
| Crossbar Ports | 增加 |
| Critical Path Delay | 增加 |
| Area | 增加 |
| Power | 增加 |

::: info Link vs Router 複雜度
Router 複雜度隨著較高 Node Degree 的 Topology 明確增加，但 Link 複雜度不與 Node Degree 直接相關。Link 複雜度取決於 Link 寬度，而面積和功耗開銷與 Wire 數量的相關性更高。如果相同數量的 Wire 分配給 2-port Router 和 3-port Router，Link 複雜度將大致相等。
:::

## Folded Torus

![Figure 3.10: Layout of a 8×8 folded torus](/images/ch03/Figure%203.10.jpg)

Topology 的 2D Floorplan 經常導致實作開銷。例如，Figure 3.1 的 Torus 必須在實體上以 **Folded 形式**排列以均衡 Wire 長度（見 Figure 3.10），而不是在邊緣 Node 之間使用長 Wraparound Link。

### Folded Torus 的特性

- **Wire 長度均衡**：所有 Link 長度大致相等
- **Torus 的 Wire 長度是 Mesh 的兩倍**：由於 Folded Layout

### 設計權衡

如果 Bisection 沿線的可用 Wire Track 固定：
- Torus 將被限制使用比 Mesh 更窄的 Link
- 降低每 Link 頻寬
- 增加傳輸延遲

從架構角度比較：
- Torus 具有較低的 Hop Count（導致較低的延遲和能耗）

這些對比特性說明了在選擇替代 Topology 時考慮實作細節的重要性。

### Irregular Topology 的佈線挑戰

嘗試建立針對應用通訊圖優化的 Irregular Topology 可能導致許多交叉的 Link，這會在 Place-and-Route 期間顯示為 Wire 壅塞，迫使自動化工具繞過壅塞的網路，增加延遲和能耗開銷。

## Abstract Metrics 的意義

### Node Degree

Node Degree 是 Router 複雜度的代理指標。較高的 Degree 意味著更大的 Port 數量，這是 Router Critical Path Delay、Area Footprint 和 Power 的主要貢獻者。

- **Ring**：Node Degree = 2，較低的實作開銷
- **Mesh/Torus**：Node Degree = 4，較高的實作開銷
- **High-radix（如 Flattened Butterfly）**：7 個 Port，更低延遲和更高吞吐量，但面積和能耗開銷更高

### Hop Count

Hop Count 是網路延遲和功耗的代理指標。

::: warning Hop Count 的限制
Hop Count 並不總是與網路延遲相關，因為它嚴重依賴於 Router Pipeline 長度和 Link 傳播延遲。

**範例 1**：
- 2 hop 網路
- Router Pipeline = 5 cycles
- Link 延遲 = 4 cycles（長距離）
- 總延遲 = 2 × (5 + 4) = 18 cycles

**範例 2**：
- 3 hop 網路
- Router Pipeline = 1 cycle
- Link 延遲 = 1 cycle
- 總延遲 = 3 × (1 + 1) = 6 cycles

如果兩個網路具有相同的時脈頻率，具有較高 Hop Count 的後者網路反而更快。
:::

### Maximum Channel Load

Maximum Channel Load 是網路效能和吞吐量的代理指標。

- Topology 上的 Maximum Channel Load 越高，網路中由 Topology 和 Routing Protocol 造成的壅塞越大
- 因此，整體可實現的吞吐量越低
- 也是估計 Peak Power 的良好代理，因為動態功耗在峰值切換活動和網路利用率時最高

### Bisection Bandwidth

Bisection Bandwidth 是定義網路頻寬的常用指標。

- 對於 8 × 8 Mesh，Bisection Link 上的 Channel Load 為 8/4 = 2
- Peak Injection Throughput = 1/2 = 0.5 flits/node/cycle
- 實際吞吐量會因不完美的負載平衡而更低

## 設計建議

::: tip 選擇 Topology 時的考量
除了理論分析，也要考慮：
1. **與實際 Floorplan 的匹配程度**
2. **製程技術的特性**
3. **功耗和面積預算**
4. **Router Pipeline 深度和 Link 延遲**
5. **代表性流量模式下的 Maximum Channel Load**
:::

## 參考資料

- On-Chip Networks Second Edition, Chapter 3.6
