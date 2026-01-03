# Deadlock Avoidance

在選擇或設計 Routing Algorithm 時，除了考慮其對延遲、能耗、吞吐量和可靠性的影響外，大多數應用還需要保證網路的 **Deadlock Freedom**。

## 什麼是 Routing Deadlock

當多個 Message 的路徑之間存在 **Knotted Cycle**（糾結循環）時，就會發生 Deadlock。

![Figure 4.2: 網路 Deadlock 範例](/images/ch04/Figure%204.2.jpg)

Figure 4.2 展示了四個陷入 Gridlock（死鎖）的 Message，它們正在等待其他 Message 持有的 Link，導致沒有任何 Message 能夠繼續前進：

- 從 Router A 的 South Input Port 進入的 Packet 正在等待通過 East Output Port 離開
- 但另一個 Packet 正佔用該 Link，同時等待在 Router B 通過 South Output Port 離開
- 這個 Packet 又被另一個在 Router C 等待離開 West Output Port 的 Packet 阻擋
- 以此類推，形成循環等待

::: info Adaptive Routing 中的 Cycle
在 Adaptive Routing 中，Cycle 是 Deadlock 的必要但非充分條件，因為可能存在跳出此 Cycle 的方法（如透過 Escape Path）。**Knotted Cycle** 更精確地定義了 Deadlock 情況。
:::

## Deadlock Freedom 的保證方法

Deadlock Freedom 可以透過以下方式確保：

1. **Routing Algorithm**：防止演算法生成的路由之間形成 Cycle
2. **Flow Control Protocol**：防止 Router Buffer 以循環方式被獲取和持有

本章討論前者，後者將在 Chapter 5 討論。

## Turn Model 與 Deadlock

Routing Algorithm 可以用允許哪些 **Turn**（轉向）來描述。

![Figure 4.3: 2-D Mesh 中的可能轉向](/images/ch04/Figure%204.3.jpg)

Figure 4.3a 顯示了 2-D Mesh 網路中所有可能的轉向，而 Figure 4.3b 則顯示了 DOR X-Y Routing 允許的有限轉向集合。

### 為什麼需要限制轉向

- **允許所有轉向**會導致循環的資源依賴，進而導致網路 Deadlock
- **禁止某些轉向**可以打破這些循環依賴

### X-Y Routing 的轉向限制

在 X-Y Routing 中：
- 往 East 或 West 方向行進的 Message **可以**轉向 North 或 South
- 往 North 或 South 方向行進的 Message **不能**轉向 East 或 West

Figure 4.3b 中沒有 Cycle，因為 Figure 4.2 中的四個轉向中有兩個不被允許。

## Channel Dependency Graph

用 **Channel Dependency Graph** 來分析是否可能發生 Deadlock：

- **Node**：Channel（Link 或 VC）
- **Edge**：從 Channel A 可能轉到 Channel B

::: warning Deadlock 條件
如果 Channel Dependency Graph 存在 Cycle，則可能發生 Deadlock。
:::

## 避免方法

### 1. Routing Restriction（路由限制）

限制路由選擇以打破 Cycle：

**X-Y Routing 範例**：
- 先走 X 方向，再走 Y 方向
- 不允許 Y → X 的轉向

### 2. Virtual Channel（虛擬通道）

使用 VC 將流量分開：

- 將不同方向的流量分配到不同的 VC
- 打破物理通道上的循環依賴

### 3. Escape Channel（逃逸通道）

保留特殊通道專門用於避免 Deadlock：

- 當 Packet 陷入潛在 Deadlock 時，可以使用 Escape Channel 脫困
- Escape Channel 通常使用 Deadlock-free 的 Routing Algorithm（如 DOR）

## 設計考量

| 方法 | 優點 | 缺點 |
|------|------|------|
| Routing Restriction | 簡單、無額外硬體 | 限制 Path Diversity |
| Virtual Channel | 保留更多 Path Diversity | 增加 Buffer 和複雜度 |
| Escape Channel | 允許 Fully Adaptive Routing | 需要額外的 VC 資源 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 4.2
