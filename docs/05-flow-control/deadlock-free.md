# Deadlock-free Flow Control

本節介紹使用 **Virtual Channel** 來避免 Flow Control 層面的 Deadlock 的方法。這些技術與 Routing 層面的 Deadlock Avoidance（如 Turn Model）相輔相成。

## 回顧：Deadlock 成因

Flow Control Deadlock 發生在 **Channel Dependency Graph (CDG)** 存在 Cycle 時：

- 多個 Packet 互相等待對方釋放 Buffer
- 沒有任何 Packet 能前進
- 整個網路（或部分網路）癱瘓

### 典型場景

在 Ring 或 Torus 中：
- Packet A 佔用 Buffer 0，等待 Buffer 1
- Packet B 佔用 Buffer 1，等待 Buffer 2
- Packet C 佔用 Buffer 2，等待 Buffer 3
- Packet D 佔用 Buffer 3，等待 Buffer 0
- **形成 Cycle → Deadlock！**

## 解決方案概覽

| 方法 | 核心思想 | VC 需求 |
|------|----------|---------|
| Dateline | 在特定邊界切換 VC，打破 Cycle | 2 個 VC |
| Escape VC | 保留一個 Deadlock-free 的逃生 VC | 至少 2 個 VC |
| Bubble Flow Control | 保證 Ring 中有空位，避免 Cycle 形成 | 不需要額外 VC |

## Dateline (VC Partitioning)

**Dateline** 是一種在 Ring 或 Torus 網路中打破 CDG Cycle 的簡單方法。

![Figure 5.7: Dateline 在 Torus 中的應用](/images/ch05/Figure%205.7.jpg)

### 核心思想

在 Ring/Torus 中設置一條「Dateline」（虛擬邊界）：
- 所有 Packet 從 VC 0 開始
- 當跨越 Dateline 時，**必須切換到 VC 1**
- 之後繼續使用 VC 1 直到到達目的地

### 為何能打破 Cycle

以 Figure 5.7 為例：

1. **原本的 Cycle**：Buffer 0 → Buffer 1 → Buffer 2 → Buffer 3 → Buffer 0
2. **加入 Dateline 後**：
   - VC 0: Buffer 0 → Buffer 1 → Buffer 2 → Buffer 3
   - 跨越 Dateline 時切換到 VC 1
   - VC 1: Buffer 0' → Buffer 1' → Buffer 2' → Buffer 3'
   - **VC 1 不會回到 VC 0，Cycle 被打破！**

### 優點

| 優點 | 說明 |
|------|------|
| 簡單 | 只需 2 個 VC 和一條 Dateline |
| 低開銷 | 不需要複雜的判斷邏輯 |
| 確定性 | 保證 Deadlock-free |

### 缺點

| 缺點 | 說明 |
|------|------|
| 需要 VC | 必須有至少 2 個 VC |
| 不平衡 | 靠近 Dateline 的 VC 1 Buffer 壓力較大 |

## Escape Virtual Channels

**Escape VC** 是一種更靈活的方法，允許大部分流量使用 Adaptive Routing（可能有 Cycle），但保留一個「逃生通道」使用 Deadlock-free Routing。

![Figure 5.8: Escape Virtual Channel](/images/ch05/Figure%205.8.jpg)

### 核心思想

1. **分配 VC**：
   - VC 0, VC 1, ...：可使用 Adaptive Routing（提高效能）
   - VC E（Escape VC）：只能使用 Deadlock-free Routing（如 DOR）

2. **正常運作**：
   - Packet 使用 VC 0, VC 1 等，享受 Adaptive Routing 的好處

3. **遇到阻塞時**：
   - 如果無法前進，Packet 可以切換到 Escape VC
   - 在 Escape VC 中使用 Deadlock-free Routing 繼續前進
   - 保證最終能到達目的地

### 為何能保證 Deadlock-free

- Escape VC 使用 Deadlock-free Routing（如 Dimension-ordered）
- 即使其他 VC 形成 Cycle，Escape VC 永遠有一條出路
- 只要有一個 Packet 能移動，就不會 Deadlock

### 優點

| 優點 | 說明 |
|------|------|
| 靈活 | 大部分流量可使用 Adaptive Routing |
| 高效能 | 正常情況下不會犧牲效能 |
| 通用 | 適用於各種 Topology |

### 缺點

| 缺點 | 說明 |
|------|------|
| 需要額外 VC | 至少需要 1 個 Escape VC |
| 實作複雜 | 需要判斷何時切換到 Escape VC |
| Escape VC 可能成為瓶頸 | 高負載時 Escape VC 可能擁塞 |

## Bubble Flow Control

**Bubble Flow Control** 是一種不需要額外 VC 的方法，透過保證 Ring 中永遠有空位來避免 Deadlock。

![Figure 5.9: Bubble Flow Control](/images/ch05/Figure%205.9.jpg)

### 核心思想

**Injection Restriction**：只有當 Ring Buffer 中有超過一個空位時，才允許注入新 Packet。

這保證了：
- Ring 中永遠有至少一個空位（Bubble）
- 至少有一個 Packet 可以移動到空位
- 因此不會形成完全停滯的 Cycle

### 規則

以 Figure 5.9 為例：

$$
\text{可注入條件} = (\text{Buffer 空位數} > 1)
$$

或更精確地：

$$
\text{可注入條件} = (\text{Buffer 佔用數} < \text{Buffer 大小} - 1)
$$

### 運作範例

1. Ring 有 4 個 Buffer，目前 2 個佔用
2. 新 Packet 想注入 → 檢查：2 < 4-1 = 3 → **允許注入**
3. 現在 3 個佔用
4. 另一個 Packet 想注入 → 檢查：3 < 3 → **拒絕注入**
5. 必須等待 Ring 中有 Packet 離開

### 優點

| 優點 | 說明 |
|------|------|
| 不需要額外 VC | 節省面積 |
| 簡單的控制邏輯 | 只需計算 Buffer 佔用數 |
| 適用於 Ring | 特別適合 Ring Topology |

### 缺點

| 缺點 | 說明 |
|------|------|
| 降低吞吐量 | 保留的 Bubble 浪費了 Buffer 空間 |
| 可能增加延遲 | 注入被拒絕時需要等待 |
| 僅適用於 Ring | 較難推廣到複雜 Topology |

## 方法比較

| 方法 | VC 需求 | 效能影響 | 適用 Topology | 實作複雜度 |
|------|---------|----------|---------------|------------|
| Dateline | 2 VC | 低 | Ring/Torus | 低 |
| Escape VC | 額外 1 VC | 低（正常時） | 通用 | 中 |
| Bubble | 不需要 | 中（吞吐量下降） | Ring | 低 |

## 選擇建議

- **Ring/Torus 網路**：Dateline 最簡單有效
- **需要 Adaptive Routing**：Escape VC 提供最佳靈活性
- **面積受限**：Bubble 不需要額外 VC
- **已有多個 VC**：結合使用（如部分 VC 用於 Traffic Separation，部分用於 Deadlock Avoidance）

## 與 Routing Deadlock Avoidance 的關係

::: info 兩個層面的 Deadlock Avoidance
1. **Routing 層面**：使用 Turn Model 等限制可用的 Turn，從源頭避免 CDG Cycle
2. **Flow Control 層面**：使用 VC 打破 Cycle，允許更靈活的 Routing

兩者可以結合使用，例如：
- 使用 Adaptive Routing 提高效能
- 使用 Escape VC 保證 Deadlock-free
:::

## 參考資料

- On-Chip Networks Second Edition, Chapter 5.6
