# Adaptive Routing

更精細的 Routing Algorithm 可以是 **Adaptive**（自適應）的，即 Message 從 A 到 B 所採用的路徑取決於網路流量狀況。例如，Message 可能正在沿著 X-Y 路由前進，在 (1,0) 的 East 出口 Link 看到擁塞，並選擇改走 North 出口 Link 朝向目的地（見 Figure 4.1）。

## 基本概念

Adaptive Routing 根據當前網路狀態（如 Buffer 佔用率、Link 負載）動態選擇路徑。

### 資訊來源

可以利用本地或全域資訊來做出 Adaptive Routing 決策：

| 資訊類型 | 來源 | 說明 |
|----------|------|------|
| Queue Occupancy | 本地 Router | Buffer 佔用率 |
| Queuing Delay | 本地 Router | 排隊延遲 |
| Credits | 鄰居 Router | Flow Control 的 Backpressure 機制 |
| Congestion 指標 | 可能需要特殊機制 | 全域擁塞資訊 |

Flow Control 使用的 Backpressure 機制允許擁塞資訊從擁塞點傳播回網路。

## Path Diversity

![Figure 4.5: Adaptive Routing 範例](/images/ch04/Figure%204.5.jpg)

Figure 4.5 顯示了 Message 從 Node (0,0) 到 Node (2,3) 可以採取的所有可能（Minimal）路由。共有 **9 條可能的路徑**。

只利用 Minimal Path 的 Adaptive Routing Algorithm 可以利用大量的 Path Diversity 來提供 Load Balancing 和 Fault Tolerance。

## 分類

### Minimal Adaptive Routing

Adaptive Routing 可以限制只採用 Source 和 Destination 之間的 Minimal Route。

### Non-minimal Adaptive（Misrouting）

另一種選擇是採用 **Misrouting**，允許 Packet 往非生產性方向路由，導致 Non-minimal Path。

::: warning Livelock 問題
當允許 Misrouting 時，**Livelock** 成為一個問題。沒有保證前進進度的機制，Packet 可能不斷被 Misroute 而永遠無法到達目的地。

**解決方法**：
- 限制每個 Packet 的最大 Misroute 次數
- 給已被多次 Misroute 的 Packet 更高優先權

Misrouting 會增加 Hop Count，但可能透過避免擁塞（排隊延遲）來降低端到端 Packet 延遲。
:::

## Adaptive Routing 的挑戰

### 1. Deadlock 問題

使用 Fully Adaptive Routing Algorithm 時，Deadlock 可能成為問題。例如，Figure 4.1 中顯示的 Adaptive Route 是 Oblivious Routing 的超集，因此容易發生潛在的 Deadlock。

**解決方案**：
- **Planar-adaptive Routing**：限制一次只在兩個維度內適應
- **Duato's Protocol**：允許完全的路由適應性，同時確保 Deadlock Freedom（詳見 Chapter 5）

### 2. Message Ordering

Coherence Protocol 可能需要保持 Inter-message Ordering。如果 Message 必須以 Source 發出的順序到達目的地，Adaptive Routing 可能有問題。

**解決方案**：
- 在目的地重新排序 Message
- 限制特定類別的 Message 使用 Deterministic Routing 以防止重排序

## Adaptive Turn Model Routing

Turn Model Routing 消除達到 Deadlock Freedom 所需的最小轉向集合，同時保留一些 Path Diversity 和適應性潛力。

![Figure 4.6: Turn Model Routing](/images/ch04/Figure%204.6.jpg)

DOR 只允許 2-D Mesh 中可用的 8 種轉向中的 4 種。**Turn Model Routing** 透過允許 8 種轉向中的 6 種來增加靈活性，只從每個 Cycle 中消除一個轉向。

### 三種 Turn Model Routing Algorithm

Figure 4.6 展示了三種可能的 Routing Algorithm：

#### West-First（Figure 4.6a）

- 消除 North to West 轉向
- 另外消除 South to West 轉向
- Message 必須**先往 West 方向**行進，然後才能往其他方向
- 允許的轉向：W→N, W→S, W→E, N→E, N→S, S→E, S→N, E→N, E→S
- 禁止的轉向：N→W, S→W, E→W

#### North-Last（Figure 4.6b）

- 消除 North to West 和 North to East 轉向
- 一旦 Message 轉向 North，就不允許再轉向
- **North 轉向必須最後執行**

#### Negative-First（Figure 4.6c）

- 消除 North to West 和 East to South 轉向
- Message 必須**先往負方向**（West 和 South）行進
- 然後才允許往正方向（East 和 North）行進

### 無效的 Turn Model

![Figure 4.7: Turn Model Deadlock](/images/ch04/Figure%204.7.jpg)

Figure 4.7 說明了一種無效的轉向消除。消除 North to West 結合消除 West to North 可能導致 Deadlock。Figure 4.7b 描繪了使用 Figure 4.7a 中指定的轉向可能導致的 Deadlock Cycle。

## Negative-First Routing 範例

![Figure 4.8: Negative-First Routing 範例](/images/ch04/Figure%204.8.jpg)

Figure 4.8 將 Negative-First Turn Model Routing 應用於兩個不同的 Source-Destination pair：

### 高 Path Diversity 案例（Figure 4.8a）

從 (0,0) 到 (2,3)：
- 顯示了三條可能的路由（實際上有更多可能）
- 允許 North to East 和 East to North 的轉向，提供顯著的靈活性

### 低 Path Diversity 案例（Figure 4.8b）

從 (0,3) 到 (2,0)：
- 只有**一條**路徑被 Algorithm 允許
- Routing Algorithm 不允許 East to South 的轉向
- **必須先完成負方向路由**，因此沒有 Path Diversity

::: tip Turn Model 的限制
如此範例所示，Turn Model Routing 提供比 DOR 更多的靈活性和適應性，但仍有一定限制。
:::

## Odd-Even Turn Model Routing

**Odd-Even Turn Model Routing** 根據當前 Node 是在奇數還是偶數 Column 來消除不同的轉向集合：

### 偶數 Column 的規則
- 禁止 East to North 和 North to West 轉向

### 奇數 Column 的規則
- 禁止 East to South 和 South to West 轉向

### 特點

- 禁止 180° 轉向
- 比 West-First 等其他 Turn Model Algorithm 提供更好的適應性
- 對於給定 Column 有根據允許轉向的靈活性

## 設計考量

| 特性 | DOR | Turn Model | Fully Adaptive |
|------|-----|------------|----------------|
| 允許轉向數 | 4/8 | 6/8 | 8/8 |
| Path Diversity | 無 | 部分 | 完全 |
| Deadlock Freedom | 天然保證 | 天然保證 | 需要額外機制 |
| 實作複雜度 | 最低 | 中等 | 最高 |
| Load Balance | 差 | 中等 | 最佳 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 4.5
