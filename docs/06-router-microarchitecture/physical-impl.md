# Physical Implementation

Router 的物理實作需要考慮 **Floorplan**、**Buffer** 選擇、**Wire** 設計等因素。良好的物理設計對達成高頻率和低功耗至關重要。

## Router Floorplan

![Figure 6.19: Router Floorplans](/images/ch06/Figure%206.19.jpg)

Figure 6.19 展示了兩種 Router Floorplan 策略：

### Symmetric Floorplan

Figure 6.19a 展示了對稱的 Router Floorplan：

- 將 Router 分成 **4 個象限**（一個方向一個象限）
- 每個象限包含輸入 Buffer、Allocator 和 Crossbar 的一部分
- **優點**：均勻的 Wire 延遲
- **缺點**：需要協調跨象限的 Allocation

### Non-symmetric Floorplan

Figure 6.19b 展示了非對稱的 Router Floorplan：

- 將 Router 功能模組集中放置
- Input Buffer、Crossbar、Allocator 各自成區塊
- **優點**：控制邏輯集中，設計較簡單
- **缺點**：不同 Port 可能有不同延遲

### Floorplan 考量

| 考量因素 | Symmetric | Non-symmetric |
|----------|-----------|---------------|
| Wire 長度 | 均勻 | 不均勻 |
| 設計複雜度 | 高 | 低 |
| Timing Closure | 較容易 | 需仔細平衡 |
| 適用場景 | 高頻率設計 | 一般設計 |

## Buffer Implementation

Buffer 是 Router 中面積和功耗最大的元件（佔約 70% 面積）。選擇合適的實作方式至關重要。

### SRAM-based Buffer

使用標準 SRAM 實作 Buffer：

| 特性 | 說明 |
|------|------|
| **密度** | 最高（每 bit 約 6 Transistor） |
| **功耗** | 較低（尤其是 Leakage） |
| **速度** | 需要 1-2 Cycle 存取 |
| **適用** | 大 Buffer（> 32 entries） |

**注意事項**：
- 需要 Memory Compiler 產生
- 有最小尺寸限制
- 多 Port SRAM 面積成本高

### Register File-based Buffer

使用 Register File 實作 Buffer：

| 特性 | 說明 |
|------|------|
| **密度** | 中等 |
| **功耗** | 中等 |
| **速度** | 單 Cycle 存取 |
| **適用** | 中等 Buffer（8-32 entries） |

**注意事項**：
- 可合成
- 支援多讀/寫埠
- 比 SRAM 快但比 Flip-flop 慢

### Flip-flop-based Buffer

使用 Flip-flop 實作 Buffer：

| 特性 | 說明 |
|------|------|
| **密度** | 最低 |
| **功耗** | 最高 |
| **速度** | 最快 |
| **適用** | 小 Buffer（< 8 entries） |

**注意事項**：
- 直接合成
- 每個 bit 約 20+ Transistor
- 適合 VC 狀態等小型儲存

### Buffer 實作比較

| 實作方式 | 面積 | 速度 | 功耗 | 適用場景 |
|----------|------|------|------|----------|
| SRAM | 小 | 慢 | 低 | 大型 Data Buffer |
| Register File | 中 | 中 | 中 | 中型 Buffer |
| Flip-flop | 大 | 快 | 高 | VC 狀態、小型 Buffer |

## Wire 與 Link 設計

On-chip Network 的 Link Wire 佔用顯著的面積和功耗。

### Metal Layer 選擇

| Metal Layer | 特性 | 用途 |
|-------------|------|------|
| **Lower Layers** | 窄、高電阻 | 元件內部連線 |
| **Middle Layers** | 中等 | Router 內部連線 |
| **Upper Layers** | 寬、低電阻 | Router 間的 Link |

**設計原則**：
- Long Link 使用 Upper Metal Layer
- 減少 Wire 電阻和延遲
- 需考慮 Crosstalk 和 Coupling

### Repeater 插入

長 Wire 需要插入 Repeater 來維持訊號品質：

- **插入間距**：約每 1-2mm 一個 Repeater
- **功能**：恢復訊號強度和斜率
- **Trade-off**：增加延遲但改善訊號完整性

### Wire 延遲模型

Wire 延遲公式：

$$
t_{wire} = 0.4 \times R_{wire} \times C_{wire}
$$

對於長 Wire，延遲與長度的**平方**成正比，這是需要 Repeater 的原因。

## Crossbar 實作

### Crossbar 佈局

Crossbar 通常放置在 Router 中央：

- 最小化到各輸入/輸出 Port 的 Wire 長度
- 使用 Custom Layout 可達到最佳效能
- 合成的 Crossbar 可能有較長的 Critical Path

### Crossbar 優化

| 技術 | 效果 |
|------|------|
| Custom Layout | 最佳化 Wire 長度 |
| Segmented Crossbar | 減少面積 |
| Low-swing Signaling | 減少功耗 |

## 設計流程

### RTL to GDSII

1. **RTL Design**：Verilog/VHDL 設計
2. **Synthesis**：轉換為 Gate-level Netlist
3. **Floorplanning**：決定模組位置
4. **Place & Route**：放置 Cell 和繞線
5. **Timing Analysis**：確認滿足 Timing Constraint
6. **Power Analysis**：確認功耗預算

### 迭代優化

設計通常需要多次迭代：

- **Timing 不符**：調整 Pipeline 或加 Buffer
- **功耗過高**：加 Clock Gating 或降低頻率
- **面積過大**：減少 Buffer 或使用 SRAM

## 設計建議

| 元件 | 建議實作 | 原因 |
|------|----------|------|
| Data Buffer | SRAM | 最佳密度 |
| VC 狀態 | Register | 需要快速存取 |
| Crossbar | Custom 或 Synthesis | 視頻率需求 |
| Link | Upper Metal | 最低延遲 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 6.7
